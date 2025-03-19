# Documentação do Banco de Dados - Drive Vale-Sis

Esta documentação descreve como acessar, configurar e administrar o banco de dados PostgreSQL do projeto Drive Vale-Sis.

## Configuração do Banco de Dados

O PostgreSQL está configurado em um container Docker no EasyPanel com as seguintes propriedades:

- **Host**: drive-vale-sis_supabase-db-1 (nome do container) ou 172.19.0.4 (IP)
- **Porta**: 5432
- **Banco de Dados**: postgres
- **Usuário**: postgres
- **Senha**: your-super-secret-and-long-postgres-password
- **SSL**: Desabilitado

> **Nota**: O sistema está configurado para tentar conectar primeiro usando o nome do container, e se falhar, usar o IP como fallback. Isso garante maior robustez em caso de alterações de rede.

## Conexão ao Banco de Dados

### Conectando ao PostgreSQL (Robusto)

Esta seção detalha as formas de conexão ao banco de dados PostgreSQL do Supabase, utilizando diferentes abordagens para garantir robustez.

#### 1. Conexão utilizando nome do container Docker

```javascript
const { Pool } = require('pg');

// Usando o nome do container Docker
const pool = new Pool({
  host: 'drive-vale-sis_supabase-db-1',  // Nome do container Docker
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'your-super-secret-and-long-postgres-password',
  ssl: false
});
```

#### 2. Conexão com fallback automático

Diversas opções de conexão foram implementadas para garantir que seu código continue funcionando mesmo que uma forma de conexão falhe:

##### Usando o módulo de conexão robusta

```javascript
// Importar o módulo
const db = require('./scripts/conexao-robusta-otimizada');

// Inicializar a conexão (tenta várias opções automaticamente)
await db.inicializar();

// Executar consultas
const resultado = await db.executarQuery('SELECT NOW() as data_hora');
console.log(resultado.rows[0]);

// Executar transações (garante atomicidade)
await db.executarTransacao(async (client) => {
  // Realizar múltiplas operações no mesmo client
  await client.query('INSERT INTO exemplo (nome) VALUES ($1)', ['Teste']);
  await client.query('UPDATE exemplo SET data = NOW()');
  // Se qualquer operação falhar, a transação inteira é revertida
});

// Fechar conexão quando terminar
await db.fechar();
```

##### Utilizando variáveis de ambiente

Para ambientes de produção, você pode configurar as conexões através de variáveis de ambiente:

```javascript
// Usar config-env.js
const config = require('./scripts/config-env');

// Imprimir configuração atual (útil para debug)
config.printConfig();

// Obter a melhor configuração disponível
const dbConfig = await config.obterConfiguracaoDb();

// Conectar com a configuração obtida
const { Pool } = require('pg');
const pool = new Pool(dbConfig);
```

#### 3. Dicas para resolução de problemas

1. **Se o nome do container não funcionar**, você pode adicionar uma entrada no arquivo `/etc/hosts`:
   ```
   172.19.0.4 drive-vale-sis_supabase-db-1
   ```

2. **Verificar a rede Docker**:
   ```bash
   docker network inspect drive-vale-sis_default
   ```

3. **Testar conexão com os scripts**:
   ```bash
   node scripts/testar-conexao-hostname.js
   ```

4. **Usar o modo de conexão otimizada para aplicações de produção**:
   ```bash
   node scripts/exemplo-transacao.js
   ```

#### 4. Uso com dotenv

O módulo `config-env.js` suporta carregamento de variáveis de ambiente via `.env`. Crie um arquivo `.env` na raiz do projeto:

```
POSTGRES_HOST=drive-vale-sis_supabase-db-1
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
POSTGRES_FALLBACK_HOST=172.19.0.4
```

Ou gere um arquivo `.env` de exemplo:

```bash
node scripts/config-env.js
# Isso criará um arquivo .env.example que você pode renomear para .env
```

## Integração com Supabase

O banco de dados está integrado com o Supabase local no EasyPanel com:

- **URL API**: http://172.19.0.13:8000
- **Chave de Serviço**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q

## Estrutura de Diretórios

```
/m-software/drive-vale-sis/database/
├── README.md                   # Esta documentação
└── scripts/                    # Scripts para gerenciamento do banco
    ├── config.js               # Configurações centralizadas
    ├── executar-sql.js         # Utilitário para executar SQL
    ├── gerenciar-banco.js      # Classe para gerenciamento do banco
    └── popular-dados-teste.js  # Script para popular dados de teste
```

## Como Utilizar os Scripts

### 1. Acessar o Banco via Linha de Comando

Para acessar diretamente o PostgreSQL via terminal, utilize o comando:

```bash
PGPASSWORD=your-super-secret-and-long-postgres-password psql -h drive-vale-sis_supabase-db-1 -p 5432 -U postgres -d postgres
```

Alternativamente, se o nome do host não funcionar, use o IP:

```bash
PGPASSWORD=your-super-secret-and-long-postgres-password psql -h 172.19.0.4 -p 5432 -U postgres -d postgres
```

### 2. Comandos PSQL Úteis

**Listar tabelas:**
```bash
PGPASSWORD=your-super-secret-and-long-postgres-password psql -h drive-vale-sis_supabase-db-1 -p 5432 -U postgres -d postgres -c "\dt"
```

**Descrever uma tabela:**
```bash
PGPASSWORD=your-super-secret-and-long-postgres-password psql -h drive-vale-sis_supabase-db-1 -p 5432 -U postgres -d postgres -c "\d NOME_DA_TABELA"
```

**Consultar dados:**
```bash
PGPASSWORD=your-super-secret-and-long-postgres-password psql -h drive-vale-sis_supabase-db-1 -p 5432 -U postgres -d postgres -c "SELECT * FROM NOME_DA_TABELA;"
```

### 3. Utilizando os Scripts JavaScript

#### Executar uma consulta SQL simples

```javascript
// Exemplo de uso do executar-sql.js
const { executarSQL } = require('./scripts/executar-sql');

async function exemplo() {
  try {
    const resultado = await executarSQL('SELECT * FROM tabela_teste LIMIT 5;');
    console.log(resultado.rows);
  } catch (erro) {
    console.error('Erro:', erro);
  }
}

exemplo();
```

#### Gerenciamento do banco com API JavaScript

```javascript
// Exemplo de uso do gerenciar-banco.js
const db = require('./scripts/gerenciar-banco');

async function exemplo() {
  try {
    // Listar todas as tabelas
    const tabelas = await db.listarTabelas();
    console.log('Tabelas:', tabelas);
    
    // Descrever estrutura de uma tabela
    const estrutura = await db.descreverTabela('teste');
    console.log('Estrutura da tabela teste:', estrutura);
    
    // Consultar dados
    const dados = await db.consultarTabela('teste', '*', 'id < $1', [10]);
    console.log('Dados:', dados.rows);
    
    // Inserir um novo registro
    const resultado = await db.inserirRegistros(
      'teste',
      ['nome'],
      [['Novo registro via API']]
    );
    console.log('Registro inserido:', resultado[0].rows[0]);
    
  } catch (erro) {
    console.error('Erro:', erro);
  } finally {
    await db.fecharConexoes();
  }
}

exemplo();
```

## Como Criar Novas Tabelas

### Via PSQL

```bash
PGPASSWORD=your-super-secret-and-long-postgres-password psql -h drive-vale-sis_supabase-db-1 -p 5432 -U postgres -d postgres -c "
CREATE TABLE nova_tabela (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"
```

### Via Script JavaScript

```javascript
const db = require('./scripts/gerenciar-banco');

async function criarNovaTabelaExemplo() {
  try {
    await db.criarTabela('nova_tabela_exemplo', `
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      descricao TEXT,
      data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('Tabela criada com sucesso!');
  } catch (erro) {
    console.error('Erro ao criar tabela:', erro);
  } finally {
    await db.fecharConexoes();
  }
}

criarNovaTabelaExemplo();
```

## Configuração do MCP para Supabase

Para utilizar o Supabase MCP na sua IDE, configure o arquivo de configuração em:

```
~/.config/supabase-mcp/.env
```

com o seguinte conteúdo:

```
SUPABASE_DB_HOST=drive-vale-sis_supabase-db-1
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-super-secret-and-long-postgres-password
SUPABASE_LOCAL=true
SUPABASE_POOLER_ENABLED=false
SUPABASE_REGION=local
SUPABASE_PROJECT_REF=drive-vale-sis
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
```

Para instalar ou atualizar o servidor MCP do Supabase:

```bash
pipx install supabase-mcp-server
```

## Segurança e Boas Práticas

1. **Backup Regular**: Configure backups automáticos do banco de dados
2. **Versionar Migrações**: Utilize arquivos SQL ou ferramentas como o Prisma para versionar alterações no esquema
3. **Princípio de Menor Privilégio**: Use Row Level Security (RLS) no Supabase para controlar o acesso aos dados
4. **Teste em Ambiente de Desenvolvimento**: Teste as mudanças em ambiente de desenvolvimento antes de aplicar em produção
5. **Auditorias de Acesso**: Configure logs de auditoria para operações sensíveis

## Solução de Problemas

### Não é possível conectar ao PostgreSQL

1. Verifique se os containers Docker estão rodando
2. Teste a conexão usando tanto o nome do container quanto o IP:
   ```
   ping drive-vale-sis_supabase-db-1
   ping 172.19.0.4
   ```
3. Se o nome do container não resolver, adicione uma entrada ao arquivo /etc/hosts:
   ```
   echo "172.19.0.4   drive-vale-sis_supabase-db-1" | sudo tee -a /etc/hosts
   ```
4. Confirme se as credenciais de acesso estão corretas

### Erro de Permissão

1. Confirme se o usuário tem as permissões adequadas para a operação
2. Verifique as políticas RLS no Supabase

### Supabase não está acessando o PostgreSQL

1. Verifique a configuração do arquivo .env
2. Confirme que o container do PostgreSQL está acessível pelo Supabase

## Recursos Adicionais

- [Documentação do PostgreSQL](https://www.postgresql.org/docs/)
- [Documentação do Supabase](https://supabase.com/docs)
- [Repositório do MCP Supabase](https://github.com/alexander-zuev/supabase-mcp-server)

## Exemplos de Uso

### Scripts de exemplo disponíveis

Os seguintes scripts de exemplo estão disponíveis para referência:

1. **exemplo-robusto.js** - Demonstra conexão robusta com fallback
2. **exemplo-transacao.js** - Exemplo de uso de transações para operações complexas
3. **testar-conexao-hostname.js** - Testa conexão usando nome do container
4. **gerenciar-banco.js** - Funções utilitárias para trabalhar com o banco

## Guia de Operações Avançadas

### Transações e Consistência de Dados

Para garantir a integridade dos dados em operações complexas, utilize transações:

```javascript
const db = require('./scripts/conexao-robusta-otimizada');

try {
  await db.inicializar();
  
  await db.executarTransacao(async (client) => {
    // Todas as operações aqui são atômicas
    await client.query('UPDATE tabela1 SET campo = valor WHERE condição');
    await client.query('INSERT INTO tabela2 (campo) VALUES ($1)', [valor]);
    
    // Se qualquer operação falhar, a transação inteira é revertida
  });
} catch (erro) {
  console.error('Erro:', erro.message);
} finally {
  await db.fechar();
}
```

### Configuração para Diferentes Ambientes

Para facilitar a transição entre ambientes (desenvolvimento, teste, produção), use o módulo baseado em variáveis de ambiente:

```javascript
// Em desenvolvimento
// .env.development
POSTGRES_HOST=localhost
POSTGRES_PASSWORD=senha-desenvolvimento

// Em produção
// .env.production
POSTGRES_HOST=endereco-producao
POSTGRES_PASSWORD=senha-producao-segura
POSTGRES_SSL=true

```

## API REST

Para facilitar a integração com o frontend, desenvolvemos uma API REST completa que utiliza a conexão robusta com o PostgreSQL. A API está localizada na pasta `api/` e inclui:

### Principais Recursos da API

- **Sistema de Autenticação**: Login, registro e gerenciamento de tokens JWT
- **Gerenciamento de Usuários**: CRUD completo para usuários e perfis
- **Gerenciamento de Arquivos**: Upload, download, visualização e compartilhamento
- **Compartilhamentos**: Controle de permissões e compartilhamento de arquivos

### Como Utilizar a API

1. Configure o arquivo `.env` na pasta `api/`:
   ```
   # Configurações do servidor
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=sua-chave-secreta
   JWT_EXPIRES_IN=24h

   # Configurações do PostgreSQL
   POSTGRES_HOST=drive-vale-sis_supabase-db-1
   POSTGRES_PORT=5432
   POSTGRES_DB=postgres
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
   ```

2. Instale as dependências:
   ```
   cd api
   npm install
   ```

3. Inicie o servidor:
   ```
   npm start
   ```

4. A API estará disponível em `http://localhost:3001/api/`

5. Integre com o frontend usando chamadas HTTP com autenticação JWT:
   ```javascript
   // Exemplo com Axios
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
   ```

Para mais detalhes, consulte a [documentação completa da API](./api/README.md).
