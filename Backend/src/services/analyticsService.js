const mongoose = require('mongoose');
const SubOrder = require('../models/SubOrder');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const AppError = require('../utils/AppError');

const TZ = 'Asia/Karachi';
const DAY = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 366;

// from/to ko Pakistan time ke hisaab se Date mein badalta hai
const parseRange = ({ from, to }) => {
  const end = to ? new Date(`${to}T23:59:59.999+05:00`) : new Date();
  const start = from
    ? new Date(`${from}T00:00:00.000+05:00`)
    : new Date(end.getTime() - 30 * DAY);

  if (isNaN(start) || isNaN(end)) throw new AppError('Invalid date', 400);
  if (start > end) throw new AppError('"from" date "to" se pehle honi chahiye', 400);
  if (end - start > MAX_RANGE_DAYS * DAY) {
    throw new AppError(`Date range ${MAX_RANGE_DAYS} din se zyada nahi ho sakti`, 400);
  }

  return { start, end };
};

const vendorMatch = (vendorId, start, end) => ({
  vendor: new mongoose.Types.ObjectId(vendorId),
  createdAt: { $gte: start, $lte: end },
  status: { $ne: 'cancelled' },
});

// ---------- VENDOR ----------

const vendorSummary = async ({ vendorId, from, to }) => {
  const { start, end } = parseRange({ from, to });

  const [row] = await SubOrder.aggregate([
    { $match: vendorMatch(vendorId, start, end) },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        grossSales: { $sum: '$subtotal' },
        commission: { $sum: '$commissionAmount' },
        pendingEarning: {
          $sum: { $cond: [{ $ne: ['$status', 'delivered'] }, '$vendorEarning', 0] },
        },
        settledEarning: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$vendorEarning', 0] },
        },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return {
    from: start,
    to: end,
    orders: row?.orders || 0,
    grossSales: row?.grossSales || 0,
    commission: row?.commission || 0,
    pendingEarning: row?.pendingEarning || 0,
    settledEarning: row?.settledEarning || 0,
  };
};

const vendorDaily = ({ vendorId, from, to }) => {
  const { start, end } = parseRange({ from, to });

  return SubOrder.aggregate([
    { $match: vendorMatch(vendorId, start, end) },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } },
        orders: { $sum: 1 },
        grossSales: { $sum: '$subtotal' },
        vendorEarning: { $sum: '$vendorEarning' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', orders: 1, grossSales: 1, vendorEarning: 1 } },
  ]);
};

const vendorTopProducts = ({ vendorId, from, to, limit }) => {
  const { start, end } = parseRange({ from, to });

  return SubOrder.aggregate([
    { $match: vendorMatch(vendorId, start, end) },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        title: { $first: '$items.title' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.lineTotal' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    { $project: { _id: 0, productId: '$_id', title: 1, unitsSold: 1, revenue: 1 } },
  ]);
};

// ---------- ADMIN ----------

const platformOverview = async ({ from, to }) => {
  const { start, end } = parseRange({ from, to });
  const dateMatch = { createdAt: { $gte: start, $lte: end } };

  const [sales] = await SubOrder.aggregate([
    { $match: { ...dateMatch, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        subOrders: { $sum: 1 },
        grossSales: { $sum: '$subtotal' },
        commission: { $sum: '$commissionAmount' },
        vendorEarnings: { $sum: '$vendorEarning' },
      },
    },
    { $project: { _id: 0 } },
  ]);

  const [ordersTotal, ordersCancelled, vendorStatus] = await Promise.all([
    Order.countDocuments(dateMatch),
    Order.countDocuments({ ...dateMatch, status: 'cancelled' }),
    Vendor.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]),
  ]);

  return {
    from: start,
    to: end,
    orders: { total: ordersTotal, cancelled: ordersCancelled },
    subOrders: sales?.subOrders || 0,
    grossSales: sales?.grossSales || 0,
    commission: sales?.commission || 0,
    vendorEarnings: sales?.vendorEarnings || 0,
    vendorsByStatus: vendorStatus,
  };
};

// Har vendor ka commission report, commission ke hisaab se sorted
const commissionReport = async ({ from, to, page, limit }) => {
  const { start, end } = parseRange({ from, to });

  const [result] = await SubOrder.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$vendor',
        subOrders: { $sum: 1 },
        grossSales: { $sum: '$subtotal' },
        commission: { $sum: '$commissionAmount' },
        vendorEarning: { $sum: '$vendorEarning' },
      },
    },
    { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
    { $unwind: '$vendor' },
    {
      $project: {
        _id: 0,
        vendorId: '$_id',
        storeName: '$vendor.storeName',
        subOrders: 1,
        grossSales: 1,
        commission: 1,
        vendorEarning: 1,
      },
    },
    { $sort: { commission: -1 } },
    {
      $facet: {
        items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const total = result?.total[0]?.count || 0;

  return {
    items: result?.items || [],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = {
  vendorSummary,
  vendorDaily,
  vendorTopProducts,
  platformOverview,
  commissionReport,
};