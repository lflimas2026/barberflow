import { useState } from 'react'
import { useTrial } from '@/context/TrialContext'
import { PaywallModal } from '@/components/premium/PaywallModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Lock, Wrench } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Servico } from '@/types'

const MOCK_SERVICOS: Servico[] = [
  { id: 's1', user_id: 'u1', nome: 'Corte de Cabelo', preco: 60, duracao_min: 45, ativo: true, created_at: new Date().toISOString() },
]

const PREMIUM_SERVICOS: Servico[] = [
  { id: 's2', user_id: 'u1', nome: 'Barba', preco: 45, duracao_min: 30, ativo: true, created_at: new Date().toISOString() },
  { id: 's3', user_id: 'u1', nome: 'Corte + Barba (Combo)', preco: 90, duracao_min: 60, ativo: true, created_at: new Date().toISOString() },
  { id: 's4', user_id: 'u1', nome: 'Hidratação Capilar', preco: 80, duracao_min: 50, ativo: true, created_at: new Date().toISOString() },
]

export function ServicosPage() {
  const { canCreateServico, openPaywall } = useTrial()
  const [servicos] = useState(MOCK_SERVICOS)
  const canCreate = canCreateServico()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {servicos.length} {servicos.length === 1 ? 'serviço ativo' : 'serviços ativos'}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button onClick={() => !canCreate && openPaywall('multiplos_servicos')} disabled={!canCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              </div>
            </TooltipTrigger>
            {!canCreate && (
              <TooltipContent>
                <p>Upgrade para Pro para criar múltiplos serviços</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Seus Serviços</span>
              {!canCreate && (
                <Badge variant="warning" className="text-[10px]">
                  Free Trial: 1 serviço
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100 dark:divide-dark-300">
              {servicos.map((servico) => (
                <div key={servico.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-barber-100 dark:bg-barber-900/30 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-barber-500" />
                    </div>
                    <div>
                      <p className="font-medium">{servico.nome}</p>
                      <p className="text-sm text-gray-500">{servico.duracao_min} min</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(servico.preco)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!canCreate && (
          <Card className="opacity-60">
            <CardContent className="p-5">
              <div className="text-center py-6">
                <Lock className="w-8 h-8 text-gray-300 dark:text-dark-500 mx-auto mb-3" />
                <p className="font-medium text-gray-500 mb-1">Serviços Premium Bloqueados</p>
                <p className="text-sm text-gray-400 mb-4">Faça upgrade para desbloquear serviços adicionais</p>
                <div className="space-y-3 max-w-sm mx-auto">
                  {PREMIUM_SERVICOS.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-300">
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-400">{s.nome}</p>
                        <p className="text-xs text-gray-400">{s.duracao_min} min</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-400">{formatCurrency(s.preco)}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-4 text-barber-500 border-barber-500"
                  onClick={() => openPaywall('multiplos_servicos')}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Upgrade para Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <PaywallModal />
    </div>
  )
}
