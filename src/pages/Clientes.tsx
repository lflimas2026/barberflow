import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrial } from '@/context/TrialContext'
import { PaywallModal } from '@/components/premium/PaywallModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Search, Phone, Clock, Lock, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { api } from '@/lib/api'
import type { Cliente } from '@/types'

export function ClientesPage() {
  const { user } = useAuth()
  const { canAccess, openPaywall } = useTrial()
  const [search, setSearch] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const showHistorico = canAccess('historico_completo')

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    api.clientes.list(user.id, search || undefined)
      .then((data) => setClientes(data.clientes))
      .catch(() => setClientes([]))
      .finally(() => setLoading(false))
  }, [user?.id, search])

  const filtered = clientes.filter(
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
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-dark-300 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-dark-300 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 dark:bg-dark-300 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-8 h-8 text-gray-300 dark:text-dark-500 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((cliente) => (
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
          ))
        )}
      </div>

      <PaywallModal />
    </div>
  )
}