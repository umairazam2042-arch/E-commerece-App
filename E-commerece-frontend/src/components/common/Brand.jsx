import { Link } from 'react-router-dom';

const LogoMark = () => (
  <span className="brand-mark relative inline-flex h-9 w-9 shrink-0">
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="mvGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#mvGrad)" />
      <rect className="mv-cell" style={{ animationDelay: '0s' }} x="9" y="9" width="10" height="10" rx="3" fill="#fff" />
      <rect className="mv-cell" style={{ animationDelay: '0.3s' }} x="21" y="9" width="10" height="10" rx="3" fill="#fff" fillOpacity="0.8" />
      <rect className="mv-cell" style={{ animationDelay: '0.6s' }} x="9" y="21" width="10" height="10" rx="3" fill="#fff" fillOpacity="0.8" />
      <rect className="mv-cell" style={{ animationDelay: '0.9s' }} x="21" y="21" width="10" height="10" rx="3" fill="#fff" fillOpacity="0.55" />
    </svg>
  </span>
);

const VENDOR_LETTERS = 'Vendor'.split('');

const Wordmark = () => (
  <span className="flex items-baseline text-lg font-extrabold tracking-tight sm:text-xl">
    <span className="text-slate-900">Multi</span>
    <span className="brand-shimmer ml-0.5 bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
      {VENDOR_LETTERS.map((ch, i) => (
        <span key={i} className="brand-letter" style={{ animationDelay: `${i * 0.12}s` }}>
          {ch}
        </span>
      ))}
    </span>
  </span>
);

const Brand = () => (
  <Link to="/" className="group flex shrink-0 items-center gap-2 sm:gap-2.5">
    <LogoMark />
    <span className="hidden sm:flex">
      <Wordmark />
    </span>
  </Link>
);

export default Brand;