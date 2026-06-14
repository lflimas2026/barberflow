-- BarberFlow Pro - D1 Database Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'proprietario' CHECK(role IN ('proprietario', 'barbeiro')),
  barbearia_name TEXT,
  phone TEXT,
  plan TEXT NOT NULL DEFAULT 'free_trial' CHECK(plan IN ('free_trial', 'pro', 'pro_plus')),
  trial_ends_at TEXT,
  avatar_url TEXT,
  google_id TEXT UNIQUE,
  onboarding_completed INTEGER DEFAULT 0,
  email_verified INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS barbeiros (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  comissao_percent REAL DEFAULT 0,
  ativo INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS horarios_trabalho (
  id TEXT PRIMARY KEY,
  barbeiro_id TEXT NOT NULL,
  dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6),
  inicio TEXT NOT NULL,
  fim TEXT NOT NULL,
  FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  ultimo_agendamento TEXT,
  observacoes TEXT,
  preferencias TEXT,
  total_visitas INTEGER DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS servicos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  preco REAL NOT NULL,
  duracao_min INTEGER NOT NULL,
  ativo INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id TEXT PRIMARY KEY,
  barbeiro_id TEXT NOT NULL,
  cliente_id TEXT NOT NULL,
  servico_id TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  duracao_min INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando' CHECK(status IN ('aguardando', 'confirmado', 'cancelado', 'finalizado')),
  valor REAL NOT NULL,
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id TEXT PRIMARY KEY,
  agendamento_id TEXT NOT NULL,
  metodo TEXT NOT NULL CHECK(metodo IN ('dinheiro', 'pix', 'credito', 'debito', 'asaas')),
  valor REAL NOT NULL,
  asaas_id TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente', 'pago', 'estornado')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id)
);

CREATE TABLE IF NOT EXISTS produtos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  preco REAL NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  pontos INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_barbeiro ON agendamentos(barbeiro_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_clientes_user ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_barbeiros_user ON barbeiros(user_id);
CREATE INDEX IF NOT EXISTS idx_servicos_user ON servicos(user_id);
