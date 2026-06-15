// Asaas Payment Gateway Integration
// Docs: https://docs.asaas.com/

const ASAAS_API_URL = 'https://api.asaas.com/v3'
const ASAAS_SANDBOX_URL = 'https://sandbox.asaas.com/api/v3'

interface AsaasCustomer {
  id?: string
  name: string
  email: string
  cpfCnpj: string
  phone?: string
  externalReference?: string
}

interface AsaasPayment {
  id?: string
  customer: string
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  value: number
  dueDate: string
  description: string
  externalReference?: string
  installmentCount?: number
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode?: string
    addressNumber?: string
    phone?: string
  }
}

interface AsaasSubscription {
  id?: string
  customer: string
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  value: number
  nextDueDate: string
  description: string
  cycle: 'MONTHLY' | 'YEARLY'
  externalReference?: string
}

export function createAsaasClient(apiKey: string, environment?: string) {
  const baseUrl = environment === 'sandbox' ? ASAAS_SANDBOX_URL : ASAAS_API_URL
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey,
        'User-Agent': 'BarberFlowPro/1.0',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ errors: [{ description: 'Asaas request failed' }] }))
      throw new Error(err.errors?.[0]?.description || `Asaas HTTP ${res.status}`)
    }
    return res.json()
  }

  return {
    // Customers
    createCustomer: (data: AsaasCustomer) =>
      request<AsaasCustomer>('POST', '/customers', data),

    findCustomer: (email: string) =>
      request<{ data: AsaasCustomer[] }>('GET', `/customers?email=${encodeURIComponent(email)}`),

    // Payments (one-time charges)
    createPayment: (data: AsaasPayment) =>
      request<AsaasPayment>('POST', '/payments', data),

    createPixPayment: (customerId: string, value: number, description: string) =>
      request<AsaasPayment>('POST', '/payments', {
        customer: customerId,
        billingType: 'PIX',
        value,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description,
      }),

    createBoletoPayment: (customerId: string, value: number, description: string) =>
      request<AsaasPayment>('POST', '/payments', {
        customer: customerId,
        billingType: 'BOLETO',
        value,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description,
      }),

    createCreditCardPayment: (data: {
      customerId: string
      value: number
      description: string
      holderName: string
      cardNumber: string
      expiryMonth: string
      expiryYear: string
      ccv: string
      holderCpfCnpj: string
      holderEmail: string
    }) =>
      request<AsaasPayment>('POST', '/payments', {
        customer: data.customerId,
        billingType: 'CREDIT_CARD',
        value: data.value,
        dueDate: new Date().toISOString().split('T')[0],
        description: data.description,
        creditCard: {
          holderName: data.holderName,
          number: data.cardNumber,
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          ccv: data.ccv,
        },
        creditCardHolderInfo: {
          name: data.holderName,
          email: data.holderEmail,
          cpfCnpj: data.holderCpfCnpj,
        },
      }),

    // Subscriptions (recurring)
    createSubscription: (data: AsaasSubscription) =>
      request<AsaasSubscription>('POST', '/subscriptions', data),

    // Get PIX QR Code
    getPixQrCode: (paymentId: string) =>
      request<{ encodedImage: string; payload: string; expirationDate: string }>('GET', `/payments/${paymentId}/pixQrCode`),

    // Get Boleto PDF
    getBoletoUrl: (paymentId: string) =>
      request<{ url: string; barCode: string }>('GET', `/payments/${paymentId}/bankSlip`),
  }
}

export type AsaasClient = ReturnType<typeof createAsaasClient>
