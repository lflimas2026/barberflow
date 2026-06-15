import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Sparkles, ArrowLeft, CreditCard, Building, Lock, Copy, Download, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'

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

interface CheckoutForm {
  cardNumber: string
  cardName: string
  expiry: string
  cvv: string
  cpf: string
}

interface PixData {
  encodedImage: string
  payload: string
  expirationDate: string
}

interface BoletoData {
  url: string
  barCode: string
}

export function UpgradePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_plus'>('pro')
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card')
  const [step, setStep] = useState<'plans' | 'payment'>('plans')
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null)
  const [form, setForm] = useState<CheckoutForm>({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    cpf: '',
  })

  const prices = { pro: 49.90, pro_plus: 89.90 }
  const planLabels = { pro: 'Pro', pro_plus: 'Pro+' }

  const handleInputChange = (field: keyof CheckoutForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleContinueToPayment = () => {
    setStep('payment')
  }

  const handleSubmitPayment = async () => {
    const cpfClean = form.cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      addToast({ title: 'CPF obrigatório', description: 'Informe um CPF válido para gerar o pagamento.', variant: 'error' })
      return
    }

    setProcessing(true)
    const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname !== 'localhost' ? 'https://barberflow-api.lflimas2022.workers.dev' : 'http://localhost:8787')

    const body: Record<string, unknown> = {
      plan: selectedPlan,
      userId: user?.id,
      paymentMethod,
      customer: {
        name: user?.name,
        email: user?.email,
        cpf: cpfClean,
      },
    }

    if (paymentMethod === 'credit_card') {
      const [expiryMonth, expiryYear] = form.expiry.split('/')
      body.customer = {
        ...(body.customer as object),
        cardName: form.cardName,
        cardNumber: form.cardNumber.replace(/\s/g, ''),
        cardExpiry: form.expiry,
        cardExpiryMonth: expiryMonth,
        cardExpiryYear: expiryYear ? `20${expiryYear}` : '',
        cardCvv: form.cvv,
      }
    }

    try {
      const res = await fetch(`${apiUrl}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (data.success) {
        if (data.pix) {
          setPixData(data.pix)
        } else if (data.boleto) {
          setBoletoData(data.boleto)
        } else {
          setPaymentSuccess(true)
          addToast({ title: 'Pagamento confirmado!', description: 'Seu plano foi ativado.', variant: 'success' })
        }
      } else if (data.checkout_url) {
        window.open(data.checkout_url, '_blank')
      } else {
        addToast({ title: 'Erro no pagamento', description: data.error || 'Tente novamente mais tarde.', variant: 'error' })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Não foi possível processar o pagamento.'
      addToast({ title: 'Erro de conexão', description: msg, variant: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast({ title: 'Copiado!', description: 'Código Pix copiado para a área de transferência.' })
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
        <div className="max-w-lg mx-auto p-4 space-y-6 animate-fade-in">
          <button
            onClick={() => setStep('plans')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para planos
          </button>

          <div>
            <h1 className="text-2xl font-bold">Finalizar Assinatura</h1>
            <p className="text-sm text-gray-500 mt-1">
              Plano {planLabels[selectedPlan]} - R$ {prices[selectedPlan].toFixed(2)}/mês
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Forma de Pagamento</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('credit_card')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-barber-500 bg-barber-50 dark:bg-barber-900/20 text-barber-600'
                    : 'border-gray-200 dark:border-dark-400 hover:border-barber-300'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Cartão
              </button>
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-barber-500 bg-barber-50 dark:bg-barber-900/20 text-barber-600'
                    : 'border-gray-200 dark:border-dark-400 hover:border-barber-300'
                }`}
              >
                <Zap className="w-5 h-5" />
                Pix
              </button>
              <button
                onClick={() => setPaymentMethod('boleto')}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  paymentMethod === 'boleto'
                    ? 'border-barber-500 bg-barber-50 dark:bg-barber-900/20 text-barber-600'
                    : 'border-gray-200 dark:border-dark-400 hover:border-barber-300'
                }`}
              >
                <Building className="w-5 h-5" />
                Boleto
              </button>
            </div>
          </div>

          {paymentMethod === 'credit_card' && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Número do Cartão</label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm"
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={handleInputChange('cardNumber')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm">Validade</label>
                    <input
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm"
                      placeholder="MM/AA"
                      value={form.expiry}
                      onChange={handleInputChange('expiry')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">CVV</label>
                    <input
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm"
                      placeholder="123"
                      value={form.cvv}
                      onChange={handleInputChange('cvv')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Nome no Cartão</label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm"
                    placeholder="NOME DO TITULAR"
                    value={form.cardName}
                    onChange={handleInputChange('cardName')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">CPF do Titular</label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm"
                    placeholder="123.456.789-00"
                    value={form.cpf}
                    onChange={handleInputChange('cpf')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'pix' && !pixData && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <Zap className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium">Pagamento via Pix</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Após confirmar, geraremos um QR Code para pagamento.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm"
                    placeholder="123.456.789-00"
                    value={form.cpf}
                    onChange={handleInputChange('cpf')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'pix' && pixData && (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <Zap className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-600">QR Code Gerado!</p>
                <p className="text-sm text-gray-500">
                  Escaneie o QR Code abaixo com seu banco para pagar
                </p>
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${pixData.encodedImage}`}
                    alt="PIX QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyToClipboard(pixData.payload)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar código
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Expira em: {new Date(pixData.expirationDate).toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'boleto' && !boletoData && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <Building className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="font-medium">Boleto Bancário</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Vencimento em 3 dias úteis. O plano será ativado após a confirmação.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 text-sm"
                    placeholder="123.456.789-00"
                    value={form.cpf}
                    onChange={handleInputChange('cpf')}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'boleto' && boletoData && (
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <Building className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <p className="font-medium text-blue-600">Boleto Gerado!</p>
                <p className="text-sm text-gray-500">
                  Imprima ou baixe o boleto para pagar
                </p>
                <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Código de Barras</p>
                  <p className="text-sm font-mono break-all">{boletoData.barCode}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(boletoData.url, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Boleto
                </Button>
              </CardContent>
            </Card>
          )}

          {paymentSuccess && (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-lg font-semibold text-green-600">Pagamento Confirmado!</p>
                <p className="text-sm text-gray-500">
                  Seu plano {planLabels[selectedPlan]} foi ativado com sucesso.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Ir para o Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {!pixData && !boletoData && !paymentSuccess && (
            <Button className="w-full h-12" onClick={handleSubmitPayment} disabled={processing}>
              <Lock className="w-4 h-4 mr-2" />
              {processing ? 'Processando...' : (
                paymentMethod === 'credit_card'
                  ? `Pagar R$ ${prices[selectedPlan].toFixed(2)}`
                  : paymentMethod === 'pix'
                  ? 'Gerar QR Code Pix'
                  : 'Gerar Boleto'
              )}
            </Button>
          )}

          <p className="text-xs text-center text-gray-400">
            Pagamento processado com segurança via Asaas. Seus dados não serão armazenados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
      <div className="max-w-lg mx-auto p-4 space-y-6 animate-fade-in pb-20">
        <div className="text-center pt-4">
          <div className="w-16 h-16 rounded-xl bg-barber-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Upgrade para Premium</h1>
          <p className="text-sm text-gray-500 mt-1">
            Escolha o plano ideal para sua barbearia
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setSelectedPlan('pro')}
            className={`w-full text-left rounded-xl border-2 p-5 transition-all duration-200 ${
              selectedPlan === 'pro'
                ? 'border-barber-500 bg-barber-50 dark:bg-barber-900/20 shadow-lg shadow-barber-500/10'
                : 'border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 hover:border-barber-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className={`w-5 h-5 ${selectedPlan === 'pro' ? 'text-barber-500' : 'text-gray-400'}`} />
              <h4 className={`font-semibold text-lg ${selectedPlan === 'pro' ? 'text-barber-700 dark:text-barber-300' : ''}`}>
                Plano Pro
              </h4>
              <Badge variant="default" className="bg-barber-500 text-[10px]">
                Popular
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-4">
              R$ 49,90<span className="text-base font-normal text-gray-500">/mês</span>
            </p>
            <ul className="space-y-2.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </button>

          <button
            onClick={() => setSelectedPlan('pro_plus')}
            className={`w-full text-left rounded-xl border-2 p-5 transition-all duration-200 ${
              selectedPlan === 'pro_plus'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/10'
                : 'border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-200 hover:border-purple-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Crown className={`w-5 h-5 ${selectedPlan === 'pro_plus' ? 'text-purple-500' : 'text-gray-400'}`} />
              <h4 className={`font-semibold text-lg ${selectedPlan === 'pro_plus' ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                Plano Pro+
              </h4>
            </div>
            <p className="text-3xl font-bold mb-4">
              R$ 89,90<span className="text-base font-normal text-gray-500">/mês</span>
            </p>
            <ul className="space-y-2.5">
              {proPlusFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        </div>

        <div className="space-y-3 pt-2">
          <Button className="w-full h-12 text-base" onClick={handleContinueToPayment}>
            <Sparkles className="w-5 h-5 mr-2" />
            Assinar {planLabels[selectedPlan]} - R$ {prices[selectedPlan].toFixed(2)}/mês
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
            Ver depois
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Seguro</span>
          <span>Cancelamento fácil</span>
          <span>Sem fidelidade</span>
        </div>
      </div>
    </div>
  )
}