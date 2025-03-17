// Script para listar tabelas no Supabase
const { createClient } = require('@supabase/supabase-js');

// Obter configuração do Supabase das variáveis de ambiente
const useLocalSupabase = process.env.REACT_APP_USE_LOCAL_SUPABASE === 'true';

// Determinar qual configuração usar com base na variável de ambiente
const supabaseUrl = useLocalSupabase
  ? process.env.REACT_APP_DRIVE_LOCAL_SUPABASE_URL || 'https://drive-vale-sis-supabase.h6gsxu.easypanel.host'
  : process.env.REACT_APP_DRIVE_SUPABASE_URL || 'https://hbgmyrooyrisunhczfna.supabase.co';

const supabaseAnonKey = useLocalSupabase
  ? process.env.REACT_APP_DRIVE_LOCAL_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
  : process.env.REACT_APP_DRIVE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ215cm9veXJpc3VuaGN6Zm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NzYyOTIsImV4cCI6MjA1NzU1MjI5Mn0.Z5hg7lAbEyNYCd314kvknRj1QYd-nmZ3_jEkP_fDj9U';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  console.log(`Conectando ao Supabase em: ${supabaseUrl}`);
  
  try {
    // Consultar informações sobre as tabelas
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('*')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('Erro ao listar tabelas:', error);
      
      // Tentar uma abordagem alternativa
      console.log('Tentando abordagem alternativa...');
      
      // Listar tabelas específicas que sabemos que existem
      const tables = ['cad_emp_user', 'perfil_acesso', 'user', 'perfil'];
      
      for (const table of tables) {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('count(*)')
          .limit(1);
        
        console.log(`Tabela ${table}: ${tableError ? 'Não existe ou erro de acesso' : 'Existe'}`);
        if (!tableError) {
          console.log(`  Número de registros: ${tableData.length > 0 ? tableData[0].count : 0}`);
          
          // Obter estrutura da tabela
          const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: table });
          
          if (!columnsError && columns) {
            console.log(`  Colunas: ${JSON.stringify(columns)}`);
          }
        }
      }
      
      return;
    }
    
    console.log('Tabelas encontradas:');
    data.forEach(table => {
      console.log(`- ${table.tablename}`);
    });
    
    // Para cada tabela, tentar obter a estrutura
    for (const table of data) {
      const tableName = table.tablename;
      
      // Tentar obter a primeira linha para ver a estrutura
      const { data: rowData, error: rowError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!rowError && rowData && rowData.length > 0) {
        console.log(`\nEstrutura da tabela ${tableName}:`);
        console.log(JSON.stringify(Object.keys(rowData[0]), null, 2));
        
        // Contar registros
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          console.log(`Total de registros: ${count}`);
        }
      } else {
        console.log(`\nTabela ${tableName}: Não foi possível obter a estrutura ou está vazia`);
      }
    }
  } catch (err) {
    console.error('Erro ao executar consulta:', err);
  }
}

// Executar a função
listTables();
