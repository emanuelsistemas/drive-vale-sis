-- Configuração de Segurança para o Drive Vale-Sis
-- Similar ao modelo do Supabase, mas adaptado para PostgreSQL puro

-- 1. Criar schema para autenticação (similar ao auth.users do Supabase)
CREATE SCHEMA IF NOT EXISTS auth;

-- 2. Criar enum para tipos de perfil
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Criar tabela de perfis
CREATE TABLE IF NOT EXISTS perfil_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo user_role NOT NULL DEFAULT 'user',
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS cad_emp_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT,
    empresa TEXT,
    cargo TEXT,
    perfil_id UUID REFERENCES perfil_acesso(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar função para verificar se é admin
CREATE OR REPLACE FUNCTION auth.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM cad_emp_user u
        JOIN perfil_acesso p ON u.perfil_id = p.id
        WHERE u.id = user_id AND p.tipo = 'admin' AND u.ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar função para obter ID do usuário atual
CREATE OR REPLACE FUNCTION auth.get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Habilitar RLS nas tabelas
ALTER TABLE cad_emp_user ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas de segurança
-- Política para usuários verem apenas seus próprios dados
CREATE POLICY user_see_own_data ON cad_emp_user
    FOR SELECT
    USING (
        id = auth.get_current_user_id() OR 
        auth.is_admin(auth.get_current_user_id())
    );

-- Política para admins gerenciarem todos os dados
CREATE POLICY admin_manage_all ON cad_emp_user
    FOR ALL
    USING (auth.is_admin(auth.get_current_user_id()));

-- 9. Criar trigger para atualização automática do updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON cad_emp_user
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 10. Inserir dados iniciais
INSERT INTO perfil_acesso (tipo, descricao)
VALUES 
    ('admin', 'Administrador do sistema'),
    ('user', 'Usuário comum')
ON CONFLICT DO NOTHING;

-- 11. Criar função para definir usuário atual na sessão
CREATE OR REPLACE FUNCTION auth.set_current_user(user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;
