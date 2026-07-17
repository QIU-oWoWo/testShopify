import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './store/CartContext';
import { AuthProvider } from './store/AuthContext';
import { AppProvider } from './store/AppContext';
import Layout from './components/Layout/Layout';

// Pages
import HomePage from './pages/Home/HomePage';
import ProductDetailPage from './pages/ProductDetail/ProductDetailPage';
import SearchResultPage from './pages/Search/SearchResultPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderListPage from './pages/Orders/OrderListPage';
import OrderDetailPage from './pages/Orders/OrderDetailPage';
import AfterSalePage from './pages/Orders/AfterSalePage';
import CustomOrderPage from './pages/Orders/CustomOrderPage';
import OmsOrderDetailPage from './pages/Orders/OmsOrderDetailPage';
import ReconciliationListPage from './pages/Finance/ReconciliationListPage';
import ReconciliationDetailPage from './pages/Finance/ReconciliationDetailPage';
import InvoiceListPage from './pages/Finance/InvoiceListPage';
import PaymentRecordPage from './pages/Finance/PaymentRecordPage';
import MessageCenterPage from './pages/Messages/MessageCenterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AddressManagePage from './pages/Profile/AddressManagePage';
import InvoiceManagePage from './pages/Profile/InvoiceManagePage';
import PreferencePage from './pages/Profile/PreferencePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Layout routes - with header, nav, footer */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:categoryId" element={<HomePage />} />
                <Route path="/search" element={<SearchResultPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrderListPage />} />
                <Route path="/orders/:status" element={<OrderListPage />} />
                <Route path="/orders/detail/:orderId" element={<OrderDetailPage />} />
                <Route path="/orders/oms/:orderNo" element={<OmsOrderDetailPage />} />
                <Route path="/orders/custom" element={<CustomOrderPage />} />
                <Route path="/after-sales/:afterSaleId" element={<AfterSalePage />} />
                <Route path="/reconciliation" element={<ReconciliationListPage />} />
                <Route path="/reconciliation/:reconId" element={<ReconciliationDetailPage />} />
                <Route path="/invoices" element={<InvoiceListPage />} />
                <Route path="/payments" element={<PaymentRecordPage />} />
                <Route path="/messages" element={<MessageCenterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/addresses" element={<AddressManagePage />} />
                <Route path="/profile/invoices" element={<InvoiceManagePage />} />
                <Route path="/profile/preferences" element={<PreferencePage />} />
              </Route>

              {/* Auth routes - without layout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
