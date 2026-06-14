import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Scissors, Clock, MessageSquare, ArrowRight, ArrowLeft, Check } from 'lucide-react'

interface StepProps {
  onNext: () => void
  onBack?: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

interface OnboardingData {
  useAsBarber: boolean
  barberName: string
  workingDays: number[]
  workingStart: string
  workingEnd: string
  whatsappIntegrated: boolean
}

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const steps = [
  { title: 'Bem-vindo', icon: Scissors },
  { title: 'Barbeiro', icon: Scissors },
  { title: 'Horários', icon: Clock },
  { title: 'WhatsApp', icon: MessageSquare },
]

export function OnboardingWizard() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    useAsBarber: true,
    barberName: '',
    workingDays: [1, 2, 3, 4, 5],
    workingStart: '09:00',
    workingEnd: '19:00',
    whatsappIntegrated: false,
  })

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const toggleDay = (day: number) => {
    setData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }))
  }

  const handleFinish = () => {
    updateUser({ onboarding_completed: true })
    navigate('/dashboard')
  }

  const isLastStep = step === steps.length - 1

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-barber-500 flex items-center justify-center">
            <Scissors className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i <= step
                    ? 'bg-barber-500 text-white'
                    : 'bg-gray-200 dark:bg-dark-300 text-gray-400'
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    i < step ? 'bg-barber-500' : 'bg-gray-200 dark:bg-dark-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-300 p-6 shadow-sm">
          {step === 0 && <WelcomeStep onNext={() => setStep(1)} data={data} updateData={updateData} />}
          {step === 1 && (
            <BarberStep
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
              data={data}
              updateData={updateData}
            />
          )}
          {step === 2 && (
            <ScheduleStep
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              data={data}
              updateData={updateData}
            />
          )}
          {step === 3 && (
            <WhatsAppStep
              onNext={handleFinish}
              onBack={() => setStep(2)}
              data={data}
              updateData={updateData}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function WelcomeStep({ onNext }: StepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-barber-100 dark:bg-barber-900/30 flex items-center justify-center mx-auto">
        <Scissors className="w-10 h-10 text-barber-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao BarberFlow</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Vamos configurar sua barbearia em menos de 2 minutos.
        </p>
      </div>
      <Button onClick={onNext} className="w-full h-11">
        Começar
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}

function BarberStep({ onNext, onBack, data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Scissors className="w-10 h-10 text-barber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-1">Adicione seu barbeiro</h2>
        <p className="text-sm text-gray-500">Você pode começar sozinho ou adicionar um barbeiro</p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-dark-300">
        <div>
          <p className="font-medium text-sm">Usar você mesmo como barbeiro</p>
          <p className="text-xs text-gray-500">Atenda seus próprios clientes</p>
        </div>
        <Switch checked={data.useAsBarber} onCheckedChange={(v) => updateData({ useAsBarber: v })} />
      </div>

      {!data.useAsBarber && (
        <div className="space-y-2">
          <Label>Nome do barbeiro</Label>
          <Input
            placeholder="Nome do barbeiro"
            value={data.barberName}
            onChange={(e) => updateData({ barberName: e.target.value })}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continuar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function ScheduleStep({ onNext, onBack, data, updateData }: StepProps) {
  const toggleDay = (day: number) => {
    updateData({
      workingDays: data.workingDays.includes(day)
        ? data.workingDays.filter((d) => d !== day)
        : [...data.workingDays, day],
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Clock className="w-10 h-10 text-barber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-1">Configure horários</h2>
        <p className="text-sm text-gray-500">Dias e horários de funcionamento</p>
      </div>

      <div>
        <Label className="mb-2 block">Dias de funcionamento</Label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                data.workingDays.includes(i)
                  ? 'bg-barber-500 text-white'
                  : 'bg-gray-100 dark:bg-dark-300 text-gray-500'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Abertura</Label>
          <Input
            type="time"
            value={data.workingStart}
            onChange={(e) => updateData({ workingStart: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Fechamento</Label>
          <Input
            type="time"
            value={data.workingEnd}
            onChange={(e) => updateData({ workingEnd: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continuar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function WhatsAppStep({ onNext, onBack, data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="w-10 h-10 text-barber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-1">Integre WhatsApp</h2>
        <p className="text-sm text-gray-500">
          Envie confirmações e lembretes automáticos para seus clientes
        </p>
      </div>

      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
        <p className="text-sm text-green-800 dark:text-green-200">
          Para integrar o WhatsApp Business, acesse o link abaixo e siga as instruções:
        </p>
        <a
          href="https://developers.facebook.com/docs/whatsapp/onboarding"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-600 hover:underline mt-2 block"
        >
          Configurar WhatsApp Business API →
        </a>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-dark-300">
        <div>
          <p className="font-medium text-sm">Pular integração por enquanto</p>
          <p className="text-xs text-gray-500">Você pode configurar depois</p>
        </div>
        <Switch
          checked={!data.whatsappIntegrated}
          onCheckedChange={(v) => updateData({ whatsappIntegrated: !v })}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} className="flex-1">
          Finalizar <Check className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
