import { useState } from 'react'
import { format, startOfWeek, addDays, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, MessageSquare, Clock, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn, getStatusIcon, getStatusColor, formatCurrency } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import type { Agendamento, AgendamentoStatus } from '@/types'

const MOCK_AGENDAMENTOS: Agendamento[] = [
  {
    id: '1', barbeiro_id: 'b1', cliente_id: 'c1', servico_id: 's1',
    data_hora: new Date().toISOString(), duracao_min: 45,
    status: 'aguardando', valor: 60, criado_em: new Date().toISOString(),
    barbeiro: { id: 'b1', user_id: 'u1', name: 'Fernando', photo_url: '', comissao_percent: 50, ativo: true, created_at: new Date().toISOString() },
    cliente: { id: 'c1', user_id: 'u1', nome: 'Carlos Silva', whatsapp: '(11) 98888-7777', total_visitas: 5, criado_em: new Date().toISOString() },
    servico: { id: 's1', user_id: 'u1', nome: 'Corte de Cabelo', preco: 60, duracao_min: 45, ativo: true, created_at: new Date().toISOString() },
  },
  {
    id: '2', barbeiro_id: 'b2', cliente_id: 'c2', servico_id: 's2',
    data_hora: new Date(Date.now() + 3600000).toISOString(), duracao_min: 30,
    status: 'confirmado', valor: 45, criado_em: new Date().toISOString(),
    barbeiro: { id: 'b2', user_id: 'u1', name: 'Pedro', photo_url: '', comissao_percent: 50, ativo: true, created_at: new Date().toISOString() },
    cliente: { id: 'c2', user_id: 'u1', nome: 'João Santos', whatsapp: '(11) 97777-6666', total_visitas: 3, criado_em: new Date().toISOString() },
    servico: { id: 's2', user_id: 'u1', nome: 'Barba', preco: 45, duracao_min: 30, ativo: true, created_at: new Date().toISOString() },
  },
  {
    id: '3', barbeiro_id: 'b1', cliente_id: 'c3', servico_id: 's1',
    data_hora: new Date(Date.now() + 7200000).toISOString(), duracao_min: 45,
    status: 'finalizado', valor: 60, criado_em: new Date().toISOString(),
    cliente: { id: 'c3', user_id: 'u1', nome: 'Rafael Oliveira', whatsapp: '(11) 96666-5555', total_visitas: 8, criado_em: new Date().toISOString() },
    servico: { id: 's1', user_id: 'u1', nome: 'Corte de Cabelo', preco: 60, duracao_min: 45, ativo: true, created_at: new Date().toISOString() },
  },
]

export function AgendamentosPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'dia' | 'semana'>('dia')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<AgendamentoStatus | 'todos'>('todos')

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const filtered = MOCK_AGENDAMENTOS.filter((a) => {
    const sameDay = isSameDay(parseISO(a.data_hora), selectedDate)
    const statusMatch = statusFilter === 'todos' || a.status === statusFilter
    return sameDay && statusMatch
  })

  const handleWhatsApp = (clienteNome: string, data: string, barbeiroNome: string) => {
    const hora = format(parseISO(data), "HH:mm")
    const msg = `Olá ${clienteNome}, sua consulta é hoje às ${hora} com ${barbeiroNome}`
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Button onClick={() => navigate('/agendamentos/novo')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as 'dia' | 'semana')}>
          <TabsList>
            <TabsTrigger value="dia">Dia</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => addDays(d, -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-2">
            {format(selectedDate, "dd/MM")}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-1 ml-auto">
          {(['todos', 'aguardando', 'confirmado', 'finalizado', 'cancelado'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-barber-500 text-white'
                  : 'bg-gray-100 dark:bg-dark-300 text-gray-500 hover:bg-gray-200'
              )}
            >
              {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view === 'semana' && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const dayAgendamentos = MOCK_AGENDAMENTOS.filter((a) =>
              isSameDay(parseISO(a.data_hora), day)
            )
            const isToday = isSameDay(day, new Date())
            return (
              <button
                key={i}
                onClick={() => { setSelectedDate(day); setView('dia') }}
                className={cn(
                  'p-2 rounded-lg border text-center transition-colors',
                  isToday && 'border-barber-500 bg-barber-50 dark:bg-barber-900/20',
                  'hover:bg-gray-100 dark:hover:bg-dark-300'
                )}
              >
                <p className="text-xs text-gray-500">{format(day, 'EEE', { locale: ptBR }).slice(0, 3)}</p>
                <p className={cn('text-lg font-bold', isToday && 'text-barber-500')}>
                  {format(day, 'd')}
                </p>
                <p className="text-xs text-gray-400">{dayAgendamentos.length} agend.</p>
              </button>
            )
          })}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Nenhum agendamento para esta data</p>
              <Button variant="outline" className="mt-3" onClick={() => navigate('/agendamentos/novo')}>
                <Plus className="w-4 h-4 mr-2" /> Criar Agendamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          filtered.map((agendamento) => (
            <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold">{format(parseISO(agendamento.data_hora), "HH:mm")}</p>
                    <p className="text-xs text-gray-500">{agendamento.duracao_min}min</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{agendamento.cliente?.nome ?? 'Cliente'}</p>
                      <span className="text-sm">{getStatusIcon(agendamento.status)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {agendamento.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{agendamento.servico?.nome}</span>
                      <span>•</span>
                      <span>R$ {agendamento.valor.toFixed(2)}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[10px]">
                            {agendamento.barbeiro?.name?.charAt(0) ?? 'B'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{agendamento.barbeiro?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {agendamento.status !== 'cancelado' && agendamento.status !== 'finalizado' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleWhatsApp(
                            agendamento.cliente?.nome ?? '',
                            agendamento.data_hora,
                            agendamento.barbeiro?.name ?? ''
                          )
                        }
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
