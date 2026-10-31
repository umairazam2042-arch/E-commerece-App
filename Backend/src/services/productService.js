const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

const normalizeSku = (sku) => (sku ? sku.trim().toUpperCase() : sku);

const getApprovedVendor = async (userId) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }
  if (vendor.status !== 'approved') {
    throw new AppError('Only approved vendors can manage products', 403);
  }
  return vendor;
};

const getVendorOrThrow = async (userId) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }
  return vendor;
};

const ensureCategoryActive = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category || !category.isActive) {
    throw new AppError('Category not found or inactive', 404);
  }
};

const ensureSkuFree = async (sku, excludeId) => {
  if (!sku) return;
  const filter = excludeId ? { sku, _id: { $ne: excludeId } } : { sku };
  if (await Product.exists(filter)) {
    throw new AppError('SKU already in use', 409);
  }
};

const findMyProduct = async (userId, productId) => {
  const vendor = await getVendorOrThrow(userId);
  const product = await Product.findOne({ _id: productId, vendor: vendor._id });
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

// ----- Vendor -----

const createProduct = async (userId, data) => {
  const vendor = await getApprovedVendor(userId);
  await ensureCategoryActive(data.category);

  const sku = normalizeSku(data.sku);
  await ensureSkuFree(sku);

  return Product.create({ ...data, sku, vendor: vendor._id });
};

const listMyProducts = async (userId, { status, page, limit }) => {
  const vendor = await getVendorOrThrow(userId);
  const filter = { vendor: vendor._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const updateMyProduct = async (userId, productId, data) => {
  const product = await findMyProduct(userId, productId);

  if (data.category) {
    await ensureCategoryActive(data.category);
  }
  if (data.sku !== undefined) {
    data.sku = normalizeSku(data.sku);
    await ensureSkuFree(data.sku, product._id);
  }

  Object.assign(product, data);
  await product.save();
  return product;
};

const removeMyProduct = async (userId, productId) => {
  const product = await findMyProduct(userId, productId);
  await product.deleteOne();
};

// ----- Public -----

const listPublicProducts = async ({ q, category, minPrice, maxPrice, sort, page, limit }) => {
  const filter = { status: 'published' };

  if (category) filter.category = category;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (q) filter.$text = { $search: q };

  const projection = q ? { score: { $meta: 'textScore' } } : undefined;
  const sortOption = q ? { score: { $meta: 'textScore' } } : SORTS[sort];

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find(filter, projection)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('vendor', 'storeName storeSlug'),
    Product.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getPublicProduct = async (productId) => {
  const product = await Product.findOne({ _id: productId, status: 'published' })
    .populate('category', 'name slug')
    .populate('vendor', 'storeName storeSlug');

  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

module.exports = {
  createProduct,
  listMyProducts,
  updateMyProduct,
  removeMyProduct,
  listPublicProducts,
  getPublicProduct,
};