const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const AppError = require('../utils/AppError');
const appEvents = require('../utils/events');

const DEFAULT_THRESHOLD = 5;

const emitLowStockIfCrossed = (product, previousStock, newStock) => {
  const threshold = product.lowStockThreshold ?? DEFAULT_THRESHOLD;
  if (previousStock > threshold && newStock <= threshold) {
    appEvents.emit('stock:low', {
      productId: product._id,
      vendorId: product.vendor,
      title: product.title,
      stock: newStock,
      threshold,
    });
  }
};

// Atomic stock change. Stock kam hone par filter ki wajah se
// stock kabhi negative nahi hoga.
const adjustStock = async ({
  vendorId,
  productId,
  change,
  type = 'adjustment',
  reason = '',
  actorId,
}) => {
  if (!change) throw new AppError('Change cannot be zero', 400);

  const filter = { _id: productId, vendor: vendorId };
  if (change < 0) filter.stock = { $gte: Math.abs(change) };

  // new: false => update se pehle ka document milega
  const before = await Product.findOneAndUpdate(
    filter,
    { $inc: { stock: change } },
    { new: false }
  );

  if (!before) {
    const exists = await Product.exists({ _id: productId, vendor: vendorId });
    if (!exists) throw new AppError('Product not found', 404);
    throw new AppError('Insufficient stock for this change', 409);
  }

  const previousStock = before.stock;
  const newStock = previousStock + change;

  try {
    await StockMovement.create({
      product: productId,
      vendor: vendorId,
      type,
      change,
      previousStock,
      newStock,
      reason,
      actor: actorId,
    });
  } catch (err) {
    // Movement save nahi hua to stock wapas karein (compensating rollback)
    await Product.updateOne({ _id: productId }, { $inc: { stock: -change } });
    throw err;
  }

  emitLowStockIfCrossed(before, previousStock, newStock);

  return { productId: String(productId), previousStock, newStock };
};

const setThreshold = async ({ vendorId, productId, lowStockThreshold }) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, vendor: vendorId },
    { lowStockThreshold },
    { new: true }
  ).select('title stock lowStockThreshold');

  if (!product) throw new AppError('Product not found', 404);
  return product;
};

// Har item ke liye alag adjust hota hai. Ek item fail ho to baqi chalte rehte hain.
const bulkUpdateStock = async ({ vendorId, updates, actorId }) => {
  const ids = updates.map((u) => u.productId);
  const products = await Product.find({ _id: { $in: ids }, vendor: vendorId })
    .select('stock')
    .lean();

  const map = new Map(products.map((p) => [String(p._id), p]));
  const results = { updated: [], failed: [] };

  for (const u of updates) {
    const product = map.get(u.productId);

    if (!product) {
      results.failed.push({ productId: u.productId, reason: 'Product not found' });
      continue;
    }

    const change = u.stock - product.stock;
    if (change === 0) {
      results.updated.push({ productId: u.productId, newStock: u.stock, unchanged: true });
      continue;
    }

    try {
      const r = await adjustStock({
        vendorId,
        productId: u.productId,
        change,
        type: 'bulk_update',
        reason: 'Bulk stock update',
        actorId,
      });
      results.updated.push(r);
    } catch (err) {
      results.failed.push({ productId: u.productId, reason: err.message });
    }
  }

  return results;
};

const getLowStock = (vendorId) =>
  Product.find({
    vendor: vendorId,
    status: 'published',
    $expr: {
      $lte: ['$stock', { $ifNull: ['$lowStockThreshold', DEFAULT_THRESHOLD] }],
    },
  })
    .select('title sku stock lowStockThreshold images')
    .sort({ stock: 1 })
    .lean();

const listMovements = async ({ vendorId, productId, page, limit, type }) => {
  const owned = await Product.exists({ _id: productId, vendor: vendorId });
  if (!owned) throw new AppError('Product not found', 404);

  const filter = { product: productId };
  if (type) filter.type = type;

  const [items, total] = await Promise.all([
    StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    StockMovement.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

module.exports = {
  adjustStock,
  setThreshold,
  bulkUpdateStock,
  getLowStock,
  listMovements,
};