import { LoginForm } from '@/components/auth/LoginForm'
import { Scissors } from 'lucide-react'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 flex">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-barber-500 flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-display">BarberFlow Pro</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gestão inteligente para sua barbearia</p>
          </div>
          <div className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-300 p-6 shadow-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-barber-500 to-barber-800 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h2 className="text-4xl font-bold font-display mb-4">
            Gerencie sua barbearia com excelência
          </h2>
          <p className="text-lg text-white/80 mb-6">
            Agendamentos, barbeiros, finanças e muito mais em um só lugar.
          </p>
          <div className="space-y-3">
            {[
              'Agendamento online 24h',
              'Controle de barbeiros e comissões',
              'Relatórios financeiros em tempo real',
              'Integração com WhatsApp',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
