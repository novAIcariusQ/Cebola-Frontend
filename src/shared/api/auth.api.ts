import type { AuthResponse, User } from '@entities/user'
import { apiClient } from './base'

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = LoginPayload & {
  name: string
}

type UpdateProfilePayload = {
  name: string
}

type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
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
  updateProfile(payload: UpdateProfilePayload) {
    return apiClient.put<User>('/auth/me', payload).then(response => response.data)
  },
  changePassword(payload: ChangePasswordPayload) {
    return apiClient.post<void>('/auth/change-password', payload).then(response => response.data)
  },
}
