import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { createAsaasClient } from './asaas'

interface Env {
  DB: D1Database
  JWT_SECRET: string
  GOOGLE_CLIENT_ID: string
  ASAAS_API_KEY: string
  WHATSAPP_API_KEY: string
  ASAAS_ENVIRONMENT: 'sandbox' | 'production'
}

const app = new Hono<{ Bindings: Env }>()

app.use('/*', cors())

const PLAN_PRICES: Record<string, number> = {
  pro: 49.90,
  pro_plus: 89.90,
}

const PLAN_LABELS: Record<string, string> = {
  pro: 'BarberFlow Pro',
  pro_plus: 'BarberFlow Pro+',
}

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', version: '1.0.0' }))

// Auth routes
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first()

  if (!user) return c.json({ error: 'User not found' }, 401)
  return c.json({ user })
})

app.post('/api/auth/google', async (c) => {
  const { googleId, email, name } = await c.req.json()
  let user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE google_id = ? OR email = ?'
  ).bind(googleId, email).first()

  if (!user) {
    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, role, plan, trial_ends_at, google_id, onboarding_completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)'
    ).bind(
      id, email, name, 'proprietario', 'free_trial',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      googleId, new Date().toISOString()
    ).run()
    user = { id, email, name, role: 'proprietario', plan: 'free_trial' }
  }

  return c.json({ user })
})

app.post('/api/auth/signup', async (c) => {
  const { email, name, barbeariaName, phone, password } = await c.req.json()
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return c.json({ error: 'Email already registered' }, 400)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, role, barbearia_name, phone, plan, trial_ends_at, onboarding_completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)'
  ).bind(
    id, email, name, 'proprietario', barbeariaName, phone, 'free_trial',
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  ).run()

  // Create default service
  const servicoId = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO servicos (id, user_id, nome, preco, duracao_min, ativo, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)'
  ).bind(servicoId, id, 'Corte de Cabelo', 45, 45, new Date().toISOString()).run()

  return c.json({ user: { id, email, name, role: 'proprietario', barbearia_name: barbeariaName, phone, plan: 'free_trial' } }, 201)
})

// Agendamentos
app.get('/api/agendamentos', async (c) => {
  const userId = c.req.query('user_id')
  const date = c.req.query('date')
  const barbeiroId = c.req.query('barbeiro_id')

  let query = `
    SELECT a.*, b.name as barbeiro_nome, c.nome as cliente_nome, c.whatsapp,
           s.nome as servico_nome, s.preco as servico_preco
    FROM agendamentos a
    LEFT JOIN barbeiros b ON a.barbeiro_id = b.id
    LEFT JOIN clientes c ON a.cliente_id = c.id
    LEFT JOIN servicos s ON a.servico_id = s.id
    WHERE 1=1
  `
  const params: string[] = []

  if (userId) {
    query += ' AND a.barbeiro_id IN (SELECT id FROM barbeiros WHERE user_id = ?)'
    params.push(userId)
  }
  if (date) {
    query += ' AND date(a.data_hora) = date(?)'
    params.push(date)
  }
  if (barbeiroId) {
    query += ' AND a.barbeiro_id = ?'
    params.push(barbeiroId)
  }

  query += ' ORDER BY a.data_hora ASC'

  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ agendamentos: results })
})

app.post('/api/agendamentos', async (c) => {
  const body = await c.req.json()
  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    'INSERT INTO agendamentos (id, barbeiro_id, cliente_id, servico_id, data_hora, duracao_min, status, valor, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    id, body.barbeiro_id, body.cliente_id, body.servico_id,
    body.data_hora, body.duracao_min, 'aguardando', body.valor,
    new Date().toISOString()
  ).run()

  return c.json({ agendamento: { id, ...body } }, 201)
})

app.patch('/api/agendamentos/:id/status', async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json()
  await c.env.DB.prepare('UPDATE agendamentos SET status = ? WHERE id = ?').bind(status, id).run()
  return c.json({ success: true })
})

// Barbeiros
app.get('/api/barbeiros', async (c) => {
  const userId = c.req.query('user_id')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM barbeiros WHERE user_id = ? ORDER BY name'
  ).bind(userId).all()
  return c.json({ barbeiros: results })
})

app.post('/api/barbeiros', async (c) => {
  const body = await c.req.json()
  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    'INSERT INTO barbeiros (id, user_id, name, photo_url, comissao_percent, ativo, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)'
  ).bind(id, body.user_id, body.name, body.photo_url || '', body.comissao_percent || 0, new Date().toISOString()).run()

  return c.json({ barbeiro: { id, ...body } }, 201)
})

// Clientes
app.get('/api/clientes', async (c) => {
  const userId = c.req.query('user_id')
  const search = c.req.query('search')

  let query = 'SELECT * FROM clientes WHERE user_id = ?'
  const params: string[] = [userId || '']

  if (search) {
    query += ' AND (nome LIKE ? OR whatsapp LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  query += ' ORDER BY nome'
  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ clientes: results })
})

app.post('/api/clientes', async (c) => {
  const body = await c.req.json()
  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    'INSERT INTO clientes (id, user_id, nome, whatsapp, email, observacoes, total_visitas, criado_em) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
  ).bind(id, body.user_id, body.nome, body.whatsapp, body.email || '', body.observacoes || '', new Date().toISOString()).run()

  return c.json({ cliente: { id, ...body } }, 201)
})

// Servicos
app.get('/api/servicos', async (c) => {
  const userId = c.req.query('user_id')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM servicos WHERE user_id = ? AND ativo = 1 ORDER BY nome'
  ).bind(userId).all()
  return c.json({ servicos: results })
})

// Dashboard stats
app.get('/api/dashboard/stats', async (c) => {
  const userId = c.req.query('user_id')
  const today = new Date().toISOString().split('T')[0]

  const [agendamentosHoje, faturamentoHoje, barbeirosAtivos, proximos7] = await Promise.all([
    c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM agendamentos WHERE barbeiro_id IN (SELECT id FROM barbeiros WHERE user_id = ?) AND date(data_hora) = ?'
    ).bind(userId, today).first(),
    c.env.DB.prepare(
      'SELECT COALESCE(SUM(valor), 0) as total FROM agendamentos WHERE barbeiro_id IN (SELECT id FROM barbeiros WHERE user_id = ?) AND date(data_hora) = ? AND status = "finalizado"'
    ).bind(userId, today).first(),
    c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM barbeiros WHERE user_id = ? AND ativo = 1'
    ).bind(userId).first(),
    c.env.DB.prepare(
      `SELECT date(data_hora) as data, COUNT(*) as ocupacao FROM agendamentos
       WHERE barbeiro_id IN (SELECT id FROM barbeiros WHERE user_id = ?)
       AND data_hora >= datetime('now')
       AND data_hora < datetime('now', '+7 days')
       GROUP BY date(data_hora)`
    ).bind(userId).all(),
  ])

  return c.json({
    agendamentos_hoje: Number(agendamentosHoje?.count || 0),
    faturamento_hoje: Number(faturamentoHoje?.total || 0),
    barbeiros_ativos: Number(barbeirosAtivos?.count || 0),
    proximos_7_dias: proximos7.results,
  })
})

// WhatsApp integration
app.post('/api/whatsapp/notify', async (c) => {
  const { clienteNome, dataHora, barbeiroNome, phone } = await c.req.json()
  const hora = new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const message = `Olá ${clienteNome}, sua consulta é hoje às ${hora} com ${barbeiroNome}`
  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`

  return c.json({ success: true, url: whatsappUrl, message })
})

// Asaas Payment Gateway
// ======================

// Find or create Asaas customer
async function getOrCreateAsaasCustomer(asaas: ReturnType<typeof createAsaasClient>, user: { id: string; name: string; email: string; cpf?: string; phone?: string }) {
  if (!user.cpf || user.cpf.replace(/\D/g, '').length !== 11) {
    throw new Error('CPF do cliente é obrigatório para pagamento')
  }

  const cpfClean = user.cpf.replace(/\D/g, '')

  // Try to find existing customer
  const existing = await asaas.findCustomer(user.email).catch(() => null)
  if (existing?.data?.length > 0) {
    return existing.data[0]
  }

  // Create new customer
  return asaas.createCustomer({
    name: user.name,
    email: user.email,
    cpfCnpj: cpfClean,
    phone: user.phone,
    externalReference: user.id,
  })
}

// Create checkout / payment
app.post('/api/checkout', async (c) => {
  try {
    const { plan, userId, paymentMethod, customer: customerData } = await c.req.json()

    if (!c.env.ASAAS_API_KEY) {
      // Fallback if Asaas not configured
      const prices: Record<string, number> = { pro: 4990, pro_plus: 8990 }
      return c.json({
        checkout_url: `https://barberflow.pro/checkout?plan=${plan}&user_id=${userId}&amount=${prices[plan]}`,
      })
    }

    const asaas = createAsaasClient(c.env.ASAAS_API_KEY, c.env.ASAAS_ENVIRONMENT)
    const price = PLAN_PRICES[plan]
    const planLabel = PLAN_LABELS[plan]

    if (!price) {
      return c.json({ error: 'Invalid plan' }, 400)
    }

    // Merge customer data from frontend with DB user
    let userData: any = customerData || {}
    if (userId) {
      const dbUser = await c.env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(userId).first()
      if (dbUser) {
        userData = { ...dbUser, ...userData }
      }
    }

    if (!userData?.id) {
      // For checkout without DB user, generate a temp ID from customer data
      if (userData.name && userData.email && userData.cpf) {
        userData.id = `anon-${Date.now()}`
      } else {
        return c.json({ error: 'User not found' }, 404)
      }
    }

    // Validate CPF
    const cpfClean = (userData.cpf || '').replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      return c.json({ error: 'CPF inválido. Informe um CPF com 11 dígitos.' }, 400)
    }
    userData.cpf = cpfClean

    // Get or create Asaas customer
    const asaasCustomer = await getOrCreateAsaasCustomer(asaas, userData)

    let payment

    switch (paymentMethod) {
      case 'pix': {
        payment = await asaas.createPixPayment(asaasCustomer.id!, price, `Assinatura ${planLabel}`)
        // Get QR Code
        const pixQrCode = await asaas.getPixQrCode(payment.id!)
        return c.json({
          success: true,
          payment: {
            id: payment.id,
            method: 'PIX',
            value: price,
            status: 'pending',
            dueDate: payment.dueDate,
          },
          pix: {
            encodedImage: pixQrCode.encodedImage,
            payload: pixQrCode.payload,
            expirationDate: pixQrCode.expirationDate,
          },
        })
      }

      case 'boleto': {
        payment = await asaas.createBoletoPayment(asaasCustomer.id!, price, `Assinatura ${planLabel}`)
        const boleto = await asaas.getBoletoUrl(payment.id!)
        return c.json({
          success: true,
          payment: {
            id: payment.id,
            method: 'BOLETO',
            value: price,
            status: 'pending',
            dueDate: payment.dueDate,
          },
          boleto: {
            url: boleto.url,
            barCode: boleto.barCode,
          },
        })
      }

      case 'credit_card': {
        payment = await asaas.createCreditCardPayment({
          customerId: asaasCustomer.id!,
          value: price,
          description: `Assinatura ${planLabel}`,
          holderName: customerData?.cardName || userData.name,
          cardNumber: customerData?.cardNumber || '',
          expiryMonth: customerData?.cardExpiryMonth || '12',
          expiryYear: customerData?.cardExpiryYear || '2030',
          ccv: customerData?.cardCvv || '',
          holderCpfCnpj: cpfClean,
          holderEmail: userData.email,
        })

        // If payment was successful, create subscription for recurring billing
        if (payment.id) {
          await asaas.createSubscription({
            customer: asaasCustomer.id!,
            billingType: 'CREDIT_CARD',
            value: price,
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: `Assinatura ${planLabel}`,
            cycle: 'MONTHLY',
            externalReference: userId,
          })
        }

        // Update user's plan in DB
        await c.env.DB.prepare(
          'UPDATE users SET plan = ? WHERE id = ?'
        ).bind(plan, userId).run()

        return c.json({
          success: true,
          payment: {
            id: payment.id,
            method: 'CREDIT_CARD',
            value: price,
            status: payment.id ? 'confirmed' : 'pending',
          },
        })
      }

      default:
        return c.json({ error: 'Invalid payment method' }, 400)
    }
  } catch (err: any) {
    return c.json({ error: err.message || 'Payment failed' }, 500)
  }
})

// Asaas Webhook (to receive payment confirmations)
app.post('/api/webhooks/asaas', async (c) => {
  try {
    const body = await c.req.json()
    const event = body.event
    const payment = body.payment

    if (!event || !payment) {
      return c.json({ error: 'Invalid webhook payload' })
    }

    // Handle different event types
    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        // Find user by externalReference and update plan
        if (payment.externalReference) {
          const plan = payment.value === 89.90 ? 'pro_plus' : 'pro'
          await c.env.DB.prepare(
            'UPDATE users SET plan = ?, trial_ends_at = NULL WHERE id = ?'
          ).bind(plan, payment.externalReference).run()
        }
        break

      case 'PAYMENT_OVERDUE':
      case 'PAYMENT_DELETED':
      case 'SUBSCRIPTION_CANCELLED':
        // Revert user to free_trial
        if (payment.externalReference) {
          await c.env.DB.prepare(
            'UPDATE users SET plan = ? WHERE id = ?'
          ).bind('free_trial', payment.externalReference).run()
        }
        break
    }

    return c.json({ received: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default app
