import type { AuthResponse, User } from '@entities/user'
import { apiClient } from './base'

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = LoginPayload & {
  name: string
}

export const authApi = {
  login(payload: LoginPayload) {
    return apiClient.post<AuthResponse>('/auth/login', payload).then(response => response.data)
  },
  register(payload: RegisterPayload) {
    return apiClient.post<AuthResponse>('/auth/register', payload).then(response => response.data)
  },
  me() {
    return apiClient.get<User>('/auth/me').then(response => response.data)
  },
}
