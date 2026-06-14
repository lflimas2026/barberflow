export type Role = 'proprietario' | 'barbeiro'
export type Plan = 'free_trial' | 'pro' | 'pro_plus'
export type AgendamentoStatus = 'aguardando' | 'confirmado' | 'cancelado' | 'finalizado'
export type MetodoPagamento = 'dinheiro' | 'pix' | 'credito' | 'debito' | 'asaas'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  barbearia_name: string
  phone: string
  plan: Plan
  trial_ends_at: string
  avatar_url?: string
  onboarding_completed: boolean
  created_at: string
}

export interface Barbeiro {
  id: string
  user_id: string
  name: string
  photo_url: string
  comissao_percent: number
  ativo: boolean
  horarios?: HorarioTrabalho[]
  created_at: string
}

export interface HorarioTrabalho {
  dia_semana: number
  inicio: string
  fim: string
}

export interface Agendamento {
  id: string
  barbeiro_id: string
  cliente_id: string
  servico_id: string
  data_hora: string
  duracao_min: number
  status: AgendamentoStatus
  valor: number
  observacoes?: string
  criado_em: string
  barbeiro?: Barbeiro
  cliente?: Cliente
  servico?: Servico
}

export interface Cliente {
  id: string
  user_id: string
  nome: string
  whatsapp: string
  email?: string
  ultimo_agendamento?: string
  observacoes?: string
  preferencias?: string
  total_visitas: number
  criado_em: string
}

export interface Servico {
  id: string
  user_id: string
  nome: string
  preco: number
  duracao_min: number
  ativo: boolean
  created_at: string
}

export interface Pagamento {
  id: string
  agendamento_id: string
  metodo: MetodoPagamento
  valor: number
  asaas_id?: string
  status: 'pendente' | 'pago' | 'estornado'
  criado_em: string
}

export interface Produto {
  id: string
  user_id: string
  nome: string
  preco: number
  quantidade: number
  created_at: string
}

export interface DashboardStats {
  agendamentos_hoje: number
  faturamento_hoje: number
  barbeiros_ativos: number
  ticket_medio: number
  agendamentos_trend: number
  faturamento_breakdown: {
    servicos: number
    produtos: number
  }
  fila_hoje: Agendamento[]
  proximos_7_dias: { data: string; ocupacao: number }[]
}

export interface BarbeiroDashboardStats {
  agendamentos_hoje: number
  faturamento_hoje: number
  comissao_dia: number
  comissao_mes: number
  fila: Agendamento[]
}
