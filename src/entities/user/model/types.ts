export type User = {
  id: string
  email: string
  name: string
  createdAt?: string
  subscription?: {
    plan: 'free' | 'premium' | 'basic' | 'standard' | 'pro'
    status: 'active' | 'inactive'
    expiresAt?: string
  }
}

export type AuthResponse = {
  token: string
  user: User
}
