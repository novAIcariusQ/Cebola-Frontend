const TOKEN_KEY = 'cebola.authToken'
const ROLE_KEY = 'cebola.userRole'

export const tokenStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string, remember = true) {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token)
      sessionStorage.removeItem(TOKEN_KEY)
      return
    }

    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(TOKEN_KEY)
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    sessionStorage.removeItem(ROLE_KEY)
  },
  getUserRole() {
    return localStorage.getItem(ROLE_KEY) || sessionStorage.getItem(ROLE_KEY)
  },
  setUserRole(role: string, remember = true) {
    if (remember) {
      localStorage.setItem(ROLE_KEY, role)
      sessionStorage.removeItem(ROLE_KEY)
      return
    }

    sessionStorage.setItem(ROLE_KEY, role)
    localStorage.removeItem(ROLE_KEY)
  },
}
