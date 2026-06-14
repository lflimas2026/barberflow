import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrial } from '@/context/TrialContext'
import { PaywallModal } from '@/components/premium/PaywallModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { CheckCircle, Clock, DollarSign, Lock, MessageSquare } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getStatusIcon, formatCurrency } from '@/lib/utils'
import type { Agendamento, BarbeiroDashboardStats } from '@/types'

const MOCK_STATS: BarbeiroDashboardStats = {
  agendamentos_hoje: 5,
  faturamento_hoje: 300,
  comissao_dia: 75,
  comissao_mes: 1200,
  fila: [
    {
      id: '1', barbeiro_id: 'b1', cliente_id: 'c1', servico_id: 's1',
      data_hora: new Date().toISOString(), duracao_min: 45,
      status: 'aguardando', valor: 60, criado_em: new Date().toISOString(),
      cliente: { id: 'c1', user_id: 'u1', nome: 'Carlos Silva', whatsapp: '(11) 98888-7777', total_visitas: 5, criado_em: new Date().toISOString() },
      servico: { id: 's1', user_id: 'u1', nome: 'Corte de Cabelo', preco: 60, duracao_min: 45, ativo: true, created_at: new Date().toISOString() },
    },
    {
      id: '2', barbeiro_id: 'b1', cliente_id: 'c2', servico_id: 's2',
      data_hora: new Date(Date.now() + 3600000).toISOString(), duracao_min: 30,
      status: 'confirmado', valor: 45, criado_em: new Date().toISOString(),
      cliente: { id: 'c2', user_id: 'u1', nome: 'João Santos', whatsapp: '(11) 97777-6666', total_visitas: 3, criado_em: new Date().toISOString() },
      servico: { id: 's2', user_id: 'u1', nome: 'Barba', preco: 45, duracao_min: 30, ativo: true, created_at: new Date().toISOString() },
    },
    {
      id: '3', barbeiro_id: 'b1', cliente_id: 'c3', servico_id: 's1',
      data_hora: new Date(Date.now() + 7200000).toISOString(), duracao_min: 45,
      status: 'confirmado', valor: 60, criado_em: new Date().toISOString(),
      cliente: { id: 'c3', user_id: 'u1', nome: 'Rafael Oliveira', whatsapp: '(11) 96666-5555', total_visitas: 8, criado_em: new Date().toISOString() },
      servico: { id: 's1', user_id: 'u1', nome: 'Corte de Cabelo', preco: 60, duracao_min: 45, ativo: true, created_at: new Date().toISOString() },
    },
  ],
}

export function BarbeiroDashboardPage() {
  const { user } = useAuth()
  const { canAccess, openPaywall } = useTrial()
  const [stats] = useState(MOCK_STATS)
  const showComissao = canAccess('comissao_automatica')

  const handleFinalizar = (id: string) => {
    console.log('finalizar', id)
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

      <StatsCards
        agendamentosHoje={stats.agendamentos_hoje}
        faturamentoHoje={stats.faturamento_hoje}
        barbeirosAtivos={1}
        trend={0}
      />

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
        </CardContent>
      </Card>

      <PaywallModal />
    </div>
  )
}
