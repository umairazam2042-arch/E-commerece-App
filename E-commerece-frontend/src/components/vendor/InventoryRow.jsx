import { useState } from 'react';
import { vendorApi } from '../../api/vendorApi';
import { getErrorMessage } from '../../utils/getErrorMessage';
import StockAdjustForm from './StockAdjustForm';
import StockHistory from './StockHistory';

const inputCls =
  'w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none';

const InventoryRow = ({ product, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [threshold, setThreshold] = useState(String(product.lowStockThreshold ?? 0));
  const [error, setError] = useState('');
  const isLow = product.stock <= (product.lowStockThreshold ?? 0);

  const adjust = async (payload) => {
    setSaving(true);
    setError('');
    try {
      await vendorApi.adjustStock(product._id, payload);
      setHistoryKey((k) => k + 1);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveThreshold = async () => {
    const n = Number(threshold);
    if (!Number.isInteger(n) || n < 0 || n > 1000) {
      setError('Threshold 0 se 1000 ke beech whole number ho.');
      return;
    }
    setError('');
    try {
      await vendorApi.setThreshold(product._id, n);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">{product.title}</p>
          <p className="text-sm text-slate-500">
            Stock: <span className="font-semibold text-slate-800">{product.stock}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLow && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              Low stock
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            {open ? 'Band karein' : 'Stock manage karein'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-600">Low alert:</span>
        <input
          type="number"
          min="0"
          max="1000"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className={inputCls}
        />
        <button
          type="button"
          onClick={saveThreshold}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Save
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {open && (
        <div className="grid gap-6 border-t pt-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Stock adjust</h3>
            <StockAdjustForm saving={saving} onSubmit={adjust} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">History</h3>
            <StockHistory key={`${product._id}-${historyKey}`} productId={product._id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryRow;