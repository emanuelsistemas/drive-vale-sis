# Configuração do Supabase

Este diretório contém arquivos para integração com o Supabase, uma alternativa ao Firebase com banco de dados PostgreSQL.

## Arquivos

- `.env`: Variáveis de ambiente para configuração do Supabase
- `config.js`: Cliente Supabase configurado e funções auxiliares
- `schema.sql`: Script SQL para criar as tabelas necessárias no Supabase
- `test-connection.js`: Script para testar a conexão com o Supabase

## Como usar o Supabase no projeto

### 1. Importar o cliente Supabase

```javascript
import { supabase, auth, db } from '../supabase/config';
```

### 2. Autenticação

```javascript
// Fazer login
const handleLogin = async () => {
  const { data, error } = await auth.signIn('email@example.com', 'password');
  if (error) {
    console.error('Erro ao fazer login:', error.message);
  } else {
    console.log('Login bem-sucedido:', data);
  }
};

// Registrar um novo usuário
const handleSignUp = async () => {
  const { data, error } = await auth.signUp(
    'email@example.com', 
    'password',
    { nome_user: 'Nome do Usuário' }
  );
  
  if (error) {
    console.error('Erro ao criar conta:', error.message);
  } else {
    console.log('Conta criada com sucesso:', data);
  }
};

// Sair da conta
const handleLogout = async () => {
  const { error } = await auth.signOut();
  if (error) {
    console.error('Erro ao sair da conta:', error.message);
  } else {
    console.log('Logout bem-sucedido');
  }
};

// Obter usuário atual
const getCurrentUser = async () => {
  const { data, error } = await auth.getUser();
  if (error) {
    console.error('Erro ao obter usuário:', error.message);
  } else {
    console.log('Usuário atual:', data.user);
  }
};
```

### 3. Operações no banco de dados

```javascript
// Selecionar todos os usuários
const getUsers = async () => {
  const { data, error } = await db.select('user');
  if (error) {
    console.error('Erro ao buscar usuários:', error.message);
  } else {
    console.log('Usuários:', data);
  }
};

// Selecionar com filtros
const getUserByEmail = async (email) => {
  const { data, error } = await db.select('user', '*', { email_user: email });
  if (error) {
    console.error('Erro ao buscar usuário:', error.message);
  } else {
    console.log('Usuário encontrado:', data);
  }
};

// Inserir dados
const addUser = async (userData) => {
  const { data, error } = await db.insert('user', userData);
  if (error) {
    console.error('Erro ao adicionar usuário:', error.message);
  } else {
    console.log('Usuário adicionado:', data);
  }
};

// Atualizar dados
const updateUser = async (id, changes) => {
  const { data, error } = await db.update('user', changes, { id });
  if (error) {
    console.error('Erro ao atualizar usuário:', error.message);
  } else {
    console.log('Usuário atualizado:', data);
  }
};

// Excluir dados
const deleteUser = async (id) => {
  const { data, error } = await db.delete('user', { id });
  if (error) {
    console.error('Erro ao excluir usuário:', error.message);
  } else {
    console.log('Usuário excluído com sucesso');
  }
};
```

### 4. Aplicando o schema SQL

Para criar as tabelas definidas no arquivo `schema.sql`, você pode:

1. Acessar o painel de administração do Supabase em https://drive-vale-sis-supabase-drive-vale-sis.h6gsxu.easypanel.host/
2. Fazer login com as credenciais do painel: `supabase` / `XDJ8cnWtyyiU@YScB2-j`
3. Navegar até "SQL Editor"
4. Copiar e colar o conteúdo do arquivo `schema.sql`
5. Executar o script

## Mais informações

Para mais informações sobre como usar o Supabase, consulte a [documentação oficial](https://supabase.com/docs).
