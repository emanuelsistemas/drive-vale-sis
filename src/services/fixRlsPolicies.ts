import { supabase } from './supabase';

/**
 * Função para corrigir as políticas RLS que estão causando recursão infinita
 */
export const fixRlsPolicies = async () => {
  try {
    console.log('Iniciando correção das políticas RLS...');
    
    // SQL com os comandos para corrigir as políticas RLS
    const sqlCommands = [
      // Remover políticas existentes
      "DROP POLICY IF EXISTS \"Usuários podem ver seus próprios dados\" ON \"cad_emp_user\"",
      "DROP POLICY IF EXISTS \"Administradores podem ver todos os usuários\" ON \"cad_emp_user\"",
      "DROP POLICY IF EXISTS \"Administradores podem inserir usuários\" ON \"cad_emp_user\"",
      "DROP POLICY IF EXISTS \"Administradores podem atualizar usuários\" ON \"cad_emp_user\"",
      "DROP POLICY IF EXISTS \"Administradores podem excluir usuários\" ON \"cad_emp_user\"",
      
      // Desabilitar temporariamente RLS
      "ALTER TABLE \"cad_emp_user\" DISABLE ROW LEVEL SECURITY",
      
      // Criar função segura para verificar se é admin
      `CREATE OR REPLACE FUNCTION is_admin_safe()
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
      $$ LANGUAGE plpgsql SECURITY DEFINER`,
      
      // Reabilitar RLS
      "ALTER TABLE \"cad_emp_user\" ENABLE ROW LEVEL SECURITY",
      
      // Criar novas políticas
      `CREATE POLICY \"Usuários podem ver seus próprios dados\" 
      ON \"cad_emp_user\" 
      FOR SELECT 
      USING (auth.uid() = auth_id)`,
      
      `CREATE POLICY \"Administradores podem ver todos os usuários\" 
      ON \"cad_emp_user\" 
      FOR SELECT 
      USING (is_admin_safe())`,
      
      `CREATE POLICY \"Administradores podem inserir usuários\" 
      ON \"cad_emp_user\" 
      FOR INSERT 
      WITH CHECK (is_admin_safe() OR auth.uid() IS NULL)`,
      
      `CREATE POLICY \"Administradores podem atualizar usuários\" 
      ON \"cad_emp_user\" 
      FOR UPDATE 
      USING (is_admin_safe())`,
      
      `CREATE POLICY \"Administradores podem excluir usuários\" 
      ON \"cad_emp_user\" 
      FOR DELETE 
      USING (is_admin_safe())`,
      
      // Atualizar a função is_admin
      `CREATE OR REPLACE FUNCTION is_admin(user_id TEXT)
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
      $$ LANGUAGE plpgsql SECURITY DEFINER`
    ];
    
    // Executar cada comando SQL
    for (const command of sqlCommands) {
      try {
        const { error } = await supabase.rpc('exec', { 
          query: command + ';' 
        });
        
        if (error) {
          console.error('Erro ao executar comando SQL:', error);
          console.error('Comando:', command);
        }
      } catch (err) {
        console.error('Exceção ao executar comando SQL:', err);
        console.error('Comando:', command);
      }
    }
    
    console.log('Correção das políticas RLS concluída!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao corrigir políticas RLS:', error);
    return { success: false, error };
  }
};

export default fixRlsPolicies;
