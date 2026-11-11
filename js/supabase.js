// ==========================================
// Supabase Configuration
// ==========================================
// IMPORTANTE: Substitua os valores abaixo com as credenciais do seu projeto Supabase.
// Você encontra esses valores em: Supabase Dashboard > Settings > API

const SUPABASE_URL = 'https://mkakccwunpkytkkkvebt.supabase.co';       // Ex: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rYWtjY3d1bnBreXRra2t2ZWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTU2NDQsImV4cCI6MjA4ODczMTY0NH0.cg4prSRWUa9vY9zKVq7VN0Yi0bqU_1RX5vHRm4tRFd8'; // Ex: eyJhbGciOi...

// Inicializa o client Supabase
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
  ==========================================
  SQL para criar a tabela no Supabase:
  ==========================================

  Acesse o SQL Editor no painel do Supabase e execute:

  CREATE TABLE agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    servico TEXT NOT NULL,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data DATE NOT NULL,
    horario TEXT NOT NULL,
    status TEXT DEFAULT 'agendado', -- agendado, confirmado, em_atendimento, realizado, cancelado
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE dias_bloqueados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Permite leitura e modificação (RLS)
  ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
  ALTER TABLE dias_bloqueados ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Acesso total" ON agendamentos FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Acesso total" ON dias_bloqueados FOR ALL USING (true) WITH CHECK (true);

  ==========================================
*/
