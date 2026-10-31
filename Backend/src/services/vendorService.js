const Vendor = require('../models/Vendor');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const slugify = require('../utils/slugify');

const ensureStoreNameAvailable = async (storeSlug, excludeVendorId) => {
  const filter = { storeSlug };
  if (excludeVendorId) {
    filter._id = { $ne: excludeVendorId };
  }

  const taken = await Vendor.exists(filter);
  if (taken) {
    throw new AppError('This store name is already taken', 409);
  }
};

// Customer vendor banne ke liye apply karta hai.
// Rejected application dobara bhej sakta hai (record update hota hai).
const applyForVendor = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role !== 'customer') {
    throw new AppError('Only customer accounts can apply to become a vendor', 403);
  }

  const existing = await Vendor.findOne({ user: userId });

  if (existing?.status === 'pending') {
    throw new AppError('Your application is already under review', 409);
  }

  const storeSlug = slugify(data.storeName);
  await ensureStoreNameAvailable(storeSlug, existing?._id);

  if (existing) {
    Object.assign(existing, data, {
      storeSlug,
      status: 'pending',
      rejectionReason: '',
      reviewedBy: null,
      reviewedAt: null,
    });
    await existing.save();
    return existing;
  }

  return Vendor.create({ ...data, user: userId, storeSlug });
};

const getMyVendor = async (userId) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new AppError('No vendor application found for this account', 404);
  }
  return vendor;
};

// Sirf approved vendor apni store profile edit kar sakta hai.
const updateMyVendor = async (userId, data) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  if (vendor.status !== 'approved') {
    throw new AppError('Store profile can be edited only after approval', 403);
  }

  if (data.storeName) {
    const storeSlug = slugify(data.storeName);
    await ensureStoreNameAvailable(storeSlug, vendor._id);
    vendor.storeName = data.storeName;
    vendor.storeSlug = storeSlug;
  }

  if (data.description !== undefined) vendor.description = data.description;
  if (data.logo !== undefined) vendor.logo = data.logo;
  if (data.banner !== undefined) vendor.banner = data.banner;

  await vendor.save();
  return vendor;
};

const listApplications = async ({ status, page, limit }) => {
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Vendor.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Vendor.countDocuments(filter),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

const approveVendor = async (vendorId, adminId) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new AppError('Vendor application not found', 404);
  }

  if (vendor.status === 'approved') {
    throw new AppError('This vendor is already approved', 409);
  }

  vendor.status = 'approved';
  vendor.rejectionReason = '';
  vendor.reviewedBy = adminId;
  vendor.reviewedAt = new Date();
  await vendor.save();

  // Role DB se har request par read hota hai, is liye dobara login ki zaroorat nahi
  await User.updateOne({ _id: vendor.user }, { role: 'vendor' });

  return vendor;
};

const rejectVendor = async (vendorId, adminId, reason) => {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw new AppError('Vendor application not found', 404);
  }

  if (vendor.status !== 'pending') {
    throw new AppError('Only pending applications can be rejected', 409);
  }

  vendor.status = 'rejected';
  vendor.rejectionReason = reason;
  vendor.reviewedBy = adminId;
  vendor.reviewedAt = new Date();
  await vendor.save();

  return vendor;
};

module.exports = {
  applyForVendor,
  getMyVendor,
  updateMyVendor,
  listApplications,
  approveVendor,
  rejectVendor,
};