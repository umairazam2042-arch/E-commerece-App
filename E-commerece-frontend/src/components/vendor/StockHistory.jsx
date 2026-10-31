import { useEffect, useState } from 'react';
import { vendorApi } from '../../api/vendorApi';
import Pagination from '../common/Pagination';
import { getErrorMessage } from '../../utils/getErrorMessage';

const TYPES = [
  { value: '', label: 'Sab types' },
  { value: 'restock', label: 'Restock' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'bulk_update', label: 'Bulk update' },
  { value: 'sale', label: 'Sale' },
  { value: 'release', label: 'Release (cancel)' },
];

const TYPE_LABEL = Object.fromEntries(TYPES.map((t) => [t.value, t.label]));

const StockHistory = ({ productId }) => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [data, setData] = useState({ items: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    vendorApi
      .stockMovements(productId, { page, limit: 8, ...(type && { type }) })
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
  }, [productId, page, type]);

  const items = data.items ?? [];

  return (
    <div className="space-y-3">
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setPage(1);
        }}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-center text-sm text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-slate-500">Abhi koi movement nahi hai.</p>
      ) : (
        <ul className="divide-y text-sm">
          {items.map((m) => (
            <li key={m._id} className="space-y-0.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-800">{TYPE_LABEL[m.type] ?? m.type}</span>
                <span className={`font-bold ${m.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.change > 0 ? `+${m.change}` : m.change}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {m.previousStock} → {m.newStock} · {new Date(m.createdAt).toLocaleString('en-PK')}
              </p>
              {m.reason && <p className="text-xs text-slate-600">{m.reason}</p>}
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
};

export default StockHistory;