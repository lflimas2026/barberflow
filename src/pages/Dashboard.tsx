import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
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
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RechartsComponents } from '@/components/dashboard/RechartsComponents'
import { api } from '@/lib/api'
import type { Agendamento } from '@/types'

export function DashboardPage() {
  const { user } = useAuth()
  const { canAccess, openPaywall } = useTrial()
  const navigate = useNavigate()
  const showRelatorios = canAccess('relatorios')

  const [stats, setStats] = useState({
    agendamentos_hoje: 0,
    faturamento_hoje: 0,
    barbeiros_ativos: 0,
    ticket_medio: 0,
    agendamentos_trend: 0,
    fila_hoje: [] as Agendamento[],
    proximos_7_dias: [] as { data: string; ocupacao: number }[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    api.dashboard.stats(user.id)
      .then((data) => {
        setStats((prev) => ({
          ...prev,
          agendamentos_hoje: data.agendamentos_hoje,
          faturamento_hoje: data.faturamento_hoje,
          barbeiros_ativos: data.barbeiros_ativos,
          proximos_7_dias: data.proximos_7_dias.length > 0
            ? data.proximos_7_dias
            : Array.from({ length: 7 }, (_, i) => ({
                data: addDays(new Date(), i).toISOString(),
                ocupacao: 0,
              })),
        }))
      })
      .catch(() => {
        // Fallback: empty state
        setStats((prev) => ({
          ...prev,
          proximos_7_dias: Array.from({ length: 7 }, (_, i) => ({
            data: addDays(new Date(), i).toISOString(),
            ocupacao: 0,
          })),
        }))
      })
      .finally(() => setLoading(false))

    api.agendamentos.list({ user_id: user.id, date: new Date().toISOString().split('T')[0] })
      .then((data) => {
        setStats((prev) => ({ ...prev, fila_hoje: data.agendamentos }))
      })
      .catch(() => {})
  }, [user?.id])

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