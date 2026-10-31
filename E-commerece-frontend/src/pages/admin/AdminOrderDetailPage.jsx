import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminOrderApi } from '../../api/adminOrderApi';
import StatusBadge from '../../components/order/StatusBadge';
import { formatPrice } from '../../utils/formatPrice';
import { getErrorMessage } from '../../utils/getErrorMessage';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminOrderApi.getById(id).then(setData).catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!data) return <p className="text-center text-slate-500">Loading...</p>;

  const { order, subOrders } = data;
  const addr = order.shippingAddress || {};

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString('en-PK')}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className="grid gap-4 rounded-xl bg-white p-5 ring-1 ring-slate-200 sm:grid-cols-2">
        <div className="space-y-1 text-sm">
          <h2 className="font-semibold text-slate-800">Customer</h2>
          <p>{order.customer?.name || '—'}</p>
          <p className="text-slate-500">{order.customer?.email}</p>
        </div>
        <div className="space-y-1 text-sm">
          <h2 className="font-semibold text-slate-800">Shipping</h2>
          <p>{[addr.fullName, addr.phone].filter(Boolean).join(' · ')}</p>
          <p className="text-slate-600">
            {[addr.addressLine, addr.city, addr.postalCode, addr.country].filter(Boolean).join(', ')}
          </p>
          <p className="text-slate-500">
            Payment: {order.paymentMethod === 'cod' ? 'COD' : 'Stripe'} · {order.paymentStatus}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Vendors ke sub-orders</h2>
        {subOrders.map((sub) => (
          <article key={sub._id} className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <header className="flex items-center justify-between">
              <p className="font-semibold text-slate-800">{sub.vendor?.storeName ?? 'Vendor'}</p>
              <StatusBadge status={sub.status} />
            </header>
            <ul className="divide-y text-sm">
              {sub.items.map((it, idx) => (
                <li key={idx} className="flex justify-between py-2">
                  <span>
                    {it.title} × {it.quantity}
                  </span>
                  <span>{formatPrice(it.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Vendor ki kamai</span>
              <span>{formatPrice(sub.vendorEarning)}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="flex justify-between text-sm">
        <Link to="/admin/orders" className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100">
          Sab orders
        </Link>
        <span className="text-lg font-bold text-indigo-600">Total: {formatPrice(order.total)}</span>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;