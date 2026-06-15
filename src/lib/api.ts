function getApiUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://barberflow-api.lflimas2022.workers.dev'
  }
  return 'http://localhost:8787'
}
const API_URL = getApiUrl()

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    signup: (data: {
      name: string
      email: string
      barbeariaName: string
      phone: string
      password: string
    }) =>
      request<{ user: any }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    google: (data: { googleId: string; email: string; name: string }) =>
      request<{ user: any }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  agendamentos: {
    list: (params?: { user_id?: string; date?: string; barbeiro_id?: string }) => {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v != null))
      ).toString()
      return request<{ agendamentos: any[] }>(`/api/agendamentos?${query}`)
    },
    create: (data: any) =>
      request<{ agendamento: any }>('/api/agendamentos', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      request<{ success: boolean }>(`/api/agendamentos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  barbeiros: {
    list: (userId: string) =>
      request<{ barbeiros: any[] }>(`/api/barbeiros?user_id=${userId}`),
    create: (data: any) =>
      request<{ barbeiro: any }>('/api/barbeiros', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  clientes: {
    list: (userId: string, search?: string) => {
      const query = new URLSearchParams({ user_id: userId })
      if (search) query.set('search', search)
      return request<{ clientes: any[] }>(`/api/clientes?${query}`)
    },
    create: (data: any) =>
      request<{ cliente: any }>('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  servicos: {
    list: (userId: string) =>
      request<{ servicos: any[] }>(`/api/servicos?user_id=${userId}`),
  },
  dashboard: {
    stats: (userId: string) =>
      request<{
        agendamentos_hoje: number
        faturamento_hoje: number
        barbeiros_ativos: number
        proximos_7_dias: { data: string; ocupacao: number }[]
      }>(`/api/dashboard/stats?user_id=${userId}`),
  },
  checkout: (data: { plan: string; userId?: string; paymentMethod?: string; customer?: any }) =>
    request<{ checkout_url: string }>('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
