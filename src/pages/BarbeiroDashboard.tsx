import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrial } from '@/context/TrialContext'
import { PaywallModal } from '@/components/premium/PaywallModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { CheckCircle, Clock, DollarSign, Lock, MessageSquare, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getStatusIcon, formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Agendamento, BarbeiroDashboardStats } from '@/types'

export function BarbeiroDashboardPage() {
  const { user } = useAuth()
  const { canAccess, openPaywall } = useTrial()
  const showComissao = canAccess('comissao_automatica')

  const [stats, setStats] = useState<BarbeiroDashboardStats>({
    agendamentos_hoje: 0,
    faturamento_hoje: 0,
    comissao_dia: 0,
    comissao_mes: 0,
    fila: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    Promise.all([
      api.agendamentos.list({ barbeiro_id: user.id, date: new Date().toISOString().split('T')[0] }),
    ])
      .then(([agendamentosData]) => {
        const fila = agendamentosData.agendamentos
        const faturamento = fila
          .filter((a: any) => a.status === 'finalizado')
          .reduce((sum: number, a: any) => sum + (a.valor || 0), 0)
        setStats({
          agendamentos_hoje: fila.length,
          faturamento_hoje: faturamento,
          comissao_dia: 0,
          comissao_mes: 0,
          fila,
        })
      })
      .catch(() => {
        setStats({
          agendamentos_hoje: 0,
          faturamento_hoje: 0,
          comissao_dia: 0,
          comissao_mes: 0,
          fila: [],
        })
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  const handleFinalizar = async (id: string) => {
    try {
      await api.agendamentos.updateStatus(id, 'finalizado')
      setStats((prev) => ({
        ...prev,
        fila: prev.fila.map((a) =>
          a.id === id ? { ...a, status: 'finalizado' as const } : a
        ),
      }))
    } catch {
      console.error('Erro ao finalizar agendamento')
    }
  }

  const handleWhatsApp = (clienteNome: string, data: string) => {
    const hora = format(parseISO(data), "HH:mm")
    const msg = `Olá ${clienteNome}, faltam 15 minutos para sua vez!`
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-barber-100 dark:bg-barber-900 text-barber-600">
            {user?.name?.charAt(0) ?? 'B'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Olá, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="h-4 w-24 bg-gray-200 dark:bg-dark-300 rounded animate-pulse mb-3" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-dark-300 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <StatsCards
          agendamentosHoje={stats.agendamentos_hoje}
          faturamentoHoje={stats.faturamento_hoje}
          barbeirosAtivos={1}
          trend={0}
        />
      )}

      {!showComissao ? (
        <Card className="border-dashed border-barber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-barber-500" />
                <span className="text-sm font-medium">Sua comissão do dia</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-barber-500 border-barber-500"
                onClick={() => openPaywall('comissao_automatica')}
              >
                <Lock className="w-3 h-3 mr-1" />
                Ver comissão
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Comissão Hoje</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.comissao_dia)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">Comissão Mês</p>
              <p className="text-2xl font-bold text-barber-500">{formatCurrency(stats.comissao_mes)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Sua Fila</span>
            <Badge variant="secondary">{stats.fila.length} clientes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.fila.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-300 dark:text-dark-500 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum agendamento hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.fila.map((agendamento, index) => (
                <div
                  key={agendamento.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-dark-300"
                >
                  <div className="text-center min-w-[40px]">
                    <p className="text-lg font-bold">{format(parseISO(agendamento.data_hora), "HH:mm")}</p>
                    <p className="text-xs text-gray-500">{agendamento.duracao_min}min</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{agendamento.cliente?.nome}</p>
                      <span>{getStatusIcon(agendamento.status)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{agendamento.servico?.nome}</p>
                  </div>

                  <div className="flex gap-2">
                    {agendamento.status === 'aguardando' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsApp(agendamento.cliente?.nome ?? '', agendamento.data_hora)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    )}
                    {agendamento.status !== 'finalizado' && agendamento.status !== 'cancelado' && (
                      <Button size="sm" onClick={() => handleFinalizar(agendamento.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Finalizar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PaywallModal />
    </div>
  )
}