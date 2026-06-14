import { FREE_TRIAL_MAX_BARBEIROS } from './constants'
import type { Plan } from '@/types'

export function isPremiumFeature(featureKey: string): boolean {
  const premiumFeatures = [
    'multi_barbeiros',
    'relatorios',
    'historico_completo',
    'gestao_estoque',
    'comissao_automatica',
    'google_maps',
    'loyalty_points',
    'multiplos_servicos',
    'dashboard_barbeiro',
  ]
  return premiumFeatures.includes(featureKey)
}

export function canAccessFeature(
  plan: Plan,
  featureKey: string,
  trialEndsAt?: string
): boolean {
  if (plan === 'pro_plus') return true
  if (plan === 'pro') {
    const proFeatures = [
      'multi_barbeiros',
      'relatorios',
      'historico_completo',
      'multiplos_servicos',
      'dashboard_barbeiro',
    ]
    return proFeatures.includes(featureKey)
  }
  return false
}

export function canAddMoreBarbeiros(
  plan: Plan,
  currentBarbeiros: number
): boolean {
  if (plan !== 'free_trial') return true
  return currentBarbeiros < FREE_TRIAL_MAX_BARBEIROS
}

export function canCreateMultipleServicos(plan: Plan): boolean {
  return plan !== 'free_trial'
}

export function isTrialExpired(trialEndsAt?: string): boolean {
  if (!trialEndsAt) return false
  return new Date(trialEndsAt) < new Date()
}

export function getTrialDaysLeft(trialEndsAt?: string): number {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt).getTime() - new Date().getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
