const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://drive-vale-sis-supabase-drive-vale-sis.h6gsxu.easypanel.host';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

// Inicializar o cliente Supabase com a chave de serviço para ter privilégios administrativos
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertTestData() {
  console.log('Testando inserção de dados no Supabase...');
  
  try {
    // Gerar email único
    const randomEmail = `teste${Date.now()}@example.com`;
    
    // Criar um usuário usando a API de autenticação
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: randomEmail,
      password: 'senha123',
      email_confirm: true
    });
    
    if (authError) {
      console.error('Erro ao criar usuário de autenticação:', authError.message);
      return;
    }
    
    console.log('Usuário de autenticação criado com sucesso:', authData.user.id);
    
    // Inserir dados na tabela user
    const { data: userData, error: userError } = await supabase
      .from('user')
      .insert({
        id: authData.user.id,
        nome_user: 'Usuário de Teste',
        email_user: randomEmail,
        senha_user: 'senha_hash'
      })
      .select();
    
    if (userError) {
      console.error('Erro ao inserir na tabela user:', userError.message);
    } else {
      console.log('Dados inseridos na tabela user com sucesso:', userData);
    }
    
    // Inserir dados na tabela perfil
    const { data: perfilData, error: perfilError } = await supabase
      .from('perfil')
      .insert({
        usuario: authData.user.id,
        perfil: true
      })
      .select();
    
    if (perfilError) {
      console.error('Erro ao inserir na tabela perfil:', perfilError.message);
    } else {
      console.log('Dados inseridos na tabela perfil com sucesso:', perfilData);
    }
    
    // Verificar se os dados foram inseridos corretamente
    const { data: checkData, error: checkError } = await supabase
      .from('user')
      .select('*, perfil(*)')
      .eq('id', authData.user.id);
    
    if (checkError) {
      console.error('Erro ao verificar dados:', checkError.message);
    } else {
      console.log('Verificação de dados concluída:', checkData);
    }
    
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

// Executar o teste
insertTestData();
