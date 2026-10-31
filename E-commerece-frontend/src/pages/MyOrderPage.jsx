import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import StatusBadge from '../components/order/StatusBadge';
import { formatPrice } from '../utils/formatPrice';
import { getErrorMessage } from '../utils/getErrorMessage';

const formatLeft = (ms) => {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} ghante ${m} minute` : `${m} minute`;
};

const MyOrderPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(
    () => orderApi.getById(id).then(setData).catch((err) => setError(getErrorMessage(err))),
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Countdown har 30 second mein refresh hota hai
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleCancel = async () => {
    if (!window.confirm('Kya aap ye order cancel karna chahte hain?')) return;
    setBusy(true);
    setError('');
    try {
      await orderApi.cancel(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) return <p className="text-center text-red-600">{error}</p>;
  if (!data) return <p className="text-center text-slate-500">Loading...</p>;

  const { order, subOrders = [], cancel } = data;
  const left = cancel?.deadline ? new Date(cancel.deadline).getTime() - now : 0;
  const canCancel = Boolean(cancel?.allowed) && left > 0;
  const items = subOrders.flatMap((s) => s.items ?? []);
  const addr = order.shippingAddress || {};

  let notice = null;
  if (canCancel) {
    notice = {
      tone: 'bg-amber-50 text-amber-900 ring-amber-200',
      text: `Aap ke paas ${formatLeft(left)} hain is order ko cancel karne ke liye.`,
    };
  } else if (order.status === 'cancelled') {
    notice = { tone: 'bg-rose-50 text-rose-900 ring-rose-200', text: 'Ye order cancel ho chuka hai.' };
  } else if (!cancel?.allowed && order.status !== 'delivered') {
    notice = {
      tone: 'bg-slate-100 text-slate-700 ring-slate-200',
      text: 'Ab ye order cancel nahi ho sakta (muddat khatam ho gayi ya ship ho chuka hai).',
    };
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString('en-PK')}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {notice && (
        <div className={`rounded-xl p-4 text-sm ring-1 ${notice.tone}`}>{notice.text}</div>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="mb-3 font-semibold text-slate-800">Items</h2>
        <ul className="divide-y text-sm">
          {items.map((item, idx) => (
            <li key={idx} className="flex justify-between py-2">
              <span className="text-slate-700">
                {item.title} × {item.quantity}
              </span>
              <span>{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span>- {formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Shipping</span>
            <span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-bold">
            <span>Total</span>
            <span className="text-indigo-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-800">Shipping address</h2>
        <p className="text-sm text-slate-600">
          {[addr.fullName, addr.phone, addr.addressLine, addr.city, addr.postalCode, addr.country]
            .filter(Boolean)
            .join(', ')}
        </p>
        <p className="text-sm text-slate-500">
          Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card (Stripe)'}
        </p>
      </section>

      {subOrders.length > 0 && (
        <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="mb-2 font-semibold text-slate-800">Vendor ke hisaab se status</h2>
          <ul className="space-y-2 text-sm">
            {subOrders.map((sub) => (
              <li key={sub._id} className="flex items-center justify-between">
                <span className="text-slate-600">{sub.vendor?.storeName ?? 'Vendor'}</span>
                <StatusBadge status={sub.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {busy ? 'Cancel ho raha hai...' : 'Order cancel karein'}
          </button>
        )}
        <Link to="/products" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">
          Shopping jaari rakhein
        </Link>
      </div>
    </div>
  );
};

export default MyOrderPage;