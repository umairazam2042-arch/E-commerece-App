const Cart = require('../src/models/Cart');
const Product = require('../src/models/Product');
const Coupon = require('../src/models/Coupon');
const orderService = require('../src/services/orderService');
const { createCustomer, createVendor, createProduct, createPkrRate } = require('./factories');

const DAY = 24 * 60 * 60 * 1000;
const address = { fullName: 'Test User', phone: '03001234567', city: 'Karachi', addressLine: 'Street 1' };

const addToCart = (userId, productId, quantity) =>
  Cart.findOneAndUpdate(
    { user: userId },
    { items: [{ product: productId, quantity }] },
    { upsert: true, new: true }
  );
  
const checkoutCOD = (userId, extra = {}) =>
  orderService.checkout(userId, {
    paymentMethod: 'cod',
    currency: 'PKR',
    shippingAddress: address,
    ...extra,
  });

beforeEach(async () => {
  await createPkrRate();
});

test('checkout par stock ghatata hai', async () => {
  const customer = await createCustomer();
  const vendor = await createVendor();
  const product = await createProduct({ vendor, price: 100000, stock: 10 });
  await addToCart(customer._id, product._id, 2);

  const { order } = await checkoutCOD(customer._id);

  expect(order.subtotal).toBe(200000);
  expect((await Product.findById(product._id)).stock).toBe(8);
});

test('galat coupon par stock wapas nahi ghatta (regression)', async () => {
  const customer = await createCustomer();
  const vendor = await createVendor();
  const product = await createProduct({ vendor, price: 100000, stock: 10 });
  await addToCart(customer._id, product._id, 2);

  await expect(checkoutCOD(customer._id, { couponCode: 'NOPE' })).rejects.toThrow(
    'Coupon code galat hai'
  );

  expect((await Product.findById(product._id)).stock).toBe(10);
});

test('valid coupon se discount lagta hai', async () => {
  const customer = await createCustomer();
  const vendor = await createVendor();
  const product = await createProduct({ vendor, price: 100000, stock: 10 });
  await Coupon.create({
    code: 'SAVE10',
    type: 'percent',
    value: 10,
    validFrom: new Date(Date.now() - DAY),
    validTo: new Date(Date.now() + DAY),
  });
  await addToCart(customer._id, product._id, 2);

  const { order } = await checkoutCOD(customer._id, { couponCode: 'SAVE10' });

  expect(order.discount).toBe(20000); // 10% of 200000
  expect(order.total).toBe(200000 - 20000 + 25000); // shipping 25000
});

test('ek user dobara same coupon use nahi kar sakta', async () => {
  const customer = await createCustomer();
  const vendor = await createVendor();
  const product = await createProduct({ vendor, price: 100000, stock: 10 });
  await Coupon.create({
    code: 'ONCE',
    type: 'fixed',
    value: 5000,
    validFrom: new Date(Date.now() - DAY),
    validTo: new Date(Date.now() + DAY),
  });

  await addToCart(customer._id, product._id, 1);
  await checkoutCOD(customer._id, { couponCode: 'ONCE' });

  await addToCart(customer._id, product._id, 1);
  await expect(checkoutCOD(customer._id, { couponCode: 'ONCE' })).rejects.toThrow(
    'pehle hi use kar chuke'
  );
});

test('cancel par stock aur coupon usage wapas hote hain', async () => {
  const customer = await createCustomer();
  const vendor = await createVendor();
  const product = await createProduct({ vendor, price: 100000, stock: 10 });
  await Coupon.create({
    code: 'BACK',
    type: 'fixed',
    value: 5000,
    validFrom: new Date(Date.now() - DAY),
    validTo: new Date(Date.now() + DAY),
  });
  await addToCart(customer._id, product._id, 2);

  const { order } = await checkoutCOD(customer._id, { couponCode: 'BACK' });
  await orderService.cancelMyOrder(customer._id, order._id);

  expect((await Product.findById(product._id)).stock).toBe(10);
  expect((await Coupon.findOne({ code: 'BACK' })).usedCount).toBe(0);
});