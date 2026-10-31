const { z } = require('zod');

const CNIC_REGEX = /^\d{5}-\d{7}-\d$/;

const applyVendorSchema = z.object({
  storeName: z.string().trim().min(3, 'Store name must be at least 3 characters').max(60),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000),
  businessInfo: z
    .object({
      ownerType: z.enum(['individual', 'company'], {
        errorMap: () => ({ message: 'ownerType must be individual or company' }),
      }),
      cnic: z
        .string()
        .trim()
        .regex(CNIC_REGEX, 'CNIC must be in format 12345-1234567-1')
        .optional(),
      registrationNumber: z.string().trim().min(3).max(50).optional(),
      city: z.string().trim().min(2, 'City is required'),
      addressLine: z.string().trim().min(5, 'Address is required'),
    })
    .superRefine((info, ctx) => {
      if (info.ownerType === 'individual' && !info.cnic) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cnic'],
          message: 'CNIC is required for individual sellers',
        });
      }
      if (info.ownerType === 'company' && !info.registrationNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['registrationNumber'],
          message: 'Registration number is required for companies',
        });
      }
    }),
  bankDetails: z.object({
    bankName: z.string().trim().min(2, 'Bank name is required'),
    accountTitle: z.string().trim().min(3, 'Account title is required'),
    accountNumber: z.string().trim().min(8, 'Account number is too short').max(34),
  }),
});

const updateVendorSchema = z
  .object({
    storeName: z.string().trim().min(3).max(60).optional(),
    description: z.string().trim().min(10).max(1000).optional(),
    logo: z.string().url('Logo must be a valid URL').optional(),
    banner: z.string().url('Banner must be a valid URL').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

const rejectVendorSchema = z.object({
  reason: z.string().trim().min(5, 'Rejection reason is required').max(500),
});

const listVendorsQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  applyVendorSchema,
  updateVendorSchema,
  rejectVendorSchema,
  listVendorsQuerySchema,
};