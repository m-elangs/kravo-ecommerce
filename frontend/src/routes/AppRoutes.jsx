import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import CustomerLayout from '../layouts/CustomerLayout'
import AdminLayout from '../layouts/AdminLayout'

// 15 Customer Pages
import HomePage from '../pages/customer/HomePage'
import AboutPage from '../pages/customer/AboutPage'
import CatalogPage from '../pages/customer/CatalogPage'
import CategoriesPage from '../pages/customer/CategoriesPage'
import ProductDetailPage from '../pages/customer/ProductDetailPage'
import SearchPage from '../pages/customer/SearchPage'
import CartPage from '../pages/customer/CartPage'
import CheckoutPage from '../pages/customer/CheckoutPage'
import PaymentPendingPage from '../pages/customer/PaymentPendingPage'
import OrderTrackingPage from '../pages/customer/OrderTrackingPage'
import MyAccountPage from '../pages/customer/MyAccountPage'
import MyOrdersPage from '../pages/customer/MyOrdersPage'
import WishlistPage from '../pages/customer/WishlistPage'
import ContactPage from '../pages/customer/ContactPage'
import WholesaleRegistrationPage from '../pages/customer/WholesaleRegistrationPage'

// 16 Admin Dashboard Pages
import DashboardOverviewPage from '../pages/admin/DashboardOverviewPage'
import ProductsListPage from '../pages/admin/ProductsListPage'
import AdminCategoriesPage from '../pages/admin/CategoriesPage'
import VariantsPage from '../pages/admin/VariantsPage'
import InventoryPage from '../pages/admin/InventoryPage'
import BatchesPage from '../pages/admin/BatchesPage'
import OrdersListPage from '../pages/admin/OrdersListPage'
import PaymentsListPage from '../pages/admin/PaymentsListPage'
import ShipmentsListPage from '../pages/admin/ShipmentsListPage'
import CustomersListPage from '../pages/admin/CustomersListPage'
import ResellersListPage from '../pages/admin/ResellersListPage'
import WholesalePricingPage from '../pages/admin/WholesalePricingPage'
import VouchersPage from '../pages/admin/VouchersPage'
import ReviewsPage from '../pages/admin/ReviewsPage'
import ReportsPage from '../pages/admin/ReportsPage'
import SettingsPage from '../pages/admin/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Storefront Routes (15 Pages) */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="products" element={<CatalogPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="payment/:orderNumber" element={<PaymentPendingPage />} />
        <Route path="order-tracking" element={<OrderTrackingPage />} />
        <Route path="order-tracking/:orderNumber" element={<OrderTrackingPage />} />
        <Route path="account" element={<MyAccountPage />} />
        <Route path="account/orders" element={<MyOrdersPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="wholesale" element={<WholesaleRegistrationPage />} />
      </Route>

      {/* Admin Dashboard Routes (16 Menus) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardOverviewPage />} />
        <Route path="products" element={<ProductsListPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="variants" element={<VariantsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="batches" element={<BatchesPage />} />
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="payments" element={<PaymentsListPage />} />
        <Route path="shipments" element={<ShipmentsListPage />} />
        <Route path="customers" element={<CustomersListPage />} />
        <Route path="resellers" element={<ResellersListPage />} />
        <Route path="wholesale-pricing" element={<WholesalePricingPage />} />
        <Route path="vouchers" element={<VouchersPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
