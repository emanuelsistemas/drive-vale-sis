-- Script para migrar dados do Supabase para PostgreSQL puro
-- Este script deve ser executado após criar_banco.sql

-- 1. Migrar usuários do auth.users do Supabase para nosso novo sistema
INSERT INTO cad_emp_user (
    id,
    nome,
    email,
    empresa,
    cargo,
    perfil_id,
    ativo
)
SELECT 
    au.id,
    COALESCE(u.nome, au.raw_user_meta_data->>'full_name', 'Usuário ' || au.id),
    au.email,
    u.empresa,
    u.cargo,
    COALESCE(u.perfil_id, (SELECT id FROM perfil_acesso WHERE tipo = 'user' LIMIT 1)),
    COALESCE(u.ativo, true)
FROM auth.users au
LEFT JOIN cad_emp_user u ON au.id = u.auth_id
ON CONFLICT (id) DO UPDATE
SET 
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    empresa = EXCLUDED.empresa,
    cargo = EXCLUDED.cargo,
    perfil_id = EXCLUDED.perfil_id,
    ativo = EXCLUDED.ativo,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Migrar senhas para a nova tabela de credenciais
INSERT INTO auth.credentials (
    user_id,
    password_hash
)
SELECT 
    u.id,
    au.encrypted_password
FROM auth.users au
JOIN cad_emp_user u ON au.id = u.auth_id
ON CONFLICT (user_id) DO UPDATE
SET 
    password_hash = EXCLUDED.password_hash,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Atualizar as sequências se necessário
SELECT setval(pg_get_serial_sequence('cad_emp_user', 'id'), coalesce(max(id), 1)) FROM cad_emp_user;
SELECT setval(pg_get_serial_sequence('auth.credentials', 'id'), coalesce(max(id), 1)) FROM auth.credentials;
