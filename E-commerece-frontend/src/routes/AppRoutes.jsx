import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderPlacedPage from '../pages/OrderPlacedPage';
import MyOrderPage from '../pages/MyOrderPage';
import WishlistPage from '../pages/WishlistPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VendorApplyPage from '../pages/vendor/VendorApplyPage';
import VendorLayout from '../components/vendor/VendorLayout';
import VendorDashboardPage from '../pages/vendor/VendorDashboardPage';
import VendorProductsPage from '../pages/vendor/VendorProductsPage';
import VendorProductFormPage from '../pages/vendor/VendorProductFormPage';
import VendorInventoryPage from '../pages/vendor/VendorInventoryPage';
import VendorOrdersPage from '../pages/vendor/VendorOrdersPage';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminVendorsPage from '../pages/admin/AdminVendorsPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminCouponsPage from '../pages/admin/AdminCouponsPage';
import AdminExchangeRatesPage from '../pages/admin/AdminExchangeRatesPage';
import ProtectedRoute from './ProtectedRoutes';

// Shopping sirf customer kar sakta hai
const CUSTOMER = ['customer'];

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route path="/cart" element={<ProtectedRoute roles={CUSTOMER}><CartPage /></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute roles={CUSTOMER}><CheckoutPage /></ProtectedRoute>} />
    <Route path="/order-placed" element={<ProtectedRoute roles={CUSTOMER}><OrderPlacedPage /></ProtectedRoute>} />
    <Route path="/orders/:id" element={<ProtectedRoute roles={CUSTOMER}><MyOrderPage /></ProtectedRoute>} />
    <Route path="/wishlist" element={<ProtectedRoute roles={CUSTOMER}><WishlistPage /></ProtectedRoute>} />

    <Route
      path="/become-vendor"
      element={
        <ProtectedRoute roles={['customer']}>
          <VendorApplyPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/vendor"
      element={
        <ProtectedRoute roles={['vendor']}>
          <VendorLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<VendorDashboardPage />} />
      <Route path="products" element={<VendorProductsPage />} />
      <Route path="products/new" element={<VendorProductFormPage />} />
      <Route path="products/:id/edit" element={<VendorProductFormPage />} />
      <Route path="inventory" element={<VendorInventoryPage />} />
      <Route path="orders" element={<VendorOrdersPage />} />
    </Route>

    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboardPage />} />
      <Route path="vendors" element={<AdminVendorsPage />} />
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="orders/:id" element={<AdminOrderDetailPage />} />
      <Route path="categories" element={<AdminCategoriesPage />} />
      <Route path="coupons" element={<AdminCouponsPage />} />
      <Route path="exchange-rates" element={<AdminExchangeRatesPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;