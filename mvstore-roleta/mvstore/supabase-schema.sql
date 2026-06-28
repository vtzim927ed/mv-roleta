-- ================================================================
-- MV STORE - ROLETA DE PRÊMIOS
-- Script SQL para configurar o banco de dados no Supabase
-- Execute este script no Supabase SQL Editor
-- ================================================================

-- 1. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  spins_available INTEGER NOT NULL DEFAULT 1 CHECK (spins_available >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(code);
CREATE INDEX IF NOT EXISTS idx_clients_created ON clients(created_at DESC);

-- 2. TABELA DE PRÊMIOS
CREATE TABLE IF NOT EXISTS prizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) DEFAULT '🎁',
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  color VARCHAR(7) DEFAULT '#22D3EE',
  active BOOLEAN DEFAULT TRUE,
  is_retry BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE GIROS (HISTÓRICO)
CREATE TABLE IF NOT EXISTS spins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  prize_id INTEGER REFERENCES prizes(id) ON DELETE SET NULL,
  prize_name VARCHAR(255) NOT NULL,
  spun_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_spins_client ON spins(client_id);
CREATE INDEX IF NOT EXISTS idx_spins_prize ON spins(prize_id);
CREATE INDEX IF NOT EXISTS idx_spins_date ON spins(spun_at DESC);

-- ================================================================
-- 4. INSERIR PRÊMIOS PADRÃO
-- ================================================================
INSERT INTO prizes (name, emoji, percentage, color, active, is_retry, sort_order) VALUES
  ('Pix R$5',             '💵', 6.8,  '#00C896', TRUE,  FALSE, 1),
  ('Pix R$15',            '💵', 3.4,  '#00A878', TRUE,  FALSE, 2),
  ('Pix R$20',            '💵', 1.7,  '#008F65', TRUE,  FALSE, 3),
  ('Conta Nitrada',       '🔥', 10.2, '#FF6B35', TRUE,  FALSE, 4),
  ('Decoração R$15,99',   '🎨', 8.2,  '#9B59B6', TRUE,  FALSE, 5),
  ('2 Impulsos',          '🚀', 8.2,  '#2980B9', TRUE,  FALSE, 6),
  ('2 Impulsos',          '🚀', 10.2, '#1A6FA8', TRUE,  FALSE, 7),
  ('Produto à escolha',   '🎁', 1.4,  '#F39C12', TRUE,  FALSE, 8),
  ('Tente novamente',     '🔄', 50.0, '#2C3E50', TRUE,  TRUE,  9)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 5. ROW LEVEL SECURITY (RLS) - Segurança
-- ================================================================

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spins ENABLE ROW LEVEL SECURITY;

-- Política: leitura pública (necessária para validar código do cliente)
CREATE POLICY "Allow public read clients" ON clients
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow public read prizes" ON prizes
  FOR SELECT USING (TRUE);

-- Política: escrita pública (para decrementar giros e salvar histórico)
-- Em produção, considere usar service_role no backend
CREATE POLICY "Allow public insert spins" ON spins
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow public select spins" ON spins
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow public update clients spins" ON clients
  FOR UPDATE USING (TRUE)
  WITH CHECK (TRUE);

-- Para o admin poder inserir/deletar clientes
CREATE POLICY "Allow public insert clients" ON clients
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow public insert prizes" ON prizes
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow public update prizes" ON prizes
  FOR UPDATE USING (TRUE)
  WITH CHECK (TRUE);

-- ================================================================
-- 6. INSERIR CLIENTE DE TESTE
-- ================================================================
INSERT INTO clients (name, code, spins_available) VALUES
  ('Cliente Teste', 'MVTESTE', 5)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================
SELECT 'Prêmios inseridos:' as info, COUNT(*) as total FROM prizes;
SELECT 'Cliente teste:' as info, code, spins_available FROM clients WHERE code = 'MVTESTE';

-- Para verificar soma das porcentagens:
SELECT SUM(percentage) as total_percentagem FROM prizes WHERE active = TRUE;
