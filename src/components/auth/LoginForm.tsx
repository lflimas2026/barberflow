import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleButton } from './GoogleButton'

export function LoginForm() {
  const { login, loginWithGoogle, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Erro ao fazer login')
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch {
      setError('Erro ao fazer login com Google')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GoogleButton onClick={handleGoogle} isLoading={isLoading} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-dark-400" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-dark-200 px-2 text-gray-500">ou continue com email</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Não tem conta?{' '}
        <button
          type="button"
          className="text-barber-500 font-medium hover:underline"
          onClick={() => navigate('/signup')}
        >
          Cadastre-se
        </button>
      </p>

      <p className="text-center text-xs text-gray-400">
        30 dias grátis, sem cartão de crédito
      </p>
    </form>
  )
}
