import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrial } from '@/context/TrialContext'
import { PaywallModal } from '@/components/premium/PaywallModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Lock, Wrench, Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api'
import type { Servico } from '@/types'

export function ServicosPage() {
  const { user } = useAuth()
  const { canCreateServico, openPaywall } = useTrial()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const canCreate = canCreateServico()

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    api.servicos.list(user.id)
      .then((data) => setServicos(data.servicos))
      .catch(() => setServicos([]))
      .finally(() => setLoading(false))
  }, [user?.id])

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
        {loading ? (
          <Card>
            <CardContent className="p-5">
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-dark-300 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-dark-300 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-dark-300 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-dark-300 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : servicos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Scissors className="w-8 h-8 text-gray-300 dark:text-dark-500 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum serviço cadastrado</p>
            </CardContent>
          </Card>
        ) : (
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
        )}

        {!canCreate && servicos.length > 0 && (
          <Card className="opacity-60">
            <CardContent className="p-5">
              <div className="text-center py-6">
                <Lock className="w-8 h-8 text-gray-300 dark:text-dark-500 mx-auto mb-3" />
                <p className="font-medium text-gray-500 mb-1">Serviços Premium Bloqueados</p>
                <p className="text-sm text-gray-400 mb-4">Faça upgrade para desbloquear serviços adicionais</p>
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