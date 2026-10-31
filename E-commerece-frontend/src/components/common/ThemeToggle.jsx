import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const SunIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolling, setScrolling] = useState(false);
  const timerRef = useRef(null);

  // Scroll ho raha ho to button blur aur halka dhundla ho jata hai.
  // Scroll ruk ne ke 200ms baad wapas normal.
  useEffect(() => {
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setScrolling(false), 200);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timerRef.current);
    };
  }, []);

  const isDark = theme === 'dark';

  // Scroll ke waqt blur aur opacity, hover par sab wapas (hover:* classes baad mein lagti hain)
  const scrollClasses = scrolling
    ? 'scale-90 opacity-40 blur-[3px]'
    : 'scale-100 opacity-100 blur-0';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Light mode par jayein' : 'Dark mode par jayein'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`group fixed bottom-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-700 shadow-lg backdrop-blur-md transition-all duration-300 ease-out hover:scale-110 hover:opacity-100 hover:blur-0 hover:shadow-xl hover:ring-4 hover:ring-indigo-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-amber-300 ${scrollClasses}`}
    >
      <span className="relative block h-4 w-4">
        <SunIcon
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ease-out ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 h-4 w-4 transition-all duration-500 ease-out ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;