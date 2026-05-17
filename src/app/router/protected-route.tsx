import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { tokenStorage } from '@shared/lib/token-storage'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  if (!tokenStorage.getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
