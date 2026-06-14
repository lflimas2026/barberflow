import { useState } from 'react'
import { useTrial } from '@/context/TrialContext'
import { PaywallModal } from '@/components/premium/PaywallModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Search, Phone, Clock, Lock } from 'lucide-react'
import type { Cliente } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MOCK_CLIENTES: Cliente[] = [
  { id: 'c1', user_id: 'u1', nome: 'Carlos Silva', whatsapp: '(11) 98888-7777', email: 'carlos@email.com', ultimo_agendamento: new Date().toISOString(), total_visitas: 5, criado_em: new Date().toISOString() },
  { id: 'c2', user_id: 'u1', nome: 'João Santos', whatsapp: '(11) 97777-6666', ultimo_agendamento: new Date(Date.now() - 86400000 * 3).toISOString(), total_visitas: 3, criado_em: new Date().toISOString() },
  { id: 'c3', user_id: 'u1', nome: 'Rafael Oliveira', whatsapp: '(11) 96666-5555', email: 'rafael@email.com', ultimo_agendamento: new Date(Date.now() - 86400000 * 7).toISOString(), observacoes: 'Preferência por corte degradê', total_visitas: 8, criado_em: new Date().toISOString() },
  { id: 'c4', user_id: 'u1', nome: 'Lucas Mendes', whatsapp: '(11) 95555-4444', total_visitas: 1, criado_em: new Date().toISOString() },
]

export function ClientesPage() {
  const { canAccess, openPaywall } = useTrial()
  const [search, setSearch] = useState('')
  const showHistorico = canAccess('historico_completo')

  const filtered = MOCK_CLIENTES.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search)
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((cliente) => (
          <Card key={cliente.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-barber-100 dark:bg-barber-900 text-barber-600">
                    {cliente.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{cliente.nome}</p>
                    <Badge variant="secondary" className="text-xs">
                      {cliente.total_visitas} visitas
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-3 h-3" />
                      {cliente.whatsapp}
                    </div>
                    {cliente.ultimo_agendamento && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {format(new Date(cliente.ultimo_agendamento), "dd/MM", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  {showHistorico && cliente.observacoes && (
                    <p className="text-xs text-gray-400 mt-1 italic">{cliente.observacoes}</p>
                  )}
                </div>

                {!showHistorico && (
                  <button
                    onClick={() => openPaywall('historico_completo')}
                    className="flex items-center gap-1 text-xs text-barber-500 hover:underline"
                  >
                    <Lock className="w-3 h-3" />
                    Histórico
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaywallModal />
    </div>
  )
}
