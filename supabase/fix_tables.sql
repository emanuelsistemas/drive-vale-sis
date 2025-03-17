-- Adicionar extensão UUID se ainda não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remover restrições de chave estrangeira existentes
ALTER TABLE perfil DROP CONSTRAINT IF EXISTS perfil_usuario_fkey;

-- Criar tabelas temporárias
CREATE TABLE user_temp (
    id UUID PRIMARY KEY,
    nome_user VARCHAR(255) NOT NULL,
    email_user VARCHAR(255) NOT NULL UNIQUE,
    senha_user VARCHAR(255) NOT NULL,
    perfil_acesso VARCHAR(50) DEFAULT 'admin' CHECK (perfil_acesso = 'admin'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE perfil_temp (
    id SERIAL PRIMARY KEY,
    usuario UUID REFERENCES user_temp(id) ON DELETE CASCADE,
    perfil BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT perfil_unique_temp UNIQUE (usuario)
);

-- Habilitar RLS para as tabelas temporárias
ALTER TABLE user_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_temp ENABLE ROW LEVEL SECURITY;

-- Políticas para as tabelas temporárias
CREATE POLICY "Usuários autenticados podem ver todos os usuários" ON user_temp
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" ON user_temp
    FOR UPDATE TO authenticated
    USING (id::text = auth.uid()::text)
    WITH CHECK (id::text = auth.uid()::text);

CREATE POLICY "Apenas administradores podem criar usuários" ON user_temp
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM perfil_temp
            WHERE perfil_temp.usuario::text = auth.uid()::text
            AND perfil_temp.perfil = true
        )
    );

CREATE POLICY "Usuários autenticados podem ver todos os perfis" ON perfil_temp
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas administradores podem gerenciar perfis" ON perfil_temp
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM perfil_temp
            WHERE perfil_temp.usuario::text = auth.uid()::text
            AND perfil_temp.perfil = true
        )
    );

-- Renomear as tabelas originais
ALTER TABLE "user" RENAME TO user_old;
ALTER TABLE perfil RENAME TO perfil_old;

-- Renomear as tabelas temporárias para os nomes originais
ALTER TABLE user_temp RENAME TO "user";
ALTER TABLE perfil_temp RENAME TO perfil;

-- Criar sequência para IDs automáticos
CREATE SEQUENCE IF NOT EXISTS user_id_seq;
CREATE SEQUENCE IF NOT EXISTS perfil_id_seq;

