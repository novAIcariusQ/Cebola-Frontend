import { apiClient } from './base'

export type SubscriptionPlan = {
  id: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'yearly'
  maxProducts?: number
  isActive: boolean
  createdAt: string
}

export type Subscription = {
  id: string
  userId: string
  planId: string
  status: 'active' | 'inactive' | 'cancelled'
  startedAt: string
  expiresAt?: string
  cancelledAt?: string
  createdAt: string
  plan?: SubscriptionPlan
}

/**
 * @deprecated Эмуляция подписки для быстрого тестирования. Подлежит удалению при переходе полностью на бэкенд.
 */
export const fastrackSubscriptionMock = {
  simulateSubscribe(planId: string): Promise<Subscription> {
    console.warn('[DEPRECATED] Using fastrackSubscriptionMock.simulateSubscribe. Remove this before production.')
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `sub-mock-${Math.random().toString(36).substr(2, 9)}`,
          userId: 'local-demo-user',
          planId,
          status: 'active',
          startedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        })
      }, 600)
    })
  },
  simulateCancel(): Promise<Subscription> {
    console.warn('[DEPRECATED] Using fastrackSubscriptionMock.simulateCancel. Remove this before production.')
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'sub-mock',
          userId: 'local-demo-user',
          planId: 'free',
          status: 'cancelled',
          startedAt: new Date().toISOString(),
          cancelledAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
      }, 600)
    })
  }
}

export const subscriptionApi = {
  getPlans() {
    return apiClient.get<SubscriptionPlan[]>('/subscription/plans').then(response => response.data)
  },
  getSubscription() {
    return apiClient.get<Subscription | null>('/subscription/me').then(response => response.data)
  },
  subscribe(planId: string) {
    return apiClient.post<Subscription>('/subscription/subscribe', { planId }).then(response => response.data)
  },
  cancel() {
    return apiClient.post<Subscription>('/subscription/cancel').then(response => response.data)
  },
}
