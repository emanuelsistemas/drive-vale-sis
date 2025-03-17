# Configuração PostgreSQL no EasyPanel

Este guia demonstra como configurar e conectar ao PostgreSQL rodando em um container no EasyPanel.

## 1. Instalação do Template PostgreSQL

1. No EasyPanel, instale o template do PostgreSQL
2. Configure as variáveis de ambiente necessárias:
   - Database Name: nome do seu banco (ex: bd_drive_react)
   - User: postgres (padrão)
   - Password: sua senha
   - Port: 5432 (padrão)

## 2. Configuração no Projeto

### 2.1. Instalação das Dependências

```bash
# Instale o pacote pg para conexão com PostgreSQL
npm install --save-dev pg @types/pg

# Se for usar com TypeScript, instale também
npm install --save-dev typescript ts-node
```

### 2.2. Configuração das Variáveis de Ambiente

Crie ou atualize seu arquivo `.env`:

```env
# Configuração PostgreSQL
PG_HOST=<IP_INTERNO_DO_CONTAINER>  # Será obtido via Docker
PG_PORT=5432
PG_DATABASE=bd_drive_react
PG_USER=postgres
PG_PASSWORD=sua_senha
```

### 2.3. Script de Teste de Conexão

Crie um arquivo `scripts/testeConexao.js`:

```javascript
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuração da conexão usando as variáveis de ambiente
const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: false  // Desativa SSL pois é conexão local
});

async function testarConexao() {
  try {
    console.log('Testando conexão com PostgreSQL...');
    console.log(`Host: ${process.env.PG_HOST}`);
    console.log(`Porta: ${process.env.PG_PORT}`);
    console.log(`Database: ${process.env.PG_DATABASE}`);
    console.log(`Usuário: ${process.env.PG_USER}`);
    
    // Primeiro testa a conexão
    const client = await pool.connect();
    console.log('Conexão estabelecida com sucesso!');

    // Tenta fazer uma consulta simples
    const result = await client.query('SELECT current_database(), current_user, version();');
    console.log('\nInformações do banco:');
    console.log(result.rows[0]);

    // Libera o cliente
    client.release();
    
  } catch (error) {
    console.error('Erro ao conectar com o PostgreSQL:', error);
  } finally {
    // Fecha a pool de conexões
    await pool.end();
  }
}

// Executa o teste
testarConexao();
```

## 3. Localizando o IP do Container

Para encontrar o IP interno do container PostgreSQL:

```bash
# 1. Liste os containers PostgreSQL
docker ps | grep postgres

# 2. Pegue o nome completo do container desejado
# Exemplo: drive-vale-sis_bd_drive_react.1.gstv21p81njge7j2atkrndptv

# 3. Inspecione o container para obter o IP
docker inspect nome_do_container | grep IPAddress

# 4. Use o IP encontrado (geralmente começa com 10.11.x.x) no PG_HOST do .env
```

## 4. Testando a Conexão

Execute o script de teste:

```bash
node src/scripts/testeConexao.js
```

Se tudo estiver configurado corretamente, você verá uma mensagem de sucesso e as informações do banco.

## 5. Exemplo de Uso em Produção

Para usar em seu código de produção, crie um arquivo de configuração da conexão:

```javascript
// src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect()
};
```

Exemplo de uso:

```javascript
const db = require('./config/database');

async function buscarUsuarios() {
  try {
    const { rows } = await db.query('SELECT * FROM usuarios');
    return rows;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
}
```

## 6. Dicas e Boas Práticas

1. **Pooling de Conexões**: Use sempre o Pool ao invés de criar conexões individuais
2. **Variáveis de Ambiente**: Nunca comite senhas ou credenciais no código
3. **Tratamento de Erros**: Sempre implemente try/catch apropriado
4. **SSL**: Em produção, considere habilitar SSL se o banco estiver em outro servidor
5. **Logs**: Implemente logs apropriados para debug em produção

## 7. Troubleshooting

### Erro de Conexão Recusada
- Verifique se o IP do container está correto
- Confirme se está na mesma rede Docker
- Verifique se o PostgreSQL está rodando (docker logs)

### Erro de Autenticação
- Confirme as credenciais no .env
- Verifique se o usuário tem permissão no banco

### Erro de SSL
- Se necessário, configure o SSL apropriadamente
- Para desenvolvimento local, mantenha ssl: false
