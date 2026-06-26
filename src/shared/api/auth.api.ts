import type { AuthResponse, User } from '@entities/user'
import { apiClient } from './base'
import { subscriptionApi } from './subscription.api'

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

async function hydrateUserWithSubscription(user: User): Promise<User> {
  try {
    const sub = await subscriptionApi.getSubscription()
    const userRole = localStorage.getItem('cebola.userRole')

    let planName: 'free' | 'premium' | 'basic' | 'pro' = 'free'
    if (sub && sub.status === 'active') {
      const rawPlan = sub.planId.replace('plan-', '')
      if (rawPlan === 'pro') {
        planName = 'pro'
      } else if (rawPlan === 'basic') {
        planName = userRole === 'customer' ? 'premium' : 'basic'
      }
    }

    return {
      ...user,
      subscription: {
        plan: planName,
        status: planName === 'free' ? 'inactive' : 'active',
        expiresAt: sub && sub.expiresAt ? sub.expiresAt.split('T')[0] : undefined,
      },
    }
  } catch {
    return user
  }
}

export const authApi = {
  login(payload: LoginPayload) {
    return apiClient.post<AuthResponse>('/auth/login', payload).then(async response => {
      const userWithSub = await hydrateUserWithSubscription(response.data.user)
      return {
        ...response.data,
        user: userWithSub,
      }
    })
  },
  register(payload: RegisterPayload) {
    return apiClient.post<AuthResponse>('/auth/register', payload).then(async response => {
      const userWithSub = await hydrateUserWithSubscription(response.data.user)
      return {
        ...response.data,
        user: userWithSub,
      }
    })
  },
  me() {
    return apiClient.get<User>('/auth/me').then(response => hydrateUserWithSubscription(response.data))
  },
  updateProfile(payload: UpdateProfilePayload) {
    return apiClient.put<User>('/auth/me', payload).then(response => hydrateUserWithSubscription(response.data))
  },
  changePassword(payload: ChangePasswordPayload) {
    return apiClient.post<void>('/auth/change-password', payload).then(response => response.data)
  },
}


