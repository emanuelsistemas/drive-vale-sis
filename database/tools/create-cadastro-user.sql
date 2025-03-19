-- Criação da tabela cadastro_user com informações complementares dos usuários
CREATE TABLE IF NOT EXISTS cadastro_user (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  empresa VARCHAR(255),
  cargo VARCHAR(100),
  avatar_url VARCHAR(500),
  preferencias JSONB DEFAULT '{}',
  data_nascimento DATE,
  cpf VARCHAR(14),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_cadastro_user_user_id ON cadastro_user(user_id);
CREATE INDEX IF NOT EXISTS idx_cadastro_user_username ON cadastro_user(username);

-- Comentários para documentação
COMMENT ON TABLE cadastro_user IS 'Informações complementares dos usuários';
COMMENT ON COLUMN cadastro_user.user_id IS 'ID do usuário na tabela de autenticação';
COMMENT ON COLUMN cadastro_user.username IS 'Nome de usuário para exibição';
COMMENT ON COLUMN cadastro_user.preferencias IS 'Configurações e preferências do usuário em formato JSON';
