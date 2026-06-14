import type { Agendamento } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, User } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getStatusIcon, getStatusColor } from '@/lib/utils'

interface FilaHojeProps {
  agendamentos: Agendamento[]
}

export function FilaHoje({ agendamentos }: FilaHojeProps) {
  const pendentes = agendamentos.filter((a) => a.status === 'aguardando' || a.status === 'confirmado')

  if (pendentes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-300 flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum agendamento hoje</p>
        <p className="text-sm text-gray-400 mt-1">A fila está vazia</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {pendentes.map((agendamento, index) => (
        <div
          key={agendamento.id}
          className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors"
        >
          <div className="flex-shrink-0 relative">
            <Avatar className="w-12 h-12 border-2 border-white dark:border-dark-200">
              <AvatarImage src={agendamento.barbeiro?.photo_url} />
              <AvatarFallback className="bg-barber-100 dark:bg-barber-900 text-barber-600">
                {agendamento.barbeiro?.name?.charAt(0) ?? 'B'}
              </AvatarFallback>
            </Avatar>
            {index === 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-barber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                1
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{agendamento.cliente?.nome ?? 'Cliente'}</p>
              <span className="text-xs">{getStatusIcon(agendamento.status)}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {format(parseISO(agendamento.data_hora), "HH:mm", { locale: ptBR })}
              </div>
              <span className="text-xs text-gray-400">{agendamento.servico?.nome ?? 'Corte'}</span>
            </div>
          </div>

          {index === 0 && (
            <Badge variant="success" className="text-xs">
              Próximo
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}
