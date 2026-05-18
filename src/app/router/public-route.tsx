import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { tokenStorage } from '@shared/lib/token-storage'

type PublicRouteProps = {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  if (tokenStorage.getToken()) {
    return <Navigate to="/merchant" replace />
  }

  return children
}
