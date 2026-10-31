import { useState } from 'react';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';

const StockAdjustForm = ({ saving = false, onSubmit }) => {
  const [mode, setMode] = useState('add'); // 'add' ya 'remove'
  const [qty, setQty] = useState('');
  const [type, setType] = useState('restock');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Stock kam karte waqt type hamesha 'adjustment' hoga
  const effectiveType = mode === 'add' ? type : 'adjustment';

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 1) {
      setError('Quantity 1 ya us se zyada whole number honi chahiye.');
      return;
    }
    setError('');
    onSubmit({
      change: mode === 'add' ? n : -n,
      type: effectiveType,
      reason: reason.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode('add')}
          className={`rounded-lg py-2 text-sm font-semibold transition ${
            mode === 'add'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
        >
          + Stock barhayein
        </button>
        <button
          type="button"
          onClick={() => setMode('remove')}
          className={`rounded-lg py-2 text-sm font-semibold transition ${
            mode === 'remove'
              ? 'bg-rose-600 text-white shadow-md'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
        >
          − Stock kam karein
        </button>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Quantity</span>
        <input
          type="number"
          min="1"
          step="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className={inputCls}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Type</span>
        <select
          value={effectiveType}
          disabled={mode === 'remove'}
          onChange={(e) => setType(e.target.value)}
          className={`${inputCls} disabled:bg-slate-100`}
        >
          <option value="restock">Restock (naya maal aaya)</option>
          <option value="adjustment">Adjustment (count theek kiya)</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Wajah (optional)</span>
        <input
          value={reason}
          maxLength={200}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Jaise: warehouse count, damaged item"
          className={inputCls}
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-sheen w-full rounded-lg py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        {saving ? 'Save ho raha hai...' : 'Stock update karein'}
      </button>
    </form>
  );
};

export default StockAdjustForm;