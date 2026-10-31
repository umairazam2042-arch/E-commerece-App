import { NavLink } from 'react-router-dom';

const NavItem = ({ to, end, children }) => (
  <NavLink
    to={to}
    end={end}
    className="group relative inline-flex shrink-0 items-center overflow-hidden rounded-full px-3 py-2 sm:px-4"
  >
    {({ isActive }) => (
      <>
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500 ease-out ${
            isActive
              ? 'scale-100 opacity-100'
              : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100'
          }`}
        />
        <span
          className={`relative z-10 flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition-colors duration-300 sm:text-[15px] ${
            isActive ? 'text-white' : 'text-slate-600 group-hover:text-white'
          }`}
        >
          {children}
        </span>
      </>
    )}
  </NavLink>
);

export default NavItem;