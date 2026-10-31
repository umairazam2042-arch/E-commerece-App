const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const btn =
    'rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-40';

  return (
    <div className="flex items-center justify-center gap-4">
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button className={btn} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default Pagination;