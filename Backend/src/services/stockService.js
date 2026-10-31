const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const AppError = require('../utils/AppError');

// Stock wapas karta hai. log: true ho to 'release' movement bhi save hota hai
const restoreStock = async (items, { vendorId, reason = 'Order release', actorId = null, log = true } = {}) => {
  await Promise.all(
    items.map(async (item) => {
      const before = await Product.findOneAndUpdate(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
        { new: false }
      );
      if (log && before) {
        await StockMovement.create({
          product: item.product,
          vendor: vendorId,
          type: 'release',
          change: item.quantity,
          previousStock: before.stock,
          newStock: before.stock + item.quantity,
          reason,
          actor: actorId,
        });
      }
    })
  );
};

// Stock atomic tarike se kam hota hai. Kisi line mein kami ho to sab wapas.
// Movements return hote hain, jo order save hone ke baad likhe jate hain.
const reserveStock = async (lines, { reason, actorId = null }) => {
  const reserved = [];
  const movements = [];

  for (const line of lines) {
    const before = await Product.findOneAndUpdate(
      { _id: line.product, status: 'published', stock: { $gte: line.quantity } },
      { $inc: { stock: -line.quantity } },
      { new: false }
    );

    if (!before) {
      await restoreStock(reserved, { log: false });
      throw new AppError(`Stock changed for "${line.title}", please review your cart`, 409);
    }

    reserved.push(line);
    movements.push({
      product: line.product,
      vendor: line.vendor,
      type: 'sale',
      change: -line.quantity,
      previousStock: before.stock,
      newStock: before.stock - line.quantity,
      reason,
      actor: actorId,
    });
  }

  return movements;
};

const saveMovements = (movements) => (movements.length ? StockMovement.insertMany(movements) : []);

module.exports = { restoreStock, reserveStock, saveMovements };