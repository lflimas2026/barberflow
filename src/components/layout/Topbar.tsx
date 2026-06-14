import { useAuth } from '@/context/AuthContext'
import { useTrial } from '@/context/TrialContext'
import { getTrialDaysLeft } from '@/lib/trial'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { Bell, Menu, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth()
  const { daysLeft, isExpired } = useTrial()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-dark-300">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          {isMobile && (
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-barber-500" />
              <span className="font-bold text-lg">BarberFlow</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user?.plan === 'free_trial' && !isExpired && (
            <Badge variant="warning" className="hidden sm:inline-flex">
              Trial: {daysLeft}d
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive" className="hidden sm:inline-flex">
              Trial Expirado
            </Badge>
          )}
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex text-barber-500 border-barber-500"
            onClick={() => navigate('/upgrade')}
          >
            Upgrade Pro
          </Button>
        </div>
      </div>
    </header>
  )
}
