import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import {
  canAccessFeature,
  canAddMoreBarbeiros,
  canCreateMultipleServicos,
  isTrialExpired,
  getTrialDaysLeft,
} from '@/lib/trial'

interface TrialContextType {
  isExpired: boolean
  daysLeft: number
  showPaywall: boolean
  paywallFeature: string
  canAccess: (featureKey: string) => boolean
  canAddBarbeiro: (currentCount: number) => boolean
  canCreateServico: () => boolean
  openPaywall: (feature: string) => void
  closePaywall: () => void
  handleUpgrade: () => void
}

const TrialContext = createContext<TrialContextType | null>(null)

export function TrialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallFeature, setPaywallFeature] = useState('')

  const isExpired = isTrialExpired(user?.trial_ends_at)
  const daysLeft = getTrialDaysLeft(user?.trial_ends_at)

  const canAccess = useCallback(
    (featureKey: string) => {
      if (!user) return false
      return canAccessFeature(user.plan, featureKey, user.trial_ends_at)
    },
    [user]
  )

  const canAddBarbeiro = useCallback(
    (currentCount: number) => {
      if (!user) return false
      return canAddMoreBarbeiros(user.plan, currentCount)
    },
    [user]
  )

  const canCreateServico = useCallback(() => {
    if (!user) return false
    return canCreateMultipleServicos(user.plan)
  }, [user])

  const openPaywall = useCallback((feature: string) => {
    setPaywallFeature(feature)
    setShowPaywall(true)
  }, [])

  const closePaywall = useCallback(() => {
    setShowPaywall(false)
    setPaywallFeature('')
  }, [])

  const handleUpgrade = useCallback(() => {
    setShowPaywall(false)
    navigate('/upgrade')
  }, [navigate])

  return (
    <TrialContext.Provider
      value={{
        isExpired,
        daysLeft,
        showPaywall,
        paywallFeature,
        canAccess,
        canAddBarbeiro,
        canCreateServico,
        openPaywall,
        closePaywall,
        handleUpgrade,
      }}
    >
      {children}
    </TrialContext.Provider>
  )
}

export function useTrial(): TrialContextType {
  const ctx = useContext(TrialContext)
  if (!ctx) throw new Error('useTrial must be used within TrialProvider')
  return ctx
}
