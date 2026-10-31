const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const productService = require('../services/productService');
const {
  listPublicQuerySchema,
  listMineQuerySchema,
} = require('../validators/productValidator');

const parseQuery = (schema, query) => {
  const parsed = schema.safeParse(query);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  return parsed.data;
};

// ----- Public -----

const listPublic = asyncHandler(async (req, res) => {
  const query = parseQuery(listPublicQuerySchema, req.query);
  const result = await productService.listPublicProducts(query);
  res.json({ success: true, data: result });
});

const getPublic = asyncHandler(async (req, res) => {
  const product = await productService.getPublicProduct(req.params.id);
  res.json({ success: true, data: { product } });
});

// ----- Vendor -----

const myList = asyncHandler(async (req, res) => {
  const query = parseQuery(listMineQuerySchema, req.query);
  const result = await productService.listMyProducts(req.user._id, query);
  res.json({ success: true, data: result });
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Product created', data: { product } });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateMyProduct(req.user._id, req.params.id, req.body);
  res.json({ success: true, message: 'Product updated', data: { product } });
});

const remove = asyncHandler(async (req, res) => {
  await productService.removeMyProduct(req.user._id, req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = { listPublic, getPublic, myList, create, update, remove };