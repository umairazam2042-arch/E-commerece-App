import { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import ProductFilters, { DEFAULT_FILTERS } from '../components/product/ProductFilters';
import Pagination from '../components/common/Pagination';
import Reveal from '../components/common/Reveal';
import { getErrorMessage } from '../utils/getErrorMessage';

const LIMIT = 12;

// Frontend PKR mein input leta hai, backend paisa mein leta hai
const buildParams = (filters, page) => {
  const params = { page, limit: LIMIT, sort: filters.sort };
  if (filters.q.trim()) params.q = filters.q.trim();
  if (filters.minPrice) params.minPrice = Math.round(Number(filters.minPrice) * 100);
  if (filters.maxPrice) params.maxPrice = Math.round(Number(filters.maxPrice) * 100);
  return params;
};

const hasActiveFilters = (f) =>
  Boolean(f.q.trim() || f.minPrice || f.maxPrice || f.sort !== DEFAULT_FILTERS.sort);

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
    <div className="h-52 animate-pulse bg-slate-200" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
    </div>
  </div>
);

const ProductsPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    productApi
      .search(buildParams(filters, page))
      .then((res) => {
        if (!ignore) {
          setData(res);
          setError('');
        }
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filters, page]);

  const handleFilters = (next) => {
    setFilters(next);
    setPage(1);
  };

  const items = data.items ?? [];
  const filtered = hasActiveFilters(filters);

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? 'Dhoond rahe hain...' : `${data.total ?? items.length} products mil gaye`}
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <ProductFilters filters={filters} onChange={handleFilters} />
      </Reveal>

      {error && <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Reveal>
          <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-200">
            <p className="text-lg font-semibold text-slate-700">
              {filtered ? 'Is search par koi product nahi mila.' : 'Abhi koi product available nahi hai.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {filtered ? 'Filters badal kar dobara try karein.' : 'Vendor ke products add karne par yahan dikhenge.'}
            </p>
            {filtered && (
              <button
                onClick={() => handleFilters(DEFAULT_FILTERS)}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Filters reset karein
              </button>
            )}
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p._id} delay={Math.min(i, 8) * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
};

export default ProductsPage;