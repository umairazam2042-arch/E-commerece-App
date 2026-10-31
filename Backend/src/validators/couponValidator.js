const { z } = require('zod');

const couponShape = {
  code: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[A-Za-z0-9]+$/, 'Code sirf letters aur numbers ho sakta hai')
    .transform((v) => v.toUpperCase()),
  type: z.enum(['percent', 'fixed']),
  value: z.number().int().min(1),
  minOrderAmount: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().min(0).optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  perUserLimit: z.number().int().min(1).default(1),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  isActive: z.boolean().default(true),
};

const createCouponSchema = z.object(couponShape).superRefine((data, ctx) => {
  if (data.validTo <= data.validFrom) {
    ctx.addIssue({ code: 'custom', message: 'validTo, validFrom ke baad honi chahiye' });
  }
  if (data.type === 'percent' && data.value > 100) {
    ctx.addIssue({ code: 'custom', message: 'Percent 100 se zyada nahi ho sakta' });
  }
});

const updateCouponSchema = z.object(couponShape).partial();

const validateCouponSchema = z.object({
  code: z.string().trim().min(1).max(30),
});

const listCouponsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

module.exports = {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
  listCouponsQuerySchema,
};