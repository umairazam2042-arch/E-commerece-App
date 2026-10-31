import { useEffect, useState } from 'react';
import { vendorApi } from '../../api/vendorApi';
import Pagination from '../../components/common/Pagination';
import InventoryRow from '../../components/vendor/InventoryRow';
import { getErrorMessage } from '../../utils/getErrorMessage';

const TABS = [
  { key: 'all', label: 'Sab products' },
  { key: 'low', label: 'Low stock' },
];

const VendorInventoryPage = () => {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const request =
      tab === 'low'
        ? vendorApi.lowStock().then((items) => ({ items, totalPages: 1 }))
        : vendorApi.inventory({ page, limit: 10 });

    request
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
  }, [tab, page, reloadKey]);

  const changeTab = (key) => {
    setTab(key);
    setPage(1);
  };

  const items = data.items ?? [];
  const emptyText =
    tab === 'low'
      ? 'Sab products ka stock threshold se upar hai.'
      : 'Abhi koi product nahi hai.';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => changeTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.key
                ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-center text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <InventoryRow key={p._id} product={p} onChanged={() => setReloadKey((k) => k + 1)} />
          ))}
        </div>
      )}

      {tab === 'all' && (
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      )}
    </div>
  );
};

export default VendorInventoryPage;