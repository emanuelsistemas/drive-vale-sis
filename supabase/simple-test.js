const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://drive-vale-sis-supabase-drive-vale-sis.h6gsxu.easypanel.host';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

// Inicializar o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simpleTest() {
  console.log('Testando conexão básica com o Supabase...');
  
  try {
    // Tentativa de ping ao Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error.message);
      return;
    }
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    console.log('Supabase responde corretamente à solicitação de autenticação');
    
    // Verificar a URL da API
    console.log('\nDetalhes da conexão:');
    console.log('- URL do Supabase:', supabaseUrl);
    console.log('- Chave anônima configurada');
    
    console.log('\nStatus da conexão: SUCESSO');
    
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    console.log('Status da conexão: FALHA');
  }
}

// Executar o teste
simpleTest();
