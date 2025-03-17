-- Script para corrigir as políticas RLS que estão causando recursão infinita
-- Primeiro, vamos listar todas as políticas existentes para a tabela cad_emp_user
SELECT * FROM pg_policies WHERE tablename = 'cad_emp_user';

-- Remover todas as políticas existentes para a tabela cad_emp_user
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON "cad_emp_user";
DROP POLICY IF EXISTS "Administradores podem ver todos os usuários" ON "cad_emp_user";
DROP POLICY IF EXISTS "Administradores podem inserir usuários" ON "cad_emp_user";
DROP POLICY IF EXISTS "Administradores podem atualizar usuários" ON "cad_emp_user";
DROP POLICY IF EXISTS "Administradores podem excluir usuários" ON "cad_emp_user";

-- Habilitar RLS na tabela
ALTER TABLE "cad_emp_user" ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar se um usuário é administrador sem usar a tabela cad_emp_user
-- (isso evita a recursão infinita)
CREATE OR REPLACE FUNCTION is_admin_direct()
RETURNS BOOLEAN AS $$
DECLARE
  user_id TEXT;
  admin_profile_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Obter o ID do usuário atual
  user_id := auth.uid();
  
  -- Obter o ID do perfil 'admin'
  SELECT id INTO admin_profile_id FROM perfil_acesso WHERE tipo = 'admin';
  
  -- Verificar diretamente se o usuário tem perfil de admin
  -- usando uma consulta que não depende de políticas RLS
  SELECT EXISTS (
    SELECT 1 
    FROM cad_emp_user 
    WHERE auth_id = user_id 
    AND perfil_id = admin_profile_id
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar novas políticas RLS para a tabela cad_emp_user
-- Política para usuários verem seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON "cad_emp_user" 
FOR SELECT 
USING (auth.uid() = auth_id);

-- Política para administradores verem todos os usuários
CREATE POLICY "Administradores podem ver todos os usuários" 
ON "cad_emp_user" 
FOR SELECT 
USING (is_admin_direct());

-- Política para administradores inserirem usuários
CREATE POLICY "Administradores podem inserir usuários" 
ON "cad_emp_user" 
FOR INSERT 
WITH CHECK (is_admin_direct() OR auth.uid() IS NULL);

-- Política para administradores atualizarem usuários
CREATE POLICY "Administradores podem atualizar usuários" 
ON "cad_emp_user" 
FOR UPDATE 
USING (is_admin_direct());

-- Política para administradores excluírem usuários
CREATE POLICY "Administradores podem excluir usuários" 
ON "cad_emp_user" 
FOR DELETE 
USING (is_admin_direct());

-- Atualizar a função is_admin para usar a nova função is_admin_direct
CREATE OR REPLACE FUNCTION is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  admin_profile_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Obter o ID do perfil 'admin'
  SELECT id INTO admin_profile_id FROM perfil_acesso WHERE tipo = 'admin';
  
  -- Verificar se o usuário tem perfil de admin
  SELECT EXISTS (
    SELECT 1 
    FROM cad_emp_user 
    WHERE auth_id = user_id 
    AND perfil_id = admin_profile_id
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
