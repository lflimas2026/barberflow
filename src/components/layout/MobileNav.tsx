import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, useRole } from '@/context/AuthContext'
import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Wrench,
  X,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Wrench,
}

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { user, logout } = useAuth()
  const role = useRole()
  const navigate = useNavigate()

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-dark-200 border-r border-dark-300 animate-slide-up">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-barber-500 flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">BarberFlow</h1>
              <p className="text-xs text-gray-400">Pro</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <Separator className="bg-dark-400" />

        <nav className="p-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-barber-500/10 text-barber-500'
                      : 'text-gray-400 hover:text-white hover:bg-dark-300'
                  )
                }
              >
                {Icon && <Icon className="w-5 h-5" />}
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <Separator className="bg-dark-400" />

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-barber-500 flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.barbearia_name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white"
            onClick={() => {
              logout()
              onClose()
              navigate('/login')
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
