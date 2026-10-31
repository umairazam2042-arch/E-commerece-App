import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import StatCard from '../../components/vendor/StatCard';
import { getErrorMessage } from '../../utils/getErrorMessage';

// Har status ki total count, limit 1 par sirf total chahiye
const countFor = async (status) => {
  const res = await adminApi.vendors({ status, page: 1, limit: 1 });
  return res.total ?? 0;
};

const AdminDashboardPage = () => {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([countFor('pending'), countFor('approved'), countFor('rejected')])
      .then(([pending, approved, rejected]) => setCounts({ pending, approved, rejected }))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 p-3 text-red-600">{error}</p>;
  if (!counts) return <p className="text-center text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending vendor applications" value={counts.pending} />
        <StatCard label="Approved vendors" value={counts.approved} />
        <StatCard label="Rejected applications" value={counts.rejected} />
      </div>

      <p className="text-sm text-slate-500">
        Revenue aur commission ke analytics abhi backend mein nahi hain. Jab analytics module server par add hoga, tab ye cards wapas aa sakte hain.
      </p>
    </div>
  );
};

export default AdminDashboardPage;