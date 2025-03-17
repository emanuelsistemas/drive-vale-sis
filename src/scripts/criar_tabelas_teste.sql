-- Script para criar tabelas de teste
-- Autor: Cascade
-- Data: 2025-03-16

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar enum para tipos de perfil
DO $$ BEGIN
    CREATE TYPE tipo_perfil AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_user TEXT NOT NULL,
    email_user TEXT NOT NULL UNIQUE,
    senha_user TEXT NOT NULL,
    perfil_acesso TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    perfil tipo_perfil NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email_user);
CREATE INDEX IF NOT EXISTS idx_perfil_usuario ON perfil(usuario);

-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de updated_at
CREATE TRIGGER update_user_timestamp
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_perfil_timestamp
    BEFORE UPDATE ON perfil
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger para criar perfil automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION criar_perfil_automatico()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO perfil (usuario, perfil)
    VALUES (NEW.id, CASE WHEN NEW.perfil_acesso = 'admin' THEN 'admin'::tipo_perfil ELSE 'user'::tipo_perfil END);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_user_insert
    AFTER INSERT ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION criar_perfil_automatico();

-- Função para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM perfil
        WHERE usuario = user_id AND perfil = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- Função para definir o usuário atual na sessão
CREATE OR REPLACE FUNCTION set_current_user(user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Função para obter o ID do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Habilitar RLS nas tabelas
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY user_see_own_data ON "user"
    FOR SELECT
    USING (
        id = get_current_user_id() OR 
        is_admin(get_current_user_id())
    );

CREATE POLICY admin_manage_all_users ON "user"
    FOR ALL
    USING (is_admin(get_current_user_id()));

CREATE POLICY user_see_own_perfil ON perfil
    FOR SELECT
    USING (
        usuario = get_current_user_id() OR 
        is_admin(get_current_user_id())
    );

CREATE POLICY admin_manage_all_perfis ON perfil
    FOR ALL
    USING (is_admin(get_current_user_id()));

-- Função para criar um usuário com senha criptografada e perfil
CREATE OR REPLACE FUNCTION criar_usuario(
    p_nome TEXT,
    p_email TEXT,
    p_senha TEXT,
    p_perfil tipo_perfil DEFAULT 'user'
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Inserir o usuário com senha criptografada
    INSERT INTO "user" (nome_user, email_user, senha_user, perfil_acesso)
    VALUES (p_nome, p_email, crypt(p_senha, gen_salt('bf')), p_perfil::TEXT)
    RETURNING id INTO v_user_id;
    
    -- O trigger after_user_insert já vai criar o perfil automaticamente
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Inserir um usuário administrador inicial para teste
SELECT criar_usuario('Administrador', 'admin@exemplo.com', 'senha123', 'admin');
