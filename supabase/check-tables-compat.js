// Script para verificar as tabelas do Supabase usando a configuração da pasta supabase
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase diretamente do arquivo config.js (adaptado para CommonJS)
const supabaseUrl = 'https://drive-vale-sis-supabase-drive-vale-sis.h6gsxu.easypanel.host';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

// Inicializar o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('Verificando tabelas no Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Verificar se as tabelas existem tentando fazer uma consulta simples
    const tables = [
      'cad_emp_user',
      'perfil_acesso',
      'user',
      'perfil'
    ];
    
    console.log('\nVerificando tabelas existentes:');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count(*)', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Tabela "${table}": Não existe ou erro de acesso - ${error.message}`);
        } else {
          console.log(`✅ Tabela "${table}": Existe`);
          
          // Tentar obter a estrutura da tabela
          const { data: structure, error: structureError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (!structureError && structure && structure.length > 0) {
            console.log(`   Colunas: ${Object.keys(structure[0]).join(', ')}`);
          } else {
            console.log('   Tabela vazia ou não foi possível obter a estrutura');
          }
          
          // Contar registros
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!countError) {
            console.log(`   Total de registros: ${count}`);
          }
        }
      } catch (tableError) {
        console.log(`❌ Erro ao verificar tabela "${table}": ${tableError.message}`);
      }
    }
    
    // Verificar se a função RPC is_admin existe
    try {
      console.log('\nVerificando função RPC is_admin:');
      const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin', {
        user_id: '00000000-0000-0000-0000-000000000000' // ID fictício para teste
      });
      
      if (rpcError) {
        console.log(`❌ Função RPC "is_admin": Não existe ou erro - ${rpcError.message}`);
      } else {
        console.log('✅ Função RPC "is_admin": Existe');
      }
    } catch (rpcError) {
      console.log(`❌ Erro ao verificar função RPC "is_admin": ${rpcError.message}`);
    }
    
    // Verificar se o usuário atual tem permissões de admin
    try {
      console.log('\nVerificando permissões do usuário atual:');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData || !userData.user) {
        console.log('❌ Não há usuário autenticado');
      } else {
        console.log(`✅ Usuário autenticado: ${userData.user.email}`);
        
        // Verificar se o usuário é admin
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin', {
          user_id: userData.user.id
        });
        
        if (isAdminError) {
          console.log(`❌ Erro ao verificar se o usuário é admin: ${isAdminError.message}`);
        } else {
          console.log(`✅ Usuário é admin: ${isAdminData ? 'Sim' : 'Não'}`);
        }
      }
    } catch (authError) {
      console.log(`❌ Erro ao verificar usuário atual: ${authError.message}`);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a verificação
checkTables();
