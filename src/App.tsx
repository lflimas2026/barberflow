import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/Login'
import { SignupPage } from '@/pages/Signup'
import { DashboardPage } from '@/pages/Dashboard'
import { AgendamentosPage } from '@/pages/Agendamentos'
import { ClientesPage } from '@/pages/Clientes'
import { BarbeirosPage } from '@/pages/Barbeiros'
import { ServicosPage } from '@/pages/Servicos'
import { BarbeiroDashboardPage } from '@/pages/BarbeiroDashboard'
import { OnboardingPage } from '@/pages/Onboarding'
import { Skeleton } from '@/components/ui/skeleton'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.onboarding_completed) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role !== 'proprietario') return <Navigate to="/barbeiro" replace />
  return <>{children}</>
}

function BarberRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role === 'barbeiro') return <>{children}</>
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-dark-200">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.onboarding_completed ? '/dashboard' : '/onboarding'} replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/onboarding" replace /> : <SignupPage />} />
      <Route path="/onboarding" element={isAuthenticated && !user?.onboarding_completed ? <OnboardingPage /> : <Navigate to="/dashboard" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<OwnerRoute><DashboardPage /></OwnerRoute>} />
        <Route path="/agendamentos" element={<AgendamentosPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/barbeiros" element={<OwnerRoute><BarbeirosPage /></OwnerRoute>} />
        <Route path="/servicos" element={<OwnerRoute><ServicosPage /></OwnerRoute>} />
        <Route path="/barbeiro" element={<BarbeiroDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
