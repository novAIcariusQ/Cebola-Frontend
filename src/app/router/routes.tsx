import { Navigate, Route, Routes } from 'react-router-dom'
import {
  CustomerBasketPage,
  CustomerCheckoutPage,
  CustomerLandingPage,
  CustomerProductCataloguePage,
  CustomerProductPage,
} from '@pages/customer'
import { LoginPage } from '@pages/login'
import {
  MerchantLandingPage,
  MerchantOrderCataloguePage,
  MerchantOrderPage,
  MerchantProductCataloguePage,
  MerchantProductCreatePage,
  MerchantProductPage,
  MerchantSettingsPage,
  MerchantShopCreatePage,
  MerchantShopPage,
} from '@pages/merchant'
import { CustomerLayout } from '@widgets/customer-layout'
import { MerchantLayout } from '@widgets/merchant-layout'
import { ProtectedRoute } from './protected-route'
import { PublicRoute } from './public-route'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<CustomerLandingPage />} />
        <Route path="/shops/:shopId/products" element={<CustomerProductCataloguePage />} />
        <Route path="/shops/:shopId/products/:productId" element={<CustomerProductPage />} />
        <Route path="/basket" element={<CustomerBasketPage />} />
      </Route>
      <Route path="/checkout" element={<CustomerCheckoutPage />} />
      <Route
        path="/login/sign-in"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login/sign-up"
        element={
          <PublicRoute>
            <LoginPage mode="sign-up" />
          </PublicRoute>
        }
      />
      <Route path="/login" element={<Navigate to="/login/sign-in" replace />} />
      <Route
        path="/merchant"
        element={
          <ProtectedRoute>
            <MerchantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/merchant/shops" replace />} />
        <Route path="shops" element={<MerchantLandingPage />} />
        <Route path="shops/new" element={<MerchantShopCreatePage />} />
        <Route path="shops/:shopId" element={<MerchantShopPage />} />
        <Route path="shops/:shopId/products" element={<MerchantProductCataloguePage />} />
        <Route path="shops/:shopId/products/new" element={<MerchantProductCreatePage />} />
        <Route path="shops/:shopId/products/:productId" element={<MerchantProductPage />} />
        <Route path="shops/:shopId/orders" element={<MerchantOrderCataloguePage />} />
        <Route path="shops/:shopId/orders/:orderId" element={<MerchantOrderPage />} />
        <Route path="settings" element={<MerchantSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
