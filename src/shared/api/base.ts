import axios from 'axios'
import { env } from '@shared/config'
import { tokenStorage } from '@shared/lib/token-storage'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

function buildAuthorizationHeader(token: string) {
  const normalized = token.trim().replace(/^Bearer\s+/i, '')
  return normalized ? `Bearer ${normalized}` : null
}

apiClient.interceptors.request.use(config => {
  const token = tokenStorage.getToken()

  if (token) {
    const authorization = buildAuthorizationHeader(token)

    if (authorization) {
      config.headers.Authorization = authorization
    }
  }

  return config
})
