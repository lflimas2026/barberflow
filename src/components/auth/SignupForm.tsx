import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleButton } from './GoogleButton'

export function SignupForm() {
  const { signup, loginWithGoogle, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    barbearia_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { name, email, barbearia_name, phone, password, confirmPassword } = formData

    if (!name || !email || !barbearia_name || !phone || !password) {
      setError('Preencha todos os campos')
      return
    }
    if (password !== confirmPassword) {
      setError('Senhas não conferem')
      return
    }
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    try {
      await signup({ name, email, barbearia_name, phone, password })
      navigate('/onboarding')
    } catch {
      setError('Erro ao criar conta')
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
      navigate('/onboarding')
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
          <span className="bg-white dark:bg-dark-200 px-2 text-gray-500">ou cadastre-se com email</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Seu Nome</Label>
          <Input id="name" placeholder="Fernando Silva" value={formData.name} onChange={handleChange('name')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barbearia">Nome da Barbearia</Label>
          <Input id="barbearia" placeholder="BarberShop do Fernando" value={formData.barbearia_name} onChange={handleChange('barbearia_name')} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange('email')} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone / WhatsApp</Label>
        <Input id="phone" placeholder="(11) 99999-8888" value={formData.phone} onChange={handleChange('phone')} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange('password')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} required />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? 'Criando conta...' : 'Criar conta grátis'}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <button
          type="button"
          className="text-barber-500 font-medium hover:underline"
          onClick={() => navigate('/login')}
        >
          Entrar
        </button>
      </p>

      <p className="text-center text-xs text-gray-400">
        30 dias grátis, sem cartão de crédito
      </p>
    </form>
  )
}
