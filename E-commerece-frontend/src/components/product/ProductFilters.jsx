export const DEFAULT_FILTERS = {
  q: '',
  minPrice: '',
  maxPrice: '',
  sort: 'relevance',
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';

const ProductFilters = ({ filters, onChange }) => {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-6">
      <input
        className={`${inputCls} lg:col-span-2`}
        placeholder="Search products..."
        value={filters.q}
        onChange={set('q')}
      />
      <input
        type="number"
        min="0"
        className={inputCls}
        placeholder="Min (PKR)"
        value={filters.minPrice}
        onChange={set('minPrice')}
      />
      <input
        type="number"
        min="0"
        className={inputCls}
        placeholder="Max (PKR)"
        value={filters.maxPrice}
        onChange={set('maxPrice')}
      />
      <select className={inputCls} value={filters.sort} onChange={set('sort')}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
        onClick={() => onChange(DEFAULT_FILTERS)}
      >
        Reset
      </button>
    </div>
  );
};

export default ProductFilters;