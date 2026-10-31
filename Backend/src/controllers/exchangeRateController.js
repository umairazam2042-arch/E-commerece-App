const asyncHandler = require('../utils/asyncHandler');
const currencyService = require('../services/currencyService');

const listRates = asyncHandler(async (req, res) => {
  const rates = await currencyService.listRates();
  res.json({ success: true, data: { rates } });
});

const upsertRate = asyncHandler(async (req, res) => {
  const rate = await currencyService.upsertRate(req.body);
  res.json({ success: true, message: 'Exchange rate saved', data: { rate } });
});

module.exports = { listRates, upsertRate };