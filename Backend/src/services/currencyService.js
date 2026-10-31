const ExchangeRate = require('../models/ExchangeRate');
const AppError = require('../utils/AppError');
const { CURRENCY } = require('../config/platform');

const getRate = async (currency) => {
  const code = (currency || CURRENCY).toUpperCase();

  if (code === CURRENCY) {
    return { currency: CURRENCY, rate: 1 };
  }

  const row = await ExchangeRate.findOne({ currency: code, isActive: true });
  if (!row) {
    throw new AppError(`Currency ${code} is not supported`, 400);
  }
  return { currency: code, rate: row.rate };
};

// Base PKR paisa ko display currency ke minor units mein badalta hai
const toMinorUnits = (pkrPaisa, rate) => Math.round(pkrPaisa * rate);

const listRates = () => ExchangeRate.find().sort({ currency: 1 });

const upsertRate = async ({ currency, rate, isActive }) => {
  if (currency === CURRENCY) {
    throw new AppError(`${CURRENCY} is the base currency, no rate needed`, 400);
  }
  return ExchangeRate.findOneAndUpdate(
    { currency },
    { rate, isActive },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

module.exports = { getRate, toMinorUnits, listRates, upsertRate };