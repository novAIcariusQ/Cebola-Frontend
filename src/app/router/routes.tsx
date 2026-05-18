import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@pages/login'
import { MerchantPage } from '@pages/merchant'
import { LandingPage } from '@pages/landing'
import { ProtectedRoute } from './protected-route'
import { PublicRoute } from './public-route'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/merchant"
        element={
          <ProtectedRoute>
            <MerchantPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/merchant" replace />} />
    </Routes>
  )
}
