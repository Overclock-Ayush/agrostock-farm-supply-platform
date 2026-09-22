import { createContext, useContext, useMemo, useState } from 'react'
import * as api from '../api'

const AuthContext = createContext(null)

const USER_KEY = 'agrostock_user'

function loadStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)

  const persist = (auth) => {
    localStorage.setItem('agrostock_token', auth.token)
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
    setUser(auth.user)
  }

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && api.getToken()),
    async login(email, password) { persist(await api.login(email, password)) },
    async register(name, email, password) { persist(await api.register(name, email, password)) },
    logout() {
      localStorage.removeItem('agrostock_token')
      localStorage.removeItem(USER_KEY)
      setUser(null)
    }
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
