export const COLORS = {
  primary: '#D32F2F',
  primaryDark: '#b91c1c',
  primaryLight: '#fca5a5',
  dark: '#1A1A1A',
  darkLight: '#2d2d2d',
  white: '#ffffff',
  gray: {
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#6b7280',
    600: '#495057',
    700: '#343a40',
    800: '#212529',
    900: '#f3f4f6',
  },
}

export const FREE_TRIAL_DAYS = 30
export const FREE_TRIAL_MAX_BARBEIROS = 1
export const FREE_TRIAL_SERVICO_PADRAO = 'Corte de Cabelo'
export const FREE_TRIAL_SERVICO_PRECO = 45

export const PREMIUM_FEATURES = [
  { key: 'multi_barbeiros', label: 'Múltiplos Barbeiros', tier: 'pro' as const },
  { key: 'relatorios', label: 'Relatórios Financeiros', tier: 'pro' as const },
  { key: 'historico_completo', label: 'Histórico Completo', tier: 'pro' as const },
  { key: 'gestao_estoque', label: 'Gestão de Estoque', tier: 'pro_plus' as const },
  { key: 'comissao_automatica', label: 'Comissão Automática', tier: 'pro_plus' as const },
  { key: 'google_maps', label: 'Google Maps', tier: 'pro_plus' as const },
  { key: 'loyalty_points', label: 'Programa de Fidelidade', tier: 'pro_plus' as const },
  { key: 'multiplos_servicos', label: 'Múltiplos Serviços', tier: 'pro' as const },
  { key: 'dashboard_barbeiro', label: 'Dashboard do Barbeiro', tier: 'pro' as const },
]

export const PLAN_NAMES: Record<string, string> = {
  free_trial: 'Free Trial',
  pro: 'Pro',
  pro_plus: 'Pro+',
}

export const PLAN_PRICES: Record<string, number> = {
  pro: 49.90,
  pro_plus: 89.90,
}

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['proprietario', 'barbeiro'] },
  { href: '/agendamentos', label: 'Agendamentos', icon: 'Calendar', roles: ['proprietario', 'barbeiro'] },
  { href: '/clientes', label: 'Clientes', icon: 'Users', roles: ['proprietario', 'barbeiro'] },
  { href: '/barbeiros', label: 'Barbeiros', icon: 'Scissors', roles: ['proprietario'] },
  { href: '/servicos', label: 'Serviços', icon: 'Wrench', roles: ['proprietario'] },
]
