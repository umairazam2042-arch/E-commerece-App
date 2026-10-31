import { useEffect, useState } from 'react';
import { vendorApi } from '../../api/vendorApi';
import Pagination from '../../components/common/Pagination';
import { formatPrice } from '../../utils/formatPrice';
import { getErrorMessage } from '../../utils/getErrorMessage';

const FILTERS = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-sky-100 text-sky-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

const CANCEL_CONFIRM = 'Kya aap ye order cancel karna chahte hain? Stock wapas aa jayega.';

const ACTIONS = {
  pending: [
    { to: 'processing', label: 'Processing shuru karein', primary: true },
    { to: 'cancelled', label: 'Order cancel karein', confirm: CANCEL_CONFIRM },
  ],
  processing: [
    { to: 'shipped', label: 'Shipped mark karein', primary: true },
    { to: 'cancelled', label: 'Order cancel karein', confirm: CANCEL_CONFIRM },
  ],
  shipped: [
    {
      to: 'delivered',
      label: 'Delivered mark karein (buyer ne le liya)',
      primary: true,
      confirm: 'Kya buyer ne ye order le liya hai?',
    },
  ],
};

const VendorOrdersPage = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    vendorApi
      .orders({ page, limit: 10, ...(status && { status }) })
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
  }, [page, status, reloadKey]);

  const changeStatus = async (sub, action) => {
    if (action.confirm && !window.confirm(action.confirm)) return;
    setBusyId(sub._id);
    setError('');
    try {
      await vendorApi.updateOrderStatus(sub._id, action.to);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const items = data.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {FILTERS.map((s) => (
            <option key={s} value={s}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Sab orders'}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-center text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-slate-500">Abhi koi order nahi hai.</p>
      ) : (
        <div className="space-y-4">
          {items.map((sub) => {
            const o = sub.order || {};
            const addr = o.shippingAddress || {};
            const actions = ACTIONS[sub.status] ?? [];
            const busy = busyId === sub._id;

            return (
              <article key={sub._id} className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200">
                <header className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{o.orderNumber}</p>
                    <p className="text-xs text-slate-500">
                      {o.createdAt && new Date(o.createdAt).toLocaleString('en-PK')}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${BADGE[sub.status] ?? ''}`}
                  >
                    {sub.status}
                  </span>
                </header>

                <section className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-slate-800">Buyer: {o.customer?.name || '—'}</p>
                  {o.customer?.email && <p className="text-slate-600">{o.customer.email}</p>}
                  <p className="text-slate-600">Phone: {addr.phone || '—'}</p>
                  <p className="text-slate-600">
                    Address: {[addr.addressLine, addr.city, addr.postalCode, addr.country].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-slate-500">
                    Payment: {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card (Stripe)'} · {o.paymentStatus}
                  </p>
                </section>

                <ul className="divide-y text-sm">
                  {sub.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between py-2">
                      <span className="text-slate-700">
                        {it.title} × {it.quantity}
                      </span>
                      <span>{formatPrice(it.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Aap ki kamai</span>
                  <span className="font-bold text-emerald-600">{formatPrice(sub.vendorEarning)}</span>
                </div>

                {actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {actions.map((a) => (
                      <button
                        key={a.to}
                        type="button"
                        disabled={busy}
                        onClick={() => changeStatus(sub, a)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                          a.primary
                            ? 'btn-sheen text-white'
                            : 'border border-rose-300 text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        {busy ? 'Ruk jayein...' : a.label}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
};

export default VendorOrdersPage;