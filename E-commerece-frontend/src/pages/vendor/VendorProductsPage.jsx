import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../api/vendorApi';
import Pagination from '../../components/common/Pagination';
import { formatPrice } from '../../utils/formatPrice';
import { getErrorMessage } from '../../utils/getErrorMessage';

const VendorProductsPage = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    vendorApi
      .products({ page, limit: 10 })
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
  }, [page, reloadKey]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Kya aap ye product delete karna chahte hain?')) return;
    setError('');
    try {
      await vendorApi.deleteProduct(productId);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const items = data.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Mere Products</h1>
        <Link
          to="/vendor/products/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Naya product
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-center text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-slate-500">Abhi koi product nahi hai.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const lowStock = p.stock <= (p.lowStockThreshold ?? 0);
                return (
                  <tr key={p._id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.title}</td>
                    <td className="px-4 py-3">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                                        <td className="space-y-1 px-4 py-3">
                      {p.status === 'published' ? (
                        <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                          Published
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                          Draft
                        </span>
                      )}
                      <br />
                      {lowStock ? (
                        <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                          Low stock
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="space-x-3 px-4 py-3 text-right">
                      <Link to={`/vendor/products/${p._id}/edit`} className="text-indigo-600 hover:underline">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
};

export default VendorProductsPage;