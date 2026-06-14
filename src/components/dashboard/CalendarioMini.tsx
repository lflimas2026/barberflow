import { addDays, format, startOfWeek, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface CalendarioMiniProps {
  ocupacao: { data: string; ocupacao: number }[]
  onDayClick?: (data: string) => void
}

export function CalendarioMini({ ocupacao, onDayClick }: CalendarioMiniProps) {
  const today = new Date()
  const start = startOfWeek(today, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  const getOcupacao = (date: Date) => {
    const found = ocupacao.find((o) => isSameDay(parseISO(o.data), date))
    return found?.ocupacao ?? 0
  }

  const getColor = (ocupacao: number) => {
    if (ocupacao === 0) return 'bg-gray-200 dark:bg-dark-400'
    if (ocupacao <= 3) return 'bg-green-400'
    if (ocupacao <= 6) return 'bg-yellow-400'
    return 'bg-barber-500'
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, i) => {
        const ocup = getOcupacao(day)
        const isToday = isSameDay(day, today)
        const dayName = format(day, 'EEE', { locale: ptBR }).slice(0, 3)

        return (
          <button
            key={i}
            onClick={() => onDayClick?.(day.toISOString())}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              isToday && 'bg-barber-50 dark:bg-barber-900/20 ring-1 ring-barber-500',
              'hover:bg-gray-100 dark:hover:bg-dark-300'
            )}
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{dayName}</span>
            <span className={cn('text-sm font-semibold', isToday && 'text-barber-500')}>
              {format(day, 'd')}
            </span>
            <div className={cn('w-2 h-2 rounded-full', getColor(ocup))} />
          </button>
        )
      })}
    </div>
  )
}
