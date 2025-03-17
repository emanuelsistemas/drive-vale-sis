// Script para configurar o banco de dados Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase do EasyPanel conforme memória
const supabaseUrl = 'https://drive-vale-sis-supabase.h6gsxu.easypanel.host';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

// Inicializar o cliente Supabase com a chave de serviço para ter permissões administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Configurando banco de dados no Supabase...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Executar SQL para criar as tabelas e políticas
    const sql = `
    -- Criar tabela perfil_acesso
    CREATE TABLE IF NOT EXISTS perfil_acesso (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'user')),
      descricao TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Criar tabela cad_emp_user
    CREATE TABLE IF NOT EXISTS cad_emp_user (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      auth_id UUID NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefone TEXT,
      empresa TEXT,
      cargo TEXT,
      perfil_id UUID REFERENCES perfil_acesso(id),
      ativo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Habilitar RLS para as tabelas
    ALTER TABLE perfil_acesso ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cad_emp_user ENABLE ROW LEVEL SECURITY;

    -- Criar políticas para a tabela perfil_acesso
    CREATE POLICY IF NOT EXISTS "Todos podem ver perfis de acesso"
      ON perfil_acesso
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY IF NOT EXISTS "Apenas administradores podem modificar perfis de acesso"
      ON perfil_acesso
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cad_emp_user
          WHERE cad_emp_user.auth_id = auth.uid()
          AND EXISTS (
            SELECT 1 FROM perfil_acesso pa
            WHERE pa.id = cad_emp_user.perfil_id
            AND pa.tipo = 'admin'
          )
        )
      );

    -- Criar políticas para a tabela cad_emp_user
    CREATE POLICY IF NOT EXISTS "Administradores podem ver todos os usuários"
      ON cad_emp_user
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cad_emp_user cu
          JOIN perfil_acesso pa ON pa.id = cu.perfil_id
          WHERE cu.auth_id = auth.uid()
          AND pa.tipo = 'admin'
        )
      );

    CREATE POLICY IF NOT EXISTS "Usuários comuns só podem ver seus próprios dados"
      ON cad_emp_user
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = auth_id
      );

    CREATE POLICY IF NOT EXISTS "Administradores podem inserir usuários"
      ON cad_emp_user
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM cad_emp_user cu
          JOIN perfil_acesso pa ON pa.id = cu.perfil_id
          WHERE cu.auth_id = auth.uid()
          AND pa.tipo = 'admin'
        )
      );

    CREATE POLICY IF NOT EXISTS "Administradores podem atualizar usuários"
      ON cad_emp_user
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cad_emp_user cu
          JOIN perfil_acesso pa ON pa.id = cu.perfil_id
          WHERE cu.auth_id = auth.uid()
          AND pa.tipo = 'admin'
        )
      );

    CREATE POLICY IF NOT EXISTS "Usuários podem atualizar seus próprios dados"
      ON cad_emp_user
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = auth_id
      );

    CREATE POLICY IF NOT EXISTS "Administradores podem excluir usuários"
      ON cad_emp_user
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cad_emp_user cu
          JOIN perfil_acesso pa ON pa.id = cu.perfil_id
          WHERE cu.auth_id = auth.uid()
          AND pa.tipo = 'admin'
        )
      );

    -- Criar função para verificar se um usuário é administrador
    CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      is_admin BOOLEAN;
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM cad_emp_user cu
        JOIN perfil_acesso pa ON pa.id = cu.perfil_id
        WHERE cu.auth_id = user_id
        AND pa.tipo = 'admin'
      ) INTO is_admin;
      
      RETURN is_admin;
    END;
    $$;

    -- Inserir perfis padrão se não existirem
    INSERT INTO perfil_acesso (tipo, descricao)
    SELECT 'admin', 'Administrador do sistema'
    WHERE NOT EXISTS (SELECT 1 FROM perfil_acesso WHERE tipo = 'admin');

    INSERT INTO perfil_acesso (tipo, descricao)
    SELECT 'user', 'Usuário comum'
    WHERE NOT EXISTS (SELECT 1 FROM perfil_acesso WHERE tipo = 'user');
    `;

    // Executar o SQL
    const { error } = await supabase.rpc('pgexec', { sql });
    
    if (error) {
      console.error('Erro ao executar SQL:', error);
      
      // Tentar uma abordagem alternativa
      console.log('A função pgexec não está disponível. Tentando abordagem alternativa...');
      
      // Criar tabelas individualmente usando a API do Supabase
      console.log('Verificando e criando tabelas necessárias...');
      
      // Verificar se a tabela perfil_acesso existe
      const { error: checkPerfilError } = await supabase
        .from('perfil_acesso')
        .select('count(*)', { count: 'exact', head: true });
      
      if (checkPerfilError) {
        console.log('Tabela perfil_acesso não existe. Criando...');
        // Não podemos criar tabelas diretamente pela API do Supabase
        console.log('Não é possível criar tabelas pela API do Supabase. Por favor, execute o SQL manualmente no console do Supabase.');
      } else {
        console.log('Tabela perfil_acesso já existe.');
      }
      
      // Verificar se a tabela cad_emp_user existe
      const { error: checkUserError } = await supabase
        .from('cad_emp_user')
        .select('count(*)', { count: 'exact', head: true });
      
      if (checkUserError) {
        console.log('Tabela cad_emp_user não existe. Criando...');
        console.log('Não é possível criar tabelas pela API do Supabase. Por favor, execute o SQL manualmente no console do Supabase.');
      } else {
        console.log('Tabela cad_emp_user já existe.');
      }
    } else {
      console.log('SQL executado com sucesso!');
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\nVerificando tabelas após configuração:');
    
    const tables = ['cad_emp_user', 'perfil_acesso'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Tabela "${table}": Não existe ou erro de acesso - ${error.message}`);
      } else {
        console.log(`✅ Tabela "${table}": Existe`);
        
        // Contar registros
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          console.log(`   Total de registros: ${count}`);
        }
      }
    }
    
    // Verificar se a função is_admin foi criada
    console.log('\nVerificando função is_admin:');
    const { error: rpcError } = await supabase.rpc('is_admin', {
      user_id: '00000000-0000-0000-0000-000000000000'
    });
    
    if (rpcError) {
      console.log(`❌ Função "is_admin": Não existe ou erro - ${rpcError.message}`);
    } else {
      console.log('✅ Função "is_admin": Existe');
    }
    
    console.log('\nConfiguração concluída!');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a configuração
setupDatabase();
