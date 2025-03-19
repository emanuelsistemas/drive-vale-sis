/**
 * DB-TOOLS - Utilitário unificado para operações no banco de dados
 * 
 * Uso: node db-tools.js <comando> [opções]
 * 
 * Comandos disponíveis:
 *   reset         - Remove todas as tabelas do banco
 *   init          - Inicializa o banco com estrutura básica
 *   seed          - Popula o banco com dados iniciais
 *   list          - Lista tabelas e quantidade de registros
 *   query <sql>   - Executa uma consulta SQL
 *   backup        - Cria backup do banco
 *   restore <file>- Restaura backup
 *   migrate       - Executa migrações pendentes
 *   check         - Verifica conexão com o banco
 *   help          - Mostra esta ajuda
 */

const db = require('../api/utils/db');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Utilitários para formatação de saída
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ️ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.magenta}==== ${msg} ====${colors.reset}\n`),
  table: (data) => console.table(data)
};

// Handler para os diferentes comandos
const commands = {
  /**
   * Reset: Remove todas as tabelas do banco
   */
  async reset() {
    log.title('RESETANDO BANCO DE DADOS');
    log.warning('Atenção: Esta operação vai remover TODAS as tabelas e dados!');
    
    try {
      // Listar todas as tabelas no esquema public
      const tablesResult = await db.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
      `);
      
      const tables = tablesResult.rows.map(row => row.tablename);
      
      if (tables.length === 0) {
        log.success('Nenhuma tabela encontrada. O banco já está vazio.');
        return;
      }
      
      log.info(`Tabelas encontradas (${tables.length}): ${tables.join(', ')}`);
      
      // Desabilitar temporariamente as restrições de chave estrangeira
      await db.query('SET CONSTRAINTS ALL DEFERRED;');
      
      // Executar uma transação para garantir que tudo seja deletado de forma consistente
      await db.transaction(async (client) => {
        log.info('Deletando todas as tabelas...');
        
        // Desabilitar triggers para evitar problemas com RLS ou outras políticas
        await client.query('SET session_replication_role = replica;');
        
        // Deletar cada tabela
        for (const table of tables) {
          log.info(`Deletando tabela: ${table}`);
          await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        }
        
        // Restaurar triggers
        await client.query('SET session_replication_role = DEFAULT;');
      });
      
      // Verificar se todas as tabelas foram realmente removidas
      const checkResult = await db.query(`
        SELECT COUNT(*) as count
        FROM pg_tables
        WHERE schemaname = 'public'
      `);
      
      const remainingTables = parseInt(checkResult.rows[0].count);
      
      if (remainingTables === 0) {
        log.success('Banco de dados vazio! Pronto para iniciar do zero.');
      } else {
        log.warning(`Ainda existem ${remainingTables} tabelas no banco.`);
      }
    } catch (error) {
      log.error(`Erro ao deletar tabelas: ${error.message}`);
      console.error(error);
    }
  },
  
  /**
   * Init: Inicializa o banco com estrutura básica
   */
  async init() {
    log.title('INICIALIZANDO ESTRUTURA DO BANCO');
    
    try {
      // Verificar se já existem tabelas
      const tablesResult = await db.query(`
        SELECT COUNT(*) as count
        FROM pg_tables
        WHERE schemaname = 'public'
      `);
      
      const existingTables = parseInt(tablesResult.rows[0].count);
      if (existingTables > 0) {
        log.warning(`Existem ${existingTables} tabelas no banco. Use 'reset' primeiro ou 'init --force' para forçar.`);
        return;
      }
      
      log.info('Criando tabela de usuários...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          company VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      log.info('Criando tabela de arquivos...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS files (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          size BIGINT NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          path VARCHAR(500) NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          public BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      log.info('Criando tabela de compartilhamentos...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS shares (
          id SERIAL PRIMARY KEY,
          file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
          owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          shared_with_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          permission VARCHAR(50) DEFAULT 'read',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(file_id, shared_with_id)
        )
      `);
      
      log.success('Banco de dados inicializado com sucesso!');
    } catch (error) {
      log.error(`Erro ao inicializar banco: ${error.message}`);
      console.error(error);
    }
  },
  
  /**
   * Seed: Popula o banco com dados iniciais
   */
  async seed() {
    log.title('POPULANDO BANCO COM DADOS INICIAIS');
    
    try {
      // Verificar se já existem usuários
      const usersResult = await db.query(`
        SELECT COUNT(*) as count FROM users
      `).catch(() => ({ rows: [{ count: 0 }] }));
      
      if (parseInt(usersResult.rows[0].count) > 0) {
        log.warning('Já existem usuários no banco. Use --force para substituir.');
        return;
      }
      
      log.info('Criando usuários iniciais...');
      
      // Criar usuário admin
      await db.query(`
        INSERT INTO users (email, name, password_hash, role)
        VALUES ('admin@valeterm.com', 'Administrador', '$2a$10$NFVGR7/.LpYg4CgctFiFpuWHvq0FIaVOlUxYjvNPPPfQGMQJDo3lO', 'admin')
      `);
      
      // Senha: 'admin123'
      
      // Criar usuário normal
      await db.query(`
        INSERT INTO users (email, name, password_hash, role)
        VALUES ('usuario@valeterm.com', 'Usuário Comum', '$2a$10$C/VN0RZylU2D0t9I26KQpO2tI/8iX4XwEGCgYMf42DPa9XZZb2bi.', 'user')
      `);
      
      // Senha: 'user123'
      
      log.success('Dados iniciais inseridos com sucesso!');
    } catch (error) {
      log.error(`Erro ao popular banco: ${error.message}`);
      console.error(error);
    }
  },
  
  /**
   * List: Lista tabelas e quantidade de registros
   */
  async list() {
    log.title('LISTANDO TABELAS E REGISTROS');
    
    try {
      // Buscar todas as tabelas
      const tablesResult = await db.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
      `);
      
      const tables = tablesResult.rows.map(row => row.tablename);
      
      if (tables.length === 0) {
        log.info('Nenhuma tabela encontrada no banco.');
        return;
      }
      
      // Construir um objeto com informações de cada tabela
      const tablesInfo = [];
      
      for (const table of tables) {
        // Contar registros
        const countResult = await db.query(`SELECT COUNT(*) as count FROM "${table}"`);
        const count = parseInt(countResult.rows[0].count);
        
        // Verificar colunas
        const columnsResult = await db.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
        `, [table]);
        
        const columns = columnsResult.rows.map(row => row.column_name);
        
        tablesInfo.push({
          table,
          records: count,
          columns: columns.length
        });
      }
      
      log.table(tablesInfo);
    } catch (error) {
      log.error(`Erro ao listar tabelas: ${error.message}`);
      console.error(error);
    }
  },
  
  /**
   * Query: Executa uma consulta SQL
   */
  async query(args) {
    if (!args || args.length === 0) {
      log.error('SQL não fornecido. Use: node db-tools.js query "SELECT * FROM users"');
      return;
    }
    
    const sql = args.join(' ');
    log.title('EXECUTANDO CONSULTA SQL');
    log.info(`SQL: ${sql}`);
    
    try {
      const result = await db.query(sql);
      log.success(`Consulta executada: ${result.rowCount} registros afetados`);
      
      if (result.rows && result.rows.length > 0) {
        log.table(result.rows);
      }
    } catch (error) {
      log.error(`Erro na consulta SQL: ${error.message}`);
      console.error(error);
    }
  },
  
  /**
   * Check: Verifica conexão com o banco
   */
  async check() {
    log.title('VERIFICANDO CONEXÃO COM O BANCO');
    
    try {
      const startTime = Date.now();
      const result = await db.query('SELECT 1 as ok');
      const elapsed = Date.now() - startTime;
      
      if (result.rows && result.rows[0].ok === 1) {
        log.success(`Conexão estabelecida com sucesso em ${elapsed}ms`);
        
        // Mostrar informações da conexão
        const connInfo = await db.query(`
          SELECT current_database() as database,
                 current_user as user,
                 version() as version
        `);
        
        log.info('Informações da conexão:');
        log.table(connInfo.rows[0]);
      } else {
        log.error('Falha na verificação de conexão');
      }
    } catch (error) {
      log.error(`Erro ao conectar: ${error.message}`);
      console.error(error);
    }
  },
  
  /**
   * Help: Mostra ajuda
   */
  help() {
    const help = fs.readFileSync(__filename, 'utf8')
      .split('\n')
      .slice(1, 16)
      .map(line => line.replace(/^\s*\* ?/, ''))
      .join('\n');
      
    console.log(help);
  }
};

// Função principal
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const commandArgs = args.slice(1);
    
    if (!commands[command]) {
      log.error(`Comando desconhecido: ${command}`);
      commands.help();
      return;
    }
    
    await commands[command](commandArgs);
  } catch (error) {
    log.error(`Erro na execução: ${error.message}`);
    console.error(error);
  } finally {
    await db.close();
    log.info('Conexão fechada.');
  }
}

// Executar o programa
main();
