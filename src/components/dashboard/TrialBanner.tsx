import { useAuth } from '@/context/AuthContext'
import { useTrial } from '@/context/TrialContext'
import { getStatusColor } from '@/lib/utils'
import { AlertTriangle, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export function TrialBanner() {
  const { user } = useAuth()
  const { daysLeft, isExpired } = useTrial()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || user?.plan !== 'free_trial') return null

  const progress = Math.max(0, (daysLeft / 30) * 100)

  if (isExpired) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">Trial Expirado</h4>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              Seu período de teste terminou. Faça upgrade para continuar usando todos os recursos.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="bg-barber-500 hover:bg-barber-600" onClick={() => navigate('/upgrade')}>
                <Sparkles className="w-4 h-4 mr-1" />
                Upgrade Pro
              </Button>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (daysLeft <= 5) {
    return (
      <div className="rounded-xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              Trial expira em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
            </h4>
            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
              Faça upgrade para não perder acesso aos recursos premium.
            </p>
            <Progress value={progress} className="mt-2 h-1.5" />
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="bg-barber-500 hover:bg-barber-600" onClick={() => navigate('/upgrade')}>
                <Sparkles className="w-4 h-4 mr-1" />
                Upgrade Pro
              </Button>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-yellow-400 hover:text-yellow-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-barber-100 dark:border-barber-900 bg-barber-50 dark:bg-barber-900/10 p-4 mb-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-barber-500 shrink-0" />
        <p className="text-sm text-barber-700 dark:text-barber-300 flex-1">
          Seu trial expira em <strong>{daysLeft} dias</strong>. Aproveite para explorar todos os recursos!
        </p>
        <button onClick={() => setDismissed(true)} className="text-barber-400 hover:text-barber-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <Progress value={progress} className="mt-3 h-1" />
    </div>
  )
}
