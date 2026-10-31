import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/getErrorMessage';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    adminApi
      .categories()
      .then(setCategories)
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.createCategory({ name: name.trim() });
      setName('');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    setBusyId(c._id);
    setError('');
    try {
      await adminApi.updateCategory(c._id, { isActive: !c.isActive });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nayi category ka naam"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add'}
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {!categories ? (
        <p className="text-center text-slate-500">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-slate-500">Abhi koi category nahi hai.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
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
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={busyId === c._id}
                      className="text-indigo-600 hover:underline disabled:opacity-50"
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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

export default AdminCategoriesPage;