const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const ExchangeRate = require('../src/models/ExchangeRate');

let counter = 0;
const next = () => ++counter;

const createCustomer = () =>
  User.create({
    name: 'Customer',
    email: `customer${next()}@test.com`,
    password: 'Password123',
    role: 'customer',
  });

const createVendor = async () => {
  const n = next();
  const user = await User.create({
    name: 'Vendor',
    email: `vendor${n}@test.com`,
    password: 'Password123',
    role: 'vendor',
  });

  return Vendor.create({
    user: user._id,
    storeName: `Store ${n}`,
    storeSlug: `store-${n}`,
    status: 'approved',
    businessInfo: {
      ownerType: 'individual',
      addressLine: 'Test Street 1',
      city: 'Karachi',
      cnic: '3520212345671',
    },
    bankDetails: {
      bankName: 'Test Bank',
      accountTitle: 'Test Vendor',
      accountNumber: '1234567890',
    },
  });
};

const createProduct = async ({ vendor, price = 100000, stock = 10 }) => {
  const n = next();
  const category = await Category.create({ name: `Cat ${n}`, slug: `cat-${n}` });
  return Product.create({
    vendor: vendor._id,
    category: category._id,
    title: `Product ${n}`,
    description: 'Test product',
    price, // paisa mein
    stock,
    status: 'published',
  });
};

const createPkrRate = () =>
  ExchangeRate.create({ currency: 'PKR', rate: 1, isActive: true });

module.exports = { createCustomer, createVendor, createProduct, createPkrRate };