const STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-sky-100 text-sky-800',
  confirmed: 'bg-sky-100 text-sky-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-rose-100 text-rose-800',
  refunded: 'bg-slate-200 text-slate-700',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
      STYLES[status] ?? 'bg-slate-200 text-slate-700'
    }`}
  >
    {status}
  </span>
);

export default StatusBadge;