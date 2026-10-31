import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import Pagination from '../../components/common/Pagination';
import { getErrorMessage } from '../../utils/getErrorMessage';

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const AdminVendorsPage = () => {
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    adminApi
      .vendors({ status, page, limit: 10 })
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
  }, [status, page, reloadKey]);

  const runAction = async (vendorId, action) => {
    setBusyId(vendorId);
    setError('');
    try {
      await action();
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = (vendorId) =>
    runAction(vendorId, () => adminApi.approveVendor(vendorId));

  const handleReject = (vendorId) => {
    const reason = window.prompt('Rejection ki wajah likhein (kam az kam 5 characters):');
    if (reason === null) return;
    if (reason.trim().length < 5) {
      setError('Reason kam az kam 5 characters ka hona chahiye.');
      return;
    }
    runAction(vendorId, () => adminApi.rejectVendor(vendorId, reason.trim()));
  };

  const items = data.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setStatus(t.value);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              status === t.value
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-300 text-slate-600 hover:bg-slate-100'
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
        <p className="text-center text-slate-500">Is status mein koi vendor nahi hai.</p>
      ) : (
        <div className="space-y-3">
          {items.map((v) => (
            <div
              key={v._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 ring-1 ring-slate-200"
            >
              <div>
                <p className="font-semibold text-slate-800">{v.storeName ?? 'Vendor'}</p>
                <p className="text-sm text-slate-500">
                  {v.user?.name ?? '—'} · {v.user?.email ?? ''}
                </p>
                <p className="text-xs text-slate-400">
                  Apply kiya: {new Date(v.createdAt).toLocaleDateString('en-PK')}
                </p>
              </div>

              <div className="flex gap-2">
                {v.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(v._id)}
                    disabled={busyId === v._id}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
                  >
                    Approve
                  </button>
                )}
                {v.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(v._id)}
                    disabled={busyId === v._id}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
    </div>
  );
};

export default AdminVendorsPage;