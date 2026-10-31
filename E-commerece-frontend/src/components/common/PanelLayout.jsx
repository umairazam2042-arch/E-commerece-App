import { NavLink, Outlet, useLocation } from 'react-router-dom';

const PanelLayout = ({ title, links }) => {
  const location = useLocation();

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="h-fit space-y-1 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:sticky md:top-24">
        <p className="brand-shimmer px-3 pb-3 pt-1 text-xs font-extrabold uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
          {title}
        </p>

        {links.map((l, i) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className="animate-reveal panel-link group relative block overflow-hidden rounded-xl px-4 py-2.5"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  style={{ transformOrigin: 'left' }}
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500 ease-out ${
                    isActive
                      ? 'scale-x-100 opacity-100'
                      : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                  }`}
                />
                <span
                  className={`relative z-10 flex items-center justify-between text-sm font-semibold transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-slate-600 group-hover:translate-x-1 group-hover:text-white'
                  }`}
                >
                  {l.label}
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-white transition-all duration-300 ${
                      isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                  />
                </span>
              </>
            )}
          </NavLink>
        ))}
      </aside>

      <section className="min-w-0">
        {/* key se har route badalne par content dobara fade-in hota hai */}
        <div key={location.pathname} className="animate-reveal">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default PanelLayout;