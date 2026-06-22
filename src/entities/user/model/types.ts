export type User = {
  id: string
  email: string
  nickname: string
  createdAt?: string
}

export type AuthResponse = {
  token: string
  user: User
}
