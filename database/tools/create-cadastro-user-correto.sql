-- Criação da tabela cadastro_user com os campos exatos do formulário de cadastro
CREATE TABLE IF NOT EXISTS cadastro_user (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL, -- Nome de Usuário
  -- O email já está na tabela users, então não precisamos duplicá-lo aqui
  -- A senha também já está na tabela users como password_hash
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_cadastro_user_user_id ON cadastro_user(user_id);

-- Comentários para documentação
COMMENT ON TABLE cadastro_user IS 'Informações complementares dos usuários com base no formulário de cadastro';
COMMENT ON COLUMN cadastro_user.user_id IS 'ID do usuário na tabela de autenticação';
COMMENT ON COLUMN cadastro_user.username IS 'Nome de usuário para exibição';
