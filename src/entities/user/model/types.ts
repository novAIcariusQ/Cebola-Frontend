export type User = {
  id: string
  email: string
  nickname: string
  createdAt?: string
  subscription?: {
    plan: 'free' | 'premium'
    status: 'active' | 'inactive'
    expiresAt?: string
  }
}

export type AuthResponse = {
  token: string
  user: User
}
