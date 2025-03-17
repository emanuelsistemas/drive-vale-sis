-- Ajustar as políticas existentes para resolverem o problema de tipo

-- Primeiro remove as políticas existentes com problema
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios dados" ON "user";
DROP POLICY IF EXISTS "Apenas administradores podem criar usuários" ON "user";
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar perfis" ON perfil;

-- Criar políticas corrigidas para a tabela user
CREATE POLICY "Usuários podem atualizar apenas seus próprios dados"
    ON "user"
    FOR UPDATE
    TO authenticated
    USING (id::text = auth.uid()::text)
    WITH CHECK (id::text = auth.uid()::text);

CREATE POLICY "Apenas administradores podem criar usuários"
    ON "user"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM perfil
            WHERE perfil.usuario::text = auth.uid()::text
            AND perfil.perfil = true
        )
    );

-- Criar políticas para a tabela perfil
CREATE POLICY "Apenas administradores podem gerenciar perfis"
    ON perfil
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM perfil
            WHERE perfil.usuario::text = auth.uid()::text
            AND perfil.perfil = true
        )
    );
