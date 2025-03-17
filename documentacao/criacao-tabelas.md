# Criação das Tabelas e Configuração de Segurança

Este documento detalha os scripts SQL para criar as tabelas do Drive Vale-Sis e configurar as políticas de segurança.

## 1. Criação das Tabelas

```sql
-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar enum para tipos de perfil
CREATE TYPE tipo_perfil AS ENUM ('admin', 'user');

-- Criar tabela de perfis de acesso
CREATE TABLE perfil_acesso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_perfil NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de usuários
CREATE TABLE cad_emp_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT,
    empresa TEXT,
    cargo TEXT,
    perfil_id UUID REFERENCES perfil_acesso(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX idx_cad_emp_user_email ON cad_emp_user(email);
CREATE INDEX idx_cad_emp_user_perfil_id ON cad_emp_user(perfil_id);
CREATE INDEX idx_cad_emp_user_ativo ON cad_emp_user(ativo);
```

## 2. Trigger para Atualização de Timestamps

```sql
-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para tabela cad_emp_user
CREATE TRIGGER update_cad_emp_user_updated_at
    BEFORE UPDATE ON cad_emp_user
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela perfil_acesso
CREATE TRIGGER update_perfil_acesso_updated_at
    BEFORE UPDATE ON perfil_acesso
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 3. Função para Verificar Administrador

```sql
-- Função para verificar se um usuário é administrador
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM cad_emp_user u
        JOIN perfil_acesso p ON u.perfil_id = p.id
        WHERE u.id = user_id
        AND p.tipo = 'admin'
        AND u.ativo = true
    ) INTO is_admin_user;
    
    RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 4. Inserção de Dados Iniciais

```sql
-- Inserir perfis básicos
INSERT INTO perfil_acesso (tipo, descricao) VALUES
    ('admin', 'Administrador do sistema'),
    ('user', 'Usuário comum');

-- Inserir um usuário administrador inicial
INSERT INTO cad_emp_user (
    nome,
    email,
    perfil_id,
    ativo
) VALUES (
    'Administrador',
    'admin@exemplo.com',
    (SELECT id FROM perfil_acesso WHERE tipo = 'admin' LIMIT 1),
    true
);
```

## 5. Exemplo de Queries Comuns

```sql
-- Buscar usuários com seus perfis
SELECT 
    u.id,
    u.nome,
    u.email,
    u.empresa,
    p.tipo as perfil_tipo,
    p.descricao as perfil_descricao
FROM cad_emp_user u
JOIN perfil_acesso p ON u.perfil_id = p.id
WHERE u.ativo = true
ORDER BY u.nome;

-- Buscar usuários por empresa
SELECT 
    u.nome,
    u.email,
    u.cargo
FROM cad_emp_user u
WHERE u.empresa = $1
AND u.ativo = true;

-- Contar usuários por tipo de perfil
SELECT 
    p.tipo,
    COUNT(*) as total_usuarios
FROM cad_emp_user u
JOIN perfil_acesso p ON u.perfil_id = p.id
WHERE u.ativo = true
GROUP BY p.tipo;
```

## 6. Como Executar os Scripts

Você pode executar estes scripts de várias maneiras:

### 6.1. Usando psql

```bash
# Conectar ao banco
psql -h 10.11.0.24 -U postgres -d bd_drive_react

# Executar script de um arquivo
psql -h 10.11.0.24 -U postgres -d bd_drive_react -f script.sql
```

### 6.2. Usando Node.js

```javascript
const { Pool } = require('pg');
const fs = require('fs').promises;

async function executarScript(caminhoArquivo) {
  const pool = new Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || '5432'),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD
  });

  try {
    const script = await fs.readFile(caminhoArquivo, 'utf8');
    await pool.query(script);
    console.log('Script executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar script:', error);
  } finally {
    await pool.end();
  }
}
```

## 7. Backup e Restauração

### 7.1. Fazer Backup

```bash
# Backup completo
pg_dump -h 10.11.0.24 -U postgres -d bd_drive_react > backup.sql

# Backup apenas da estrutura (sem dados)
pg_dump -h 10.11.0.24 -U postgres -d bd_drive_react --schema-only > estrutura.sql
```

### 7.2. Restaurar Backup

```bash
# Restaurar backup
psql -h 10.11.0.24 -U postgres -d bd_drive_react < backup.sql
```

## 8. Manutenção

### 8.1. Análise de Performance

```sql
-- Analisar tabelas
ANALYZE cad_emp_user;
ANALYZE perfil_acesso;

-- Ver estatísticas de uso
SELECT schemaname, relname, seq_scan, seq_tup_read, 
       idx_scan, idx_tup_fetch
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

### 8.2. Limpeza de Dados Antigos

```sql
-- Exemplo de limpeza de usuários inativos antigos
DELETE FROM cad_emp_user
WHERE ativo = false
AND updated_at < NOW() - INTERVAL '1 year';
```
