import { useEffect, useState } from 'react';
import { vendorApi } from '../../api/vendorApi';
import StatCard from '../../components/vendor/StatCard';
import { getErrorMessage } from '../../utils/getErrorMessage';

const STATUS_TEXT = {
  pending: 'Aap ki application review ho rahi hai.',
  approved: 'Aap ki store approved hai.',
  rejected: 'Aap ki application reject ho gayi hai.',
};

const VendorDashboardPage = () => {
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    vendorApi
      .myVendor()
      .then(setVendor)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
        <p>{error}</p>
        <p className="mt-1 text-sm">Pehle vendor ke tor par apply karna zaroori hai.</p>
      </div>
    );
  }

  if (!vendor) return <p className="text-center text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{vendor.storeName}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Store status" value={vendor.status} />
        <StatCard label="Store slug" value={vendor.storeSlug} />
      </div>

      <p className="text-sm text-slate-600">{STATUS_TEXT[vendor.status]}</p>

      <p className="text-sm text-slate-500">
        Sales, orders aur analytics ke routes abhi backend mein nahi hain. Products, orders aur inventory pages bhi isi wajah se error dengi.
      </p>
    </div>
  );
};

export default VendorDashboardPage;