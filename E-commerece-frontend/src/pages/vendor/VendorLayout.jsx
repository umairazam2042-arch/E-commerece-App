import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/vendor', label: 'Dashboard', end: true },
  { to: '/vendor/products', label: 'Products' },
  { to: '/vendor/inventory', label: 'Inventory' },
  { to: '/vendor/orders', label: 'Orders' },
];

const linkCls = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

const VendorLayout = () => (
  <div className="grid gap-6 md:grid-cols-[200px_1fr]">
    <aside className="h-fit space-y-1 rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Vendor panel
      </p>
      {LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>
          {l.label}
        </NavLink>
      ))}
    </aside>

    <section className="min-w-0">
      <Outlet />
    </section>
  </div>
);

export default VendorLayout;