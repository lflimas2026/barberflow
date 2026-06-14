import { useState } from 'react'
import { useTrial } from '@/context/TrialContext'
import { PaywallModal } from '@/components/premium/PaywallModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlus, Lock, Scissors } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Barbeiro } from '@/types'

const MOCK_BARBEIROS: Barbeiro[] = [
  { id: 'b1', user_id: 'u1', name: 'Fernando Silva', photo_url: '', comissao_percent: 50, ativo: true, created_at: new Date().toISOString() },
  { id: 'b2', user_id: 'u1', name: 'Pedro Santos', photo_url: '', comissao_percent: 50, ativo: true, created_at: new Date().toISOString() },
]

export function BarbeirosPage() {
  const { canAccess, canAddBarbeiro, openPaywall } = useTrial()
  const [barbeiros] = useState(MOCK_BARBEIROS)
  const showComissao = canAccess('comissao_automatica')
  const canAdd = canAddBarbeiro(barbeiros.length)

  const handleAddBarbeiro = () => {
    if (!canAdd) {
      openPaywall('multi_barbeiros')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Barbeiros</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {barbeiros.length} {barbeiros.length === 1 ? 'barbeiro cadastrado' : 'barbeiros cadastrados'}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button onClick={handleAddBarbeiro} disabled={!canAdd}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </TooltipTrigger>
            {!canAdd && (
              <TooltipContent>
                <p>Upgrade para Pro - Máx 1 barbeiro no Free</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barbeiros.map((barbeiro) => (
          <Card key={barbeiro.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={barbeiro.photo_url} />
                  <AvatarFallback className="bg-barber-100 dark:bg-barber-900 text-barber-600 text-lg">
                    {barbeiro.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{barbeiro.name}</p>
                    <Badge variant={barbeiro.ativo ? 'success' : 'secondary'} className="text-[10px]">
                      {barbeiro.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Scissors className="w-3 h-3" />
                      {showComissao ? `${barbeiro.comissao_percent}%` : (
                        <span className="flex items-center gap-1 text-barber-500 cursor-pointer" onClick={() => openPaywall('comissao_automatica')}>
                          <Lock className="w-3 h-3" /> Comissão
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Ativo</span>
                      <Switch checked={barbeiro.ativo} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaywallModal />
    </div>
  )
}
