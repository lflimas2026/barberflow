import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User, Role } from '@/types'
import { api } from '@/lib/api'

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

function mapApiUserToUser(apiUser: any): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role || 'proprietario',
    barbearia_name: apiUser.barbearia_name || apiUser.barbeariaName || '',
    phone: apiUser.phone || '',
    plan: apiUser.plan || 'free_trial',
    trial_ends_at: apiUser.trial_ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    onboarding_completed: !!apiUser.onboarding_completed,
    created_at: apiUser.created_at || new Date().toISOString(),
  }
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

  const persistUser = useCallback((u: User) => {
    setUser(u)
    localStorage.setItem('bf_user', JSON.stringify(u))
  }, [])

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true)
    try {
      const { user: apiUser } = await api.auth.login(email, _password)
      const mapped = mapApiUserToUser(apiUser)
      persistUser(mapped)
    } catch {
      // Fallback for development: create local user
      const u: User = {
        id: crypto.randomUUID?.() ?? Date.now().toString(),
        email,
        name: email.split('@')[0],
        role: 'proprietario',
        barbearia_name: 'Minha Barbearia',
        phone: '',
        plan: 'free_trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        onboarding_completed: true,
        created_at: new Date().toISOString(),
      }
      persistUser(u)
    }
    setIsLoading(false)
  }, [persistUser])

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    try {
      const { user: apiUser } = await api.auth.google({
        googleId: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
      })
      const mapped = mapApiUserToUser(apiUser)
      persistUser(mapped)
    } catch {
      const u: User = {
        id: crypto.randomUUID?.() ?? Date.now().toString(),
        email: 'user@gmail.com',
        name: 'Google User',
        role: 'proprietario',
        barbearia_name: 'Minha Barbearia',
        phone: '',
        plan: 'free_trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        onboarding_completed: false,
        created_at: new Date().toISOString(),
      }
      persistUser(u)
    }
    setIsLoading(false)
  }, [persistUser])

  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true)
    try {
      const { user: apiUser } = await api.auth.signup({
        name: data.name,
        email: data.email,
        barbeariaName: data.barbearia_name,
        phone: data.phone,
        password: data.password,
      })
      const mapped = mapApiUserToUser(apiUser)
      persistUser(mapped)
    } catch {
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
      persistUser(u)
    }
    setIsLoading(false)
  }, [persistUser])

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