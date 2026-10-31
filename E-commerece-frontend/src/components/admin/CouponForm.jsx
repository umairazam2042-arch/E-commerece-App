import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../utils/getErrorMessage';

const EMPTY = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '0',
  usageLimit: '',
  expiresAt: '',
};

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';

const toPayload = (f) => {
  const isFixed = f.discountType === 'fixed';
  return {
    code: f.code.trim().toUpperCase(),
    discountType: f.discountType,
    discountValue: isFixed ? Math.round(Number(f.discountValue) * 100) : Number(f.discountValue),
    minOrderAmount: Math.round(Number(f.minOrderAmount || 0) * 100),
    ...(f.usageLimit && { usageLimit: Number(f.usageLimit) }),
    ...(f.expiresAt && { expiresAt: new Date(f.expiresAt).toISOString() }),
  };
};

const validate = (f) => {
  if (!f.code.trim()) return 'Coupon code zaroori hai.';
  if (!(Number(f.discountValue) > 0)) return 'Discount value sahi likhein.';
  if (f.discountType === 'percent' && Number(f.discountValue) > 100) {
    return 'Percent 100 se zyada nahi ho sakta.';
  }
  return '';
};

const CouponForm = ({ onCreated }) => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await adminApi.createCoupon(toPayload(form));
      setForm(EMPTY);
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200">
      <h2 className="font-semibold text-slate-800">Naya coupon</h2>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <input placeholder="Code (e.g. SAVE10)" value={form.code} onChange={set('code')} className={inputCls} />
        <select value={form.discountType} onChange={set('discountType')} className={inputCls}>
          <option value="percent">Percent (%)</option>
          <option value="fixed">Fixed (PKR)</option>
        </select>
        <input
          type="number"
          min="0"
          placeholder={form.discountType === 'percent' ? 'Discount %' : 'Discount (PKR)'}
          value={form.discountValue}
          onChange={set('discountValue')}
          className={inputCls}
        />
        <input
          type="number"
          min="0"
          placeholder="Minimum order (PKR)"
          value={form.minOrderAmount}
          onChange={set('minOrderAmount')}
          className={inputCls}
        />
        <input
          type="number"
          min="1"
          placeholder="Usage limit (khali = unlimited)"
          value={form.usageLimit}
          onChange={set('usageLimit')}
          className={inputCls}
        />
        <input type="date" value={form.expiresAt} onChange={set('expiresAt')} className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {saving ? 'Save ho raha hai...' : 'Coupon banayein'}
      </button>
    </form>
  );
};

export default CouponForm;