const { z } = require('zod');

const exchangeRateSchema = z.object({
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, 'Currency code must be 3 letters (e.g. USD)'),
  rate: z.number().positive('Rate must be greater than 0'),
  isActive: z.boolean().default(true),
});

module.exports = { exchangeRateSchema };