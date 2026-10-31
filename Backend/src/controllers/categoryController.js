const asyncHandler = require('../utils/asyncHandler');
const categoryService = require('../services/categoryService');

// Public: sirf active categories
const listPublic = asyncHandler(async (req, res) => {
  const categories = await categoryService.getTree({ activeOnly: true });
  res.json({ success: true, data: { categories } });
});

// Admin: inactive categories bhi
const listAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getTree({ activeOnly: false });
  res.json({ success: true, data: { categories } });
});

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, message: 'Category created', data: { category } });
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  res.json({ success: true, message: 'Category updated', data: { category } });
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { listPublic, listAll, create, update, remove };