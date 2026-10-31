const CouponBox = ({ value, onChange }) => (
  <label className="block text-sm">
    <span className="mb-1 block font-medium text-slate-700">Coupon code (agar hai)</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      placeholder="SAVE10"
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none"
    />
  </label>
);

export default CouponBox;