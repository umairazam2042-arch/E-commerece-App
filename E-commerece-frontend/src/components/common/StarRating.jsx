const StarRating = ({ value = 0 }) => {
  const filled = Math.round(Number(value) || 0);
  return (
    <span className="text-amber-500" aria-label={`${filled} out of 5`}>
      {'★'.repeat(filled)}
      <span className="text-slate-300">{'★'.repeat(5 - filled)}</span>
    </span>
  );
};

export default StarRating;