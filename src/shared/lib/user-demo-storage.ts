import type { User } from '@entities/user'

const DEMO_USER_KEY = 'cebola.demoUser'

export const fallbackUser: User = {
  id: 'local-demo-user',
  email: 'merchant@example.com',
  name: 'Merchant User',
}

export function getDemoUser() {
  const stored = localStorage.getItem(DEMO_USER_KEY)

  if (!stored) {
    return fallbackUser
  }

  try {
    return JSON.parse(stored) as User
  } catch {
    return fallbackUser
  }
}

export function setDemoUser(user: User) {
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
  return user
}
