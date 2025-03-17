import { createClient } from '@supabase/supabase-js';

/**
 * Script para corrigir diretamente as políticas RLS que estão causando recursão infinita
 * Este script usa a chave de serviço para ter acesso direto ao banco de dados
 */
export const fixRlsDirectly = async () => {
  try {
    // Obter configurações do Supabase
    const supabaseUrl = process.env.REACT_APP_DRIVE_SUPABASE_URL || 'https://drive-vale-sis-supabase.h6gsxu.easypanel.host';
    const supabaseServiceKey = process.env.REACT_APP_DRIVE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';
    
    // Criar cliente Supabase com a chave de serviço
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Iniciando correção das políticas RLS...');
    
    // Desabilitar temporariamente RLS para a tabela cad_emp_user
    const disableRlsQuery = `
      ALTER TABLE "cad_emp_user" DISABLE ROW LEVEL SECURITY;
    `;
    
    const { error: disableError } = await supabaseAdmin.rpc('exec', { 
      query: disableRlsQuery 
    });
    
    if (disableError) {
      console.error('Erro ao desabilitar RLS:', disableError);
    } else {
      console.log('RLS desabilitado temporariamente com sucesso!');
    }
    
    // Remover todas as políticas existentes
    const dropPoliciesQuery = `
      DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON "cad_emp_user";
      DROP POLICY IF EXISTS "Administradores podem ver todos os usuários" ON "cad_emp_user";
      DROP POLICY IF EXISTS "Administradores podem inserir usuários" ON "cad_emp_user";
      DROP POLICY IF EXISTS "Administradores podem atualizar usuários" ON "cad_emp_user";
      DROP POLICY IF EXISTS "Administradores podem excluir usuários" ON "cad_emp_user";
    `;
    
    const { error: dropError } = await supabaseAdmin.rpc('exec', { 
      query: dropPoliciesQuery 
    });
    
    if (dropError) {
      console.error('Erro ao remover políticas existentes:', dropError);
    } else {
      console.log('Políticas existentes removidas com sucesso!');
    }
    
    // Criar função is_admin_safe que não causa recursão
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION is_admin_safe()
      RETURNS BOOLEAN AS $$
      DECLARE
        user_id TEXT;
        admin_profile_id UUID;
        is_admin BOOLEAN;
      BEGIN
        -- Obter o ID do usuário atual
        user_id := auth.uid();
        
        IF user_id IS NULL THEN
          RETURN FALSE;
        END IF;
        
        -- Obter o ID do perfil 'admin'
        SELECT id INTO admin_profile_id FROM perfil_acesso WHERE tipo = 'admin';
        
        -- Verificar diretamente se o usuário tem perfil de admin
        EXECUTE 'SELECT EXISTS (
          SELECT 1 
          FROM cad_emp_user 
          WHERE auth_id = $1 
          AND perfil_id = $2
        )' INTO is_admin USING user_id, admin_profile_id;
        
        RETURN COALESCE(is_admin, FALSE);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error: functionError } = await supabaseAdmin.rpc('exec', { 
      query: createFunctionQuery 
    });
    
    if (functionError) {
      console.error('Erro ao criar função is_admin_safe:', functionError);
    } else {
      console.log('Função is_admin_safe criada com sucesso!');
    }
    
    // Reabilitar RLS para a tabela cad_emp_user
    const enableRlsQuery = `
      ALTER TABLE "cad_emp_user" ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error: enableError } = await supabaseAdmin.rpc('exec', { 
      query: enableRlsQuery 
    });
    
    if (enableError) {
      console.error('Erro ao reabilitar RLS:', enableError);
    } else {
      console.log('RLS reabilitado com sucesso!');
    }
    
    // Criar novas políticas RLS usando a função is_admin_safe
    const createPoliciesQuery = `
      -- Política para usuários verem seus próprios dados
      CREATE POLICY "Usuários podem ver seus próprios dados" 
      ON "cad_emp_user" 
      FOR SELECT 
      USING (auth.uid() = auth_id);
      
      -- Política para administradores verem todos os usuários
      CREATE POLICY "Administradores podem ver todos os usuários" 
      ON "cad_emp_user" 
      FOR SELECT 
      USING (is_admin_safe());
      
      -- Política para administradores inserirem usuários
      CREATE POLICY "Administradores podem inserir usuários" 
      ON "cad_emp_user" 
      FOR INSERT 
      WITH CHECK (is_admin_safe() OR auth.uid() IS NULL);
      
      -- Política para administradores atualizarem usuários
      CREATE POLICY "Administradores podem atualizar usuários" 
      ON "cad_emp_user" 
      FOR UPDATE 
      USING (is_admin_safe());
      
      -- Política para administradores excluírem usuários
      CREATE POLICY "Administradores podem excluir usuários" 
      ON "cad_emp_user" 
      FOR DELETE 
      USING (is_admin_safe());
    `;
    
    const { error: policiesError } = await supabaseAdmin.rpc('exec', { 
      query: createPoliciesQuery 
    });
    
    if (policiesError) {
      console.error('Erro ao criar novas políticas:', policiesError);
    } else {
      console.log('Novas políticas criadas com sucesso!');
    }
    
    // Atualizar a função is_admin para usar a nova função is_admin_safe
    const updateIsAdminQuery = `
      CREATE OR REPLACE FUNCTION is_admin(user_id TEXT)
      RETURNS BOOLEAN AS $$
      DECLARE
        admin_profile_id UUID;
        is_admin BOOLEAN;
      BEGIN
        -- Obter o ID do perfil 'admin'
        SELECT id INTO admin_profile_id FROM perfil_acesso WHERE tipo = 'admin';
        
        -- Verificar se o usuário tem perfil de admin
        EXECUTE 'SELECT EXISTS (
          SELECT 1 
          FROM cad_emp_user 
          WHERE auth_id = $1 
          AND perfil_id = $2
        )' INTO is_admin USING user_id, admin_profile_id;
        
        RETURN COALESCE(is_admin, FALSE);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error: updateError } = await supabaseAdmin.rpc('exec', { 
      query: updateIsAdminQuery 
    });
    
    if (updateError) {
      console.error('Erro ao atualizar função is_admin:', updateError);
    } else {
      console.log('Função is_admin atualizada com sucesso!');
    }
    
    console.log('Correção das políticas RLS concluída!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao corrigir políticas RLS:', error);
    return { success: false, error };
  }
};

export default fixRlsDirectly;
