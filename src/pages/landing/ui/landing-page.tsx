import { Navigate } from 'react-router-dom'
import { tokenStorage } from '@shared/lib/token-storage'

export function LandingPage() {
  return <Navigate to={tokenStorage.getToken() ? '/merchant' : '/login'} replace />
}
