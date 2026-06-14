import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function daysUntil(date: string): number {
  const target = new Date(date)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function isExpired(date: string): boolean {
  return new Date(date) < new Date()
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    aguardando: 'Aguardando',
    confirmado: 'Confirmado',
    cancelado: 'Cancelado',
    finalizado: 'Finalizado',
  }
  return labels[status] ?? status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    aguardando: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    confirmado: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    cancelado: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    finalizado: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  }
  return colors[status] ?? 'text-gray-500 bg-gray-50'
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    aguardando: '⏱️',
    confirmado: '✅',
    cancelado: '🚫',
    finalizado: '✔️',
  }
  return icons[status] ?? '❓'
}

export function timeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  return `${diffDays}d atrás`
}
