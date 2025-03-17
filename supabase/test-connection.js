const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://drive-vale-sis-supabase-drive-vale-sis.h6gsxu.easypanel.host';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

// Inicializar o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testando conexão com o Supabase...');
  
  try {
    // Tentativa de ping ao Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error.message);
      return;
    }
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    console.log('Informações da sessão:', data);
    
    // Tentativa de criar uma tabela de teste
    console.log('\nTentando criar uma tabela de teste...');
    const { error: createError } = await supabase.rpc('create_test_table');
    
    if (createError) {
      console.error('Erro ao criar tabela de teste:', createError.message);
      console.log('Isso é esperado se você não tiver permissões ou se a função RPC não existir');
    } else {
      console.log('Tabela de teste criada com sucesso!');
    }
    
    // Tentar obter dados do banco de dados
    console.log('\nTentando realizar uma consulta simples...');
    const { data: testData, error: testError } = await supabase
      .from('user')
      .select('*')
      .limit(5);
    
    if (testError) {
      console.log('Erro ao consultar dados (isso é esperado se a tabela não existir):', testError.message);
    } else {
      console.log('Consulta bem-sucedida! Dados encontrados:', testData);
    }
    
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
  }
}

// Executar o teste
testConnection();
