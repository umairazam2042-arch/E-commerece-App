import { useEffect, useState } from 'react';

// Number ko 0 se target tak smoothly count karta hai
const useCountUp = (target, duration = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof target !== 'number') return;

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

const StatCard = ({ label, value, hint }) => {
  const animated = useCountUp(value);
  const display = typeof value === 'number' ? animated : value;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 origin-center scale-x-0 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-500 transition-transform duration-500 group-hover:scale-x-100"
      />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{display}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
};

export default StatCard;