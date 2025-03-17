-- Criar tabela user
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    nome_user VARCHAR(255) NOT NULL,
    email_user VARCHAR(255) NOT NULL UNIQUE,
    senha_user VARCHAR(255) NOT NULL,
    perfil_acesso VARCHAR(50) DEFAULT 'admin' CHECK (perfil_acesso = 'admin'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela perfil
CREATE TABLE IF NOT EXISTS perfil (
    id SERIAL PRIMARY KEY,
    usuario INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
    perfil BOOLEAN NOT NULL DEFAULT TRUE,  -- TRUE para admin, FALSE para user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT perfil_unique UNIQUE (usuario)
);

-- Adicionar Políticas de Segurança de Linha (RLS)
-- Habilitar RLS para as tabelas
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;

-- Criar políticas para a tabela user
CREATE POLICY "Usuários autenticados podem ver todos os usuários"
    ON "user"
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Apenas administradores podem criar usuários"
    ON "user"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM perfil
            WHERE perfil.usuario = auth.uid()
            AND perfil.perfil = true
        )
    );

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados"
    ON "user"
    FOR UPDATE
    TO authenticated
    USING (id::text = auth.uid()::text)
    WITH CHECK (id::text = auth.uid()::text);

-- Criar políticas para a tabela perfil
CREATE POLICY "Usuários autenticados podem ver todos os perfis"
    ON perfil
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Apenas administradores podem gerenciar perfis"
    ON perfil
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM perfil
            WHERE perfil.usuario = auth.uid()
            AND perfil.perfil = true
        )
    );
