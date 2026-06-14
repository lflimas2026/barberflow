import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, Role } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

interface SignupData {
  name: string
  email: string
  barbearia_name: string
  phone: string
  password: string
}

const AuthContext = createContext<AuthContextType | null>(null)

const MOCK_USER: User = {
  id: '1',
  email: 'demo@barberflow.com',
  name: 'Fernando Silva',
  role: 'proprietario',
  barbearia_name: 'BarberFlow Pro',
  phone: '(11) 99999-8888',
  plan: 'free_trial',
  trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  onboarding_completed: true,
  created_at: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bf_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    const u = { ...MOCK_USER, email }
    setUser(u)
    localStorage.setItem('bf_user', JSON.stringify(u))
    setIsLoading(false)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    const u = { ...MOCK_USER, name: 'Google User', email: 'google@user.com' }
    setUser(u)
    localStorage.setItem('bf_user', JSON.stringify(u))
    setIsLoading(false)
  }, [])

  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    const u: User = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      email: data.email,
      name: data.name,
      role: 'proprietario',
      barbearia_name: data.barbearia_name,
      phone: data.phone,
      plan: 'free_trial',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    }
    setUser(u)
    localStorage.setItem('bf_user', JSON.stringify(u))
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('bf_user')
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('bf_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useRole(): Role {
  const { user } = useAuth()
  return user?.role ?? 'proprietario'
}
