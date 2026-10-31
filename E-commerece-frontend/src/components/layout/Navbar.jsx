import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Brand from '../common/Brand';
import NotificationBell from '../common/NotificationBell';
import NavItem from './NavItem';

const MobileLink = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block rounded-xl px-4 py-3 text-base font-semibold transition ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md'
          : 'text-slate-700 hover:bg-slate-100'
      }`
    }
  >
    {children}
  </NavLink>
);

const MenuIcon = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const role = user?.role;
  // Admin shopping nahi karta, is liye cart sirf customer aur vendor ko
    const isShopper = role === 'customer';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Page badalne par mobile menu band ho jaye
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Menu khula ho aur bahar kahin click ho, ya Escape dabe, to menu band ho jaye
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e) => {
      const insideMenu = menuRef.current?.contains(e.target);
      const insideToggle = toggleRef.current?.contains(e.target);
      if (!insideMenu && !insideToggle) setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/products', { replace: true });
  };

  // Orders ka link kisi role ke liye nahi: vendor ke orders vendor panel mein, admin ke admin panel mein
  const links = [
    { to: '/products', label: 'Products' },
    ...(isShopper ? [{ to: '/wishlist', label: 'Wishlist' }] : []),
    ...(role === 'customer' ? [{ to: '/become-vendor', label: 'Vendor bano' }] : []),
    ...(role === 'vendor' ? [{ to: '/vendor', label: 'Vendor panel' }] : []),
    ...(role === 'admin' ? [{ to: '/admin', label: 'Admin panel' }] : []),
  ];

  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 shadow-lg shadow-indigo-500/10 backdrop-blur-xl'
          : 'bg-white/60 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-4 lg:gap-6">
          <Brand />

          <div className="hidden items-center gap-1 whitespace-nowrap lg:flex">
            {links.map((l) => (
              <NavItem key={l.to} to={l.to}>
                {l.label}
              </NavItem>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          

          {user && <NotificationBell />}

          {isShopper && (
            <NavItem to="/cart">
              Cart
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className="animate-badge inline-flex min-w-[1.25rem] justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white"
                >
                  {itemCount}
                </span>
              )}
            </NavItem>
          )}

          {user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-600 xl:inline">
                Hi, <span className="font-bold text-indigo-600">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="btn-sheen hidden whitespace-nowrap rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:border-transparent hover:text-white lg:inline-block"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-sheen hidden whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold text-slate-700 hover:text-white lg:inline-block"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-sheen hidden whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:scale-105 lg:inline-block"
              >
                Register
              </Link>
            </>
          )}

          <button
            ref={toggleRef}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu kholein ya band karein"
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          ref={menuRef}
          className="animate-reveal border-t border-slate-200 bg-white/95 px-3 py-4 backdrop-blur-xl lg:hidden"
        >
          <div className="space-y-1">
            {links.map((l) => (
              <MobileLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}>
                {l.label}
              </MobileLink>
            ))}
          </div>

          <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-2.5 text-center text-sm font-bold text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <span aria-hidden="true" className="nav-glow absolute inset-x-0 bottom-0 block h-px" />
    </header>
  );
};

export default Navbar;