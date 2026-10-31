import PanelLayout from '../common/PanelLayout';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/vendors', label: 'Vendors' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/exchange-rates', label: 'Exchange rates' },
];

const AdminLayout = () => <PanelLayout title="Admin panel" links={LINKS} />;

export default AdminLayout;