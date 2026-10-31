import PanelLayout from '../common/PanelLayout';

const LINKS = [
  { to: '/vendor', label: 'Dashboard', end: true },
  { to: '/vendor/products', label: 'Products' },
  { to: '/vendor/inventory', label: 'Inventory' },
  { to: '/vendor/orders', label: 'Orders' },
];

const VendorLayout = () => <PanelLayout title="Vendor panel" links={LINKS} />;

export default VendorLayout;