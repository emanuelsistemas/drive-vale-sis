-- Selecionar os usuários existentes para verificar seus IDs
SELECT id, email, name FROM users;

-- Inserir dados de cadastro complementares para o usuário administrador (id=1)
INSERT INTO cadastro_user (user_id, username, empresa, cargo, preferencias)
VALUES (
  1, 
  'admin', 
  'Vale-Sis', 
  'Administrador', 
  '{"tema": "escuro", "notificacoes": true}'
);

-- Inserir dados de cadastro complementares para o usuário comum (id=2)
INSERT INTO cadastro_user (user_id, username, empresa, cargo, preferencias)
VALUES (
  2, 
  'usuario', 
  'Vale-Sis', 
  'Usuário', 
  '{"tema": "claro", "notificacoes": false}'
);
