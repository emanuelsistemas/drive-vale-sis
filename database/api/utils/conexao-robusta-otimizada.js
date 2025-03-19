/**
 * Módulo para conexão robusta com o PostgreSQL
 * Versão otimizada que mantém a conexão aberta
 */

const { Pool } = require('pg');

// Configurações de conexão
const configs = {
  // Opção 1: Nome do container no Docker
  containerName: {
    host: process.env.POSTGRES_HOST || 'drive-vale-sis_supabase-db-1',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    ssl: process.env.POSTGRES_SSL === 'true'
  },
  
  // Opção 2: IP direto como fallback
  ipDirect: {
    host: '172.19.0.4',
    port: 5432,
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    ssl: process.env.POSTGRES_SSL === 'true'
  }
};

class ConexaoRobusta {
  constructor() {
    this.pool = null;
    this.configAtiva = null;
    this.inicializado = false;
  }
  
  /**
   * Tenta estabelecer conexão com o banco de dados usando uma configuração
   * @param {Object} config - Configuração para conexão
   * @returns {Promise<boolean>} - true se conectou com sucesso, false se falhou
   */
  async tentarConexao(config) {
    try {
      const pool = new Pool(config);
      // Testar a conexão obtendo um cliente
      const client = await pool.connect();
      client.release();
      this.pool = pool;
      this.configAtiva = config;
      return true;
    } catch (erro) {
      return false;
    }
  }
  
  /**
   * Inicializa a conexão com o banco de dados
   * @returns {Promise<void>}
   */
  async inicializar() {
    if (this.inicializado) return;
    
    console.log(' Inicializando conexão robusta com PostgreSQL...');
    
    // Tentar cada configuração em sequência
    const tentativas = [
      { nome: 'Nome do Container', config: configs.containerName },
      { nome: 'IP Direto', config: configs.ipDirect }
    ];
    
    for (const tentativa of tentativas) {
      console.log(` Testando conexão com ${tentativa.nome} (${tentativa.config.host})...`);
      const sucesso = await this.tentarConexao(tentativa.config);
      
      if (sucesso) {
        console.log(` Conexão estabelecida via ${tentativa.nome}!`);
        this.inicializado = true;
        return;
      }
      
      console.log(` Falha ao conectar via ${tentativa.nome}`);
    }
    
    throw new Error('Não foi possível conectar ao PostgreSQL com nenhuma configuração');
  }
  
  /**
   * Obtém um cliente do pool de conexões
   * @returns {Promise<Object>} - Cliente do pool
   */
  async obterCliente() {
    if (!this.inicializado) {
      await this.inicializar();
    }
    
    return this.pool.connect();
  }
  
  /**
   * Executa uma consulta SQL
   * @param {string} sql - Consulta SQL a ser executada
   * @param {Array} params - Parâmetros para a consulta
   * @returns {Promise<Object>} - Resultado da consulta
   */
  async executarQuery(sql, params = []) {
    if (!this.inicializado) {
      await this.inicializar();
    }
    
    const client = await this.pool.connect();
    try {
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }
  
  /**
   * Executa múltiplas consultas em uma transação
   * @param {Function} callback - Função que recebe o cliente e executa as consultas
   * @returns {Promise<any>} - Resultado da transação
   */
  async executarTransacao(callback) {
    if (!this.inicializado) {
      await this.inicializar();
    }
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const resultado = await callback(client);
      await client.query('COMMIT');
      return resultado;
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }
  }
  
  /**
   * Fecha o pool de conexões
   * @returns {Promise<void>}
   */
  async fechar() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.inicializado = false;
      console.log(' Conexão com o banco encerrada');
    }
  }
  
  /**
   * Retorna informações sobre a conexão ativa
   * @returns {Object} - Informações de conexão
   */
  getInfo() {
    return {
      inicializado: this.inicializado,
      host: this.configAtiva?.host || 'não conectado',
      database: this.configAtiva?.database || 'não conectado'
    };
  }
}

// Criar uma instância única (singleton)
const conexao = new ConexaoRobusta();

// API pública
module.exports = {
  inicializar: () => conexao.inicializar(),
  executarQuery: (sql, params) => conexao.executarQuery(sql, params),
  executarTransacao: (callback) => conexao.executarTransacao(callback),
  obterCliente: () => conexao.obterCliente(),
  fechar: () => conexao.fechar(),
  getInfo: () => conexao.getInfo(),
  get configAtiva() { return conexao.configAtiva; }
};

// Exemplo de uso se executado diretamente
if (require.main === module) {
  async function exemploUso() {
    try {
      // 1. Inicializar a conexão
      await module.exports.inicializar();
      
      // 2. Executar consultas simples
      const info = await module.exports.executarQuery(
        'SELECT current_database() as db, current_user as usuario'
      );
      console.log('\n Informações da conexão:');
      console.table(info.rows);
      
      // 3. Exemplo de transação
      await module.exports.executarTransacao(async (client) => {
        // Esta função recebe o cliente e executa múltiplas consultas em uma transação
        console.log('\n Executando transação de exemplo...');
        
        // Criar tabela temporária para o exemplo
        await client.query(`
          CREATE TEMPORARY TABLE IF NOT EXISTS exemplo_transacao (
            id SERIAL PRIMARY KEY,
            descricao TEXT,
            valor NUMERIC(10,2)
          )
        `);
        
        // Inserir dados
        await client.query(`
          INSERT INTO exemplo_transacao (descricao, valor)
          VALUES ('Item 1', 100.50), ('Item 2', 200.75), ('Item 3', 150.25)
        `);
        
        // Consultar dados
        const resultado = await client.query('SELECT * FROM exemplo_transacao');
        console.log('\n Dados na transação:');
        console.table(resultado.rows);
        
        return resultado.rows;
      });
      
      // 4. Mostrar informações da conexão
      console.log('\n Informações da conexão:');
      console.log(module.exports.getInfo());
      
      // 5. Fechar conexão ao finalizar
      await module.exports.fechar();
      
    } catch (erro) {
      console.error(' Erro:', erro.message);
      // Garantir que a conexão seja fechada mesmo em caso de erro
      await module.exports.fechar();
    }
  }
  
  // Executar exemplo
  exemploUso();
}
