const Product = require('../models/Product');
const { cacheGet, cacheSet, getVersion, buildKey } = require('../utils/cache');

const PUBLIC_FIELDS = {
  title: 1,
  price: 1,
  images: 1,
  category: 1,
  vendor: 1,
  stock: 1,
  sku: 1,
  ratingAverage: 1,
  ratingCount: 1,
};

const SORTS = {
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  rating: { ratingAverage: -1, ratingCount: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 },
};

const searchProducts = async ({ q, category, minPrice, maxPrice, sort, page, limit }) => {
  const version = await getVersion('products');
  const key = buildKey('search', version, { q, category, minPrice, maxPrice, sort, page, limit });

  const cached = await cacheGet(key);
  if (cached) return cached;

  const filter = { status: 'published' };
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  // relevance: agar q hai to text score se, warna newest se
  const useScore = sort === 'relevance' && Boolean(q);
  const projection = useScore
    ? { ...PUBLIC_FIELDS, score: { $meta: 'textScore' } }
    : PUBLIC_FIELDS;

  let sortSpec;
  if (useScore) sortSpec = { score: { $meta: 'textScore' } };
  else sortSpec = SORTS[sort] || SORTS.newest;

  const [items, total] = await Promise.all([
    Product.find(filter, projection)
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const result = { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  await cacheSet(key, result);
  return result;
};

// Search box ke neeche suggestions
const suggest = async ({ q }) => {
  const version = await getVersion('products');
  const key = buildKey('suggest', version, { q });

  const cached = await cacheGet(key);
  if (cached) return cached;

  const items = await Product.find(
    { status: 'published', $text: { $search: q } },
    { title: 1, score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(8)
    .lean();

  const result = items.map((i) => ({ id: i._id, title: i.title }));
  await cacheSet(key, result, 120);
  return result;
};

module.exports = { searchProducts, suggest };