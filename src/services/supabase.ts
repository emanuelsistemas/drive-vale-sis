import { createClient } from '@supabase/supabase-js';

// Obter configuração do Supabase das variáveis de ambiente
const useLocalSupabase = process.env.REACT_APP_USE_LOCAL_SUPABASE === 'true';

// Determinar qual configuração usar com base na variável de ambiente
const supabaseUrl = useLocalSupabase
  ? process.env.REACT_APP_DRIVE_LOCAL_SUPABASE_URL || 'https://drive-vale-sis-supabase.h6gsxu.easypanel.host'
  : process.env.REACT_APP_DRIVE_SUPABASE_URL || 'https://hbgmyrooyrisunhczfna.supabase.co';

const supabaseAnonKey = useLocalSupabase
  ? process.env.REACT_APP_DRIVE_LOCAL_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
  : process.env.REACT_APP_DRIVE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ215cm9veXJpc3VuaGN6Zm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NzYyOTIsImV4cCI6MjA1NzU1MjI5Mn0.Z5hg7lAbEyNYCd314kvknRj1QYd-nmZ3_jEkP_fDj9U';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL ou chave anônima não definida');
}

// Log da configuração em ambiente de desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log(`Usando Supabase ${useLocalSupabase ? 'Local (EasyPanel)' : 'Cloud (M-Software)'}`);
  console.log(`URL: ${supabaseUrl}`);
}

// Criar e exportar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase;
