import { SignupForm } from '@/components/auth/SignupForm'
import { Scissors } from 'lucide-react'

export function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-barber-500 flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display">Comece seu Trial Grátis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">30 dias grátis, sem cartão de crédito</p>
        </div>
        <div className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-300 p-6 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
