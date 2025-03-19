# API Drive Vale-Sis

API REST para o Drive Vale-Sis que utiliza conexão robusta com PostgreSQL.

## Configuração

1. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Configurações do servidor
PORT=3001
NODE_ENV=development
JWT_SECRET=drive-vale-sis-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Configurações do PostgreSQL
POSTGRES_HOST=drive-vale-sis_supabase-db-1
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
POSTGRES_SSL=false
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor:

```bash
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

## Rotas da API

### Autenticação

- `POST /api/auth/login` - Login de usuário
  ```json
  {
    "email": "usuario@exemplo.com",
    "senha": "senha123"
  }
  ```

- `POST /api/auth/register` - Registro de novo usuário
  ```json
  {
    "nome": "Nome Completo",
    "email": "usuario@exemplo.com",
    "senha": "senha123",
    "telefone": "11999998888",
    "empresa": "Empresa Ltda",
    "cargo": "Desenvolvedor"
  }
  ```

- `GET /api/auth/me` - Informações do usuário autenticado

### Usuários (requer autenticação)

- `GET /api/usuarios` - Listar todos os usuários (admin)
  - Query params: `?limite=10&pagina=1&busca=termo`

- `GET /api/usuarios/:id` - Obter usuário por ID

- `POST /api/usuarios` - Criar usuário (admin)
  ```json
  {
    "nome": "Nome Completo",
    "email": "usuario@exemplo.com",
    "senha": "senha123",
    "telefone": "11999998888",
    "empresa": "Empresa Ltda",
    "cargo": "Desenvolvedor",
    "perfil_id": "uuid-do-perfil"
  }
  ```

- `PUT /api/usuarios/:id` - Atualizar usuário
  ```json
  {
    "nome": "Nome Atualizado",
    "telefone": "11999997777",
    "empresa": "Nova Empresa",
    "cargo": "Gerente"
  }
  ```

- `DELETE /api/usuarios/:id` - Excluir usuário (admin)

### Arquivos (requer autenticação)

- `GET /api/arquivos` - Listar arquivos do usuário
  - Query params: `?limite=10&pagina=1&busca=termo&ordem=nome&direcao=asc`

- `GET /api/arquivos/:id` - Obter arquivo por ID

- `POST /api/arquivos` - Criar arquivo (multipart/form-data)
  - FormData:
    - `nome`: Nome do arquivo
    - `descricao`: Descrição opcional
    - `categoria_id`: ID da categoria (opcional)
    - `arquivo`: Arquivo para upload

- `PUT /api/arquivos/:id` - Atualizar arquivo
  ```json
  {
    "nome": "Novo nome",
    "descricao": "Nova descrição",
    "categoria_id": "uuid-da-categoria"
  }
  ```

- `DELETE /api/arquivos/:id` - Excluir arquivo

- `POST /api/arquivos/:id/download` - Registrar download

### Compartilhamentos (requer autenticação)

- `GET /api/compartilhamentos/criados` - Listar compartilhamentos criados pelo usuário
  - Query params: `?limite=10&pagina=1`

- `GET /api/compartilhamentos/recebidos` - Listar compartilhamentos recebidos pelo usuário
  - Query params: `?limite=10&pagina=1`

- `POST /api/compartilhamentos` - Criar compartilhamento
  ```json
  {
    "arquivo_id": "uuid-do-arquivo",
    "usuario_id": "uuid-do-usuario-destinatario",
    "permissao": "visualizar" // ou "editar"
  }
  ```

- `PUT /api/compartilhamentos/:id` - Atualizar compartilhamento
  ```json
  {
    "permissao": "editar"
  }
  ```

- `DELETE /api/compartilhamentos/:id` - Excluir compartilhamento

## Estrutura do Projeto

```
api/
├── controllers/            # Controladores da aplicação
│   ├── authController.js
│   ├── usuariosController.js
│   ├── arquivosController.js
│   └── compartilhamentosController.js
├── middlewares/            # Middlewares
│   ├── auth.js             # Middleware de autenticação
│   └── errorHandler.js     # Middleware de tratamento de erros
├── routes/                 # Rotas da API
│   ├── auth.js
│   ├── usuarios.js
│   ├── arquivos.js
│   └── compartilhamentos.js
├── utils/                  # Utilitários
│   └── db.js               # Cliente de conexão robusta com PostgreSQL
├── .env                    # Variáveis de ambiente
├── package.json            # Dependências do projeto
└── server.js               # Ponto de entrada da aplicação
```

## Conexão Robusta com PostgreSQL

Esta API utiliza o módulo de conexão robusta otimizada que:

1. Tenta se conectar usando o nome do container Docker
2. Usa fallback para endereço IP em caso de falha
3. Mantém uma única conexão ativa para melhor performance
4. Suporta transações para operações complexas
5. Gerencia automaticamente conexões e reconexões

## Segurança

A API implementa várias camadas de segurança:

1. **Autenticação JWT** - Tokens temporários para acesso autenticado
2. **Autorização baseada em perfis** - Controle de acesso diferenciado para usuários e administradores
3. **Validação de dados** - Cada endpoint verifica e valida os dados de entrada
4. **Tratamento centralizado de erros** - Formatação padronizada das respostas de erro
5. **Row Level Security (RLS)** - Segurança adicional no nível do banco de dados

## Integração com Frontend

Para integrar esta API com o frontend React do Drive Vale-Sis:

1. Configure o frontend para enviar requisições para `http://localhost:3001/api/`
2. Utilize o token JWT retornado pelo login para autenticar as demais requisições
3. Adicione o token no header `Authorization: Bearer {token}` em todas as requisições autenticadas

Exemplo de uso no React:

```javascript
// Configuração do Axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// Adicionar interceptor para incluir token em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Exemplo de login
const fazerLogin = async (email, senha) => {
  try {
    const response = await api.post('/auth/login', { email, senha });
    const { token, usuario } = response.data;
    
    // Armazenar token e informações do usuário
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    return usuario;
  } catch (error) {
    console.error('Erro no login:', error.response?.data?.mensagem || error.message);
    throw error;
  }
};

// Exemplo de listagem de arquivos
const listarArquivos = async (pagina = 1, limite = 10) => {
  try {
    const response = await api.get(`/arquivos?pagina=${pagina}&limite=${limite}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar arquivos:', error.response?.data?.mensagem || error.message);
    throw error;
  }
};
