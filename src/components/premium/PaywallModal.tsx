import { useTrial } from '@/context/TrialContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles, Check } from 'lucide-react'

const featureLabels: Record<string, string> = {
  multi_barbeiros: 'Múltiplos Barbeiros',
  relatorios: 'Relatórios Financeiros',
  historico_completo: 'Histórico Completo do Cliente',
  gestao_estoque: 'Gestão de Estoque/Produtos',
  comissao_automatica: 'Comissão Automática',
  google_maps: 'Integração Google Maps',
  loyalty_points: 'Programa de Fidelidade',
  multiplos_servicos: 'Múltiplos Serviços',
  dashboard_barbeiro: 'Dashboard do Barbeiro',
}

const proFeatures = [
  'Múltiplos barbeiros',
  'Relatórios financeiros',
  'Histórico completo de clientes',
  'Múltiplos serviços',
  'Dashboard do barbeiro',
  'Suporte prioritário',
]

const proPlusFeatures = [
  'Tudo do Pro',
  'Gestão de estoque',
  'Comissão automática',
  'Google Maps',
  'Programa de fidelidade',
  'API de pagamentos',
]

export function PaywallModal() {
  const { showPaywall, paywallFeature, closePaywall, handleUpgrade } = useTrial()

  if (!showPaywall) return null

  const featureName = featureLabels[paywallFeature] ?? 'Recurso Premium'

  return (
    <Dialog open={showPaywall} onOpenChange={closePaywall}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-barber-100 dark:bg-barber-900/30 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-barber-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            {featureName}
          </DialogTitle>
          <DialogDescription className="text-center">
            Você está no plano gratuito. Faça upgrade para desbloquear este e outros recursos premium.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-xl border border-barber-200 dark:border-barber-800 bg-barber-50 dark:bg-barber-900/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-barber-500" />
              <h4 className="font-semibold text-barber-700 dark:text-barber-300">Plano Pro</h4>
              <span className="text-xs bg-barber-500 text-white px-2 py-0.5 rounded-full">Popular</span>
            </div>
            <p className="text-2xl font-bold mb-3">
              R$ 49,90<span className="text-sm font-normal text-gray-500">/mês</span>
            </p>
            <ul className="space-y-2">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-dark-400 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold">Plano Pro+</h4>
            </div>
            <p className="text-2xl font-bold mb-3">
              R$ 89,90<span className="text-sm font-normal text-gray-500">/mês</span>
            </p>
            <ul className="space-y-2">
              {proPlusFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="w-full h-11" onClick={handleUpgrade}>
            <Sparkles className="w-4 h-4 mr-2" />
            Fazer Upgrade Agora
          </Button>
          <Button variant="ghost" className="w-full" onClick={closePaywall}>
            Continuar no plano gratuito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
