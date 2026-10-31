import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import CouponForm from '../../components/admin/CouponForm';
import Pagination from '../../components/common/Pagination';
import { formatPrice } from '../../utils/formatPrice';
import { getErrorMessage } from '../../utils/getErrorMessage';

const describeDiscount = (c) =>
  c.discountType === 'percent' ? `${c.discountValue}%` : formatPrice(c.discountValue);

const AdminCouponsPage = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    adminApi
      .coupons({ page, limit: 10 })
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

  const reload = () => setReloadKey((k) => k + 1);

  const toggleActive = async (c) => {
    setError('');
    try {
      await adminApi.updateCoupon(c._id, { isActive: !c.isActive });
      reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const items = data.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Coupons</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          {showForm ? 'Band karein' : 'Naya coupon'}
        </button>
      </div>

      {showForm && (
        <CouponForm
          onCreated={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-center text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-slate-500">Abhi koi coupon nahi hai.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">{c.code}</td>
                  <td className="px-4 py-3">{describeDiscount(c)}</td>
                  <td className="px-4 py-3">{formatPrice(c.minOrderAmount ?? 0)}</td>
                  <td className="px-4 py-3">
                    {c.usedCount ?? 0}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-PK') : 'Kabhi nahi'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(c)} className="text-indigo-600 hover:underline">
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
};

export default AdminCouponsPage;