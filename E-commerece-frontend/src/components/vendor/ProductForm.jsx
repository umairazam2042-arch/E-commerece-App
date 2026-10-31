import { useState } from 'react';
import ImageUploader from './ImageUploader';

export const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  stock: '',
  lowStockThreshold: '5',
  categoryId: '',
  status: 'published',
  images: [],
};

// Product (paisa) se form values (PKR)
export const toFormValues = (p) => ({
  title: p.title ?? '',
  description: p.description ?? '',
  price: String((p.price ?? 0) / 100),
  stock: String(p.stock ?? ''),
  lowStockThreshold: String(p.lowStockThreshold ?? 5),
  categoryId: p.category?._id ?? p.category ?? '',
  status: p.status ?? 'published',
  images: p.images ?? [],
});

// Form values (PKR) se backend payload (paisa)
export const toPayload = (f) => ({
  title: f.title.trim(),
  description: f.description.trim(),
  price: Math.round(Number(f.price) * 100),
  stock: Number(f.stock),
  lowStockThreshold: Number(f.lowStockThreshold || 0),
  category: f.categoryId,
  status: f.status,
  images: f.images,
});

const validate = (f) => {
  if (!f.title.trim()) return 'Title zaroori hai.';
  if (!(Number(f.price) > 0)) return 'Price sahi likhein.';
  if (f.stock === '' || Number(f.stock) < 0) return 'Stock sahi likhein.';
  if (!f.categoryId) return 'Category chunein.';
  return '';
};

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';

const ProductForm = ({ initial = EMPTY_FORM, categories, submitting, onSubmit }) => {
  const [form, setForm] = useState(initial);
  const [localError, setLocalError] = useState('');

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const problem = validate(form);
    if (problem) {
      setLocalError(problem);
      return;
    }
    setLocalError('');
    onSubmit(toPayload(form));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 ring-1 ring-slate-200">
      {localError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{localError}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <input value={form.title} onChange={set('title')} className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea rows={4} value={form.description} onChange={set('description')} className={inputCls} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Price (PKR)</label>
          <input type="number" min="0" value={form.price} onChange={set('price')} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Stock</label>
          <input type="number" min="0" value={form.stock} onChange={set('stock')} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Low stock alert</label>
          <input
            type="number"
            min="0"
            value={form.lowStockThreshold}
            onChange={set('lowStockThreshold')}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
            <option value="">Category chunein</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select value={form.status} onChange={set('status')} className={inputCls}>
            <option value="published">Published (customers ko dikhe ga)</option>
            <option value="draft">Draft (sirf aap ko dikhe ga)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Product images</label>
        <ImageUploader
          value={form.images}
          onChange={(images) => setForm((f) => ({ ...f, images }))}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? 'Save ho raha hai...' : 'Product save karein'}
      </button>
    </form>
  );
};

export default ProductForm;