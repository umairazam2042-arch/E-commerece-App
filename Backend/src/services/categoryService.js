const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const slugify = require('../utils/slugify');
const Product = require('../models/Product');

const MAX_DEPTH = 10;

const makeSlug = (name) => {
  const slug = slugify(name);
  if (!slug) {
    throw new AppError('Name must contain at least one letter or number', 400);
  }
  return slug;
};

const ensureSlugFree = async (slug, excludeId) => {
  const filter = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
  if (await Category.exists(filter)) {
    throw new AppError('A category with this name already exists', 409);
  }
};

const ensureParentExists = async (parentId) => {
  if (!parentId) return null;

  const parent = await Category.findById(parentId);
  if (!parent) {
    throw new AppError('Parent category not found', 404);
  }
  return parent._id;
};

// Check karta hai ke naya parent, category ki hi aulad to nahi (loop na bane)
const createsCycle = async (candidateParentId, categoryId) => {
  let currentId = candidateParentId;

  for (let depth = 0; currentId && depth < MAX_DEPTH; depth++) {
    if (currentId.toString() === categoryId.toString()) return true;

    const current = await Category.findById(currentId).select('parent');
    if (!current) return false;
    currentId = current.parent;
  }
  return false;
};

// Flat list ko tree (parent > children) mein badalta hai
const buildTree = (categories) => {
  const nodes = new Map();
  categories.forEach((c) => nodes.set(c._id.toString(), { ...c.toObject(), children: [] }));

  const roots = [];
  nodes.forEach((node) => {
    const parentKey = node.parent ? node.parent.toString() : null;
    if (parentKey && nodes.has(parentKey)) {
      nodes.get(parentKey).children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
};

const getTree = async ({ activeOnly }) => {
  const filter = activeOnly ? { isActive: true } : {};
  const categories = await Category.find(filter).sort({ name: 1 });
  return buildTree(categories);
};

const createCategory = async ({ name, parent }) => {
  const slug = makeSlug(name);
  await ensureSlugFree(slug);
  const parentId = await ensureParentExists(parent);

  return Category.create({ name, slug, parent: parentId });
};

const updateCategory = async (id, data) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (data.name !== undefined) {
    const slug = makeSlug(data.name);
    await ensureSlugFree(slug, category._id);
    category.name = data.name;
    category.slug = slug;
  }

  if (data.parent !== undefined) {
    if (data.parent === null) {
      category.parent = null;
    } else {
      const parentId = await ensureParentExists(data.parent);
      if (await createsCycle(parentId, category._id)) {
        throw new AppError('A category cannot be moved under itself or its sub-category', 400);
      }
      category.parent = parentId;
    }
  }

  if (data.isActive !== undefined) {
    category.isActive = data.isActive;
  }

  await category.save();
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const hasChildren = await Category.exists({ parent: category._id });
  if (hasChildren) {
    throw new AppError('Delete or move sub-categories first', 409);
  }

  const hasProducts = await Product.exists({ category: category._id });
  if (hasProducts) {
    throw new AppError('Category has products, move or delete them first', 409);
  }

  await category.deleteOne();
};

module.exports = {
  getTree,
  createCategory,
  updateCategory,
  deleteCategory,
};