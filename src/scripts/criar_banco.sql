-- Criar schema para autenticação
CREATE SCHEMA IF NOT EXISTS auth;

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar enum para tipos de perfil
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de perfis de acesso
CREATE TABLE IF NOT EXISTS perfil_acesso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo user_role NOT NULL DEFAULT 'user',
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS cad_emp_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Criar tabela de credenciais (substitui auth.users do Supabase)
CREATE TABLE IF NOT EXISTS auth.credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES cad_emp_user(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expires TIMESTAMPTZ,
    last_sign_in TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cad_emp_user_email ON cad_emp_user(email);
CREATE INDEX IF NOT EXISTS idx_cad_emp_user_perfil_id ON cad_emp_user(perfil_id);
CREATE INDEX IF NOT EXISTS idx_cad_emp_user_ativo ON cad_emp_user(ativo);
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON auth.credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_reset_token ON auth.credentials(reset_token);

-- Criar funções de utilidade
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualização automática de updated_at
CREATE TRIGGER update_cad_emp_user_timestamp
    BEFORE UPDATE ON cad_emp_user
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_perfil_acesso_timestamp
    BEFORE UPDATE ON perfil_acesso
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_credentials_timestamp
    BEFORE UPDATE ON auth.credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Função para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION auth.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM cad_emp_user u
        JOIN perfil_acesso p ON u.perfil_id = p.id
        WHERE u.id = user_id
        AND p.tipo = 'admin'
        AND u.ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para definir o usuário atual na sessão
CREATE OR REPLACE FUNCTION auth.set_current_user(user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Função para obter o ID do usuário atual
CREATE OR REPLACE FUNCTION auth.get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Habilitar RLS nas tabelas
ALTER TABLE cad_emp_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.credentials ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY user_see_own_data ON cad_emp_user
    FOR SELECT
    USING (
        id = auth.get_current_user_id() OR 
        auth.is_admin(auth.get_current_user_id())
    );

CREATE POLICY admin_manage_all ON cad_emp_user
    FOR ALL
    USING (auth.is_admin(auth.get_current_user_id()));

CREATE POLICY protect_credentials ON auth.credentials
    FOR ALL
    USING (user_id = auth.get_current_user_id() OR auth.is_admin(auth.get_current_user_id()));

-- Inserir dados iniciais
INSERT INTO perfil_acesso (tipo, descricao)
VALUES 
    ('admin', 'Administrador do sistema'),
    ('user', 'Usuário comum')
ON CONFLICT DO NOTHING;
