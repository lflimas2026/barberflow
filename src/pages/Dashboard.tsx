import { useState } from 'react'
import { useTrial } from '@/context/TrialContext'
import { TrialBanner } from '@/components/dashboard/TrialBanner'
import { FilaHoje } from '@/components/dashboard/FilaHoje'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { CalendarioMini } from '@/components/dashboard/CalendarioMini'
import { PaywallModal } from '@/components/premium/PaywallModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Agendamento, DashboardStats } from '@/types'
import { addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RechartsComponents } from '@/components/dashboard/RechartsComponents'

const MOCK_STATS: DashboardStats = {
  agendamentos_hoje: 8,
  faturamento_hoje: 560,
  barbeiros_ativos: 3,
  ticket_medio: 70,
  agendamentos_trend: 12,
  faturamento_breakdown: { servicos: 480, produtos: 80 },
  fila_hoje: [
    {
      id: '1',
      barbeiro_id: 'b1',
      cliente_id: 'c1',
      servico_id: 's1',
      data_hora: new Date().toISOString(),
      duracao_min: 45,
      status: 'aguardando',
      valor: 60,
      criado_em: new Date().toISOString(),
      barbeiro: { id: 'b1', user_id: 'u1', name: 'Fernando', photo_url: '', comissao_percent: 50, ativo: true, created_at: new Date().toISOString() },
      cliente: { id: 'c1', user_id: 'u1', nome: 'Carlos Silva', whatsapp: '(11) 98888-7777', total_visitas: 5, criado_em: new Date().toISOString() },
      servico: { id: 's1', user_id: 'u1', nome: 'Corte de Cabelo', preco: 60, duracao_min: 45, ativo: true, created_at: new Date().toISOString() },
    },
    {
      id: '2',
      barbeiro_id: 'b2',
      cliente_id: 'c2',
      servico_id: 's2',
      data_hora: new Date(Date.now() + 3600000).toISOString(),
      duracao_min: 30,
      status: 'confirmado',
      valor: 45,
      criado_em: new Date().toISOString(),
      barbeiro: { id: 'b2', user_id: 'u1', name: 'Pedro', photo_url: '', comissao_percent: 50, ativo: true, created_at: new Date().toISOString() },
      cliente: { id: 'c2', user_id: 'u1', nome: 'João Santos', whatsapp: '(11) 97777-6666', total_visitas: 3, criado_em: new Date().toISOString() },
      servico: { id: 's2', user_id: 'u1', nome: 'Barba', preco: 45, duracao_min: 30, ativo: true, created_at: new Date().toISOString() },
    },
  ],
  proximos_7_dias: Array.from({ length: 7 }, (_, i) => ({
    data: addDays(new Date(), i).toISOString(),
    ocupacao: Math.floor(Math.random() * 8) + 2,
  })),
}

export function DashboardPage() {
  const { canAccess, openPaywall } = useTrial()
  const navigate = useNavigate()
  const [stats] = useState<DashboardStats>(MOCK_STATS)
  const [loading] = useState(false)
  const showRelatorios = canAccess('relatorios')

  const handleRelatoriosClick = () => {
    if (!showRelatorios) {
      openPaywall('relatorios')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <TrialBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Button onClick={() => navigate('/agendamentos?novo=true')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <StatsCards
        agendamentosHoje={stats.agendamentos_hoje}
        faturamentoHoje={stats.faturamento_hoje}
        barbeirosAtivos={stats.barbeiros_ativos}
        trend={stats.agendamentos_trend}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Fila Hoje
              <Badge variant="secondary">{stats.fila_hoje.length} clientes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <FilaHoje agendamentos={stats.fila_hoje} />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarioMini
                ocupacao={stats.proximos_7_dias}
                onDayClick={(data) => console.log('day', data)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Relatórios</CardTitle>
                {!showRelatorios && (
                  <Badge variant="premium" className="text-[10px] px-1.5">
                    PRO
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showRelatorios ? (
                <RechartsComponents />
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-8 h-8 text-gray-300 dark:text-dark-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">Gráficos de faturamento disponíveis no plano Pro</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRelatoriosClick}
                    className="text-barber-500 border-barber-500"
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Upgrade para Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PaywallModal />
    </div>
  )
}
