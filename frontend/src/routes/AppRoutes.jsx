import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import AppLayout from '../components/layout/AppLayout';
import HomePage from '../pages/home/HomePage';
import ShopPage from '../pages/shop/ShopPage';
import ProductPage from '../pages/product/ProductPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AdminSetupPage from '../pages/auth/AdminSetupPage';
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import OrdersPage from '../pages/orders/OrdersPage';
import OrderDetailsPage from '../pages/orders/OrderDetailsPage';
import AccountPage from '../pages/account/AccountPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import WishlistPage from '../pages/wishlist/WishlistPage';

const withLayout = (children) => <AppLayout>{children}</AppLayout>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={withLayout(<HomePage />)} />
      <Route path="/shop" element={withLayout(<ShopPage />)} />
      <Route path="/product/:productId" element={withLayout(<ProductPage />)} />
      <Route path="/cart" element={withLayout(<CartPage />)} />
      <Route path="/wishlist" element={withLayout(<WishlistPage />)} />
      <Route path="/login" element={withLayout(<LoginPage />)} />
      <Route path="/register" element={withLayout(<RegisterPage />)} />
      <Route path="/admin/setup" element={withLayout(<AdminSetupPage />)} />
      <Route path="/checkout" element={withLayout(<ProtectedRoute><CheckoutPage /></ProtectedRoute>)} />
      <Route path="/orders" element={withLayout(<ProtectedRoute><OrdersPage /></ProtectedRoute>)} />
      <Route path="/orders/:orderId" element={withLayout(<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>)} />
      <Route path="/account" element={withLayout(<ProtectedRoute><AccountPage /></ProtectedRoute>)} />
      <Route path="/admin" element={withLayout(<AdminRoute><AdminDashboardPage /></AdminRoute>)} />
      <Route path="/admin/products" element={withLayout(<AdminRoute><AdminDashboardPage /></AdminRoute>)} />
      <Route path="/admin/orders" element={withLayout(<AdminRoute><AdminDashboardPage /></AdminRoute>)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
