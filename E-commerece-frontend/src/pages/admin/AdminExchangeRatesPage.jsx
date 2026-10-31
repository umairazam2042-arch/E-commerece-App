import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/getErrorMessage';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';

const EMPTY = { from: 'USD', to: 'PKR', rate: '' };

const AdminExchangeRatesPage = () => {
  const [rates, setRates] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () =>
    adminApi
      .exchangeRates()
      .then(setRates)
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!(Number(form.rate) > 0)) {
      setError('Rate sahi likhein (0 se zyada).');
      return;
    }

    setSaving(true);
    try {
      await adminApi.setExchangeRate({
        from: form.from.trim().toUpperCase(),
        to: form.to.trim().toUpperCase(),
        rate: Number(form.rate),
      });
      setSuccess('Rate save ho gaya.');
      setForm({ ...EMPTY, from: form.from, to: form.to });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Exchange Rates</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="font-semibold text-slate-800">Rate update karein</h2>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">From</label>
            <input value={form.from} onChange={set('from')} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">To</label>
            <input value={form.to} onChange={set('to')} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Rate</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={form.rate}
              onChange={set('rate')}
              placeholder="e.g. 280.50"
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Save ho raha hai...' : 'Rate save karein'}
        </button>
      </form>

      {!rates ? (
        <p className="text-center text-slate-500">Loading...</p>
      ) : rates.length === 0 ? (
        <p className="text-center text-slate-500">Abhi koi rate set nahi hai.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Pair</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r._id ?? `${r.from}-${r.to}`} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {r.from} → {r.to}
                  </td>
                  <td className="px-4 py-3">{r.rate}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {r.updatedAt ? new Date(r.updatedAt).toLocaleString('en-PK') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminExchangeRatesPage;