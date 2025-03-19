/**
 * Módulo de acesso ao banco de dados
 * Encapsula o uso da conexão robusta otimizada
 */

const db = require('./conexao-robusta-otimizada');

// Inicializa a conexão automaticamente quando o módulo é importado
let initialized = false;
let initializing = false;

// Função para garantir que a conexão está inicializada
async function ensureConnection() {
  if (initialized) return;
  
  if (initializing) {
    // Se já estiver inicializando, aguarde
    while (initializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }
  
  try {
    initializing = true;
    await db.inicializar();
    initialized = true;
  } catch (error) {
    console.error('❌ Erro ao inicializar conexão com o banco:', error);
    throw error;
  } finally {
    initializing = false;
  }
}

// Wrapper para executar consultas
async function query(sql, params = []) {
  await ensureConnection();
  return await db.executarQuery(sql, params);
}

// Wrapper para executar transações
async function transaction(callback) {
  await ensureConnection();
  return await db.executarTransacao(callback);
}

// Fechar conexão (normalmente usado apenas no encerramento do aplicativo)
async function close() {
  if (initialized) {
    await db.fechar();
    initialized = false;
  }
}

// Monitorar encerramento do processo para fechar conexões
process.on('SIGINT', async () => {
  console.log('\n🔄 Fechando conexões com o banco de dados...');
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Fechando conexões com o banco de dados...');
  await close();
  process.exit(0);
});

module.exports = {
  query,
  transaction,
  close
};
