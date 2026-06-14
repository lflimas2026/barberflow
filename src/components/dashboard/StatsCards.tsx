import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  agendamentosHoje: number
  faturamentoHoje: number
  barbeirosAtivos: number
  trend: number
  loading?: boolean
}

export function StatsCards({
  agendamentosHoje,
  faturamentoHoje,
  barbeirosAtivos,
  trend,
  loading,
}: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Agendamentos Hoje</p>
            <Calendar className="w-4 h-4 text-barber-500" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold">{agendamentosHoje}</p>
            <div className={`flex items-center text-xs mb-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Faturamento Hoje</p>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(faturamentoHoje)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Barbeiros Ativos</p>
            <Scissors className="w-4 h-4 text-barber-500" />
          </div>
          <p className="text-3xl font-bold">{barbeirosAtivos}</p>
        </CardContent>
      </Card>
    </div>
  )
}
