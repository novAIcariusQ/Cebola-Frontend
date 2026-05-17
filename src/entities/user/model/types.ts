export type User = {
  id: string
  email: string
  name: string
  createdAt?: string
}

export type AuthResponse = {
  token: string
  user: User
}
