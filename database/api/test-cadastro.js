/**
 * Script para testar a API de cadastro diretamente
 * Este script usa o controller de cadastro para inserir um usuário diretamente no banco
 */

const cadastroController = require('./controllers/cadastroController');

// Criar objeto req e res simulados
const req = {
  body: {
    name: 'Usuário de Teste API',
    email: 'teste-api@valeterm.com',
    password: 'teste123',
    role: 'user'
  }
};

const res = {
  status: (code) => {
    console.log(`Status: ${code}`);
    return {
      json: (data) => {
        console.log('Resposta:');
        console.log(JSON.stringify(data, null, 2));
      }
    };
  }
};

const next = (error) => {
  console.error('Erro:');
  console.error(error);
};

async function executarTeste() {
  console.log('=== TESTE: Verificar conexão com banco ===');
  try {
    await cadastroController.testarConexao(req, res, next);
    
    console.log('\n=== TESTE: Criar cadastro de usuário ===');
    await cadastroController.criarCadastro(req, res, next);
    
    console.log('\n=== TESTE: Listar usuários ===');
    const reqList = { query: {} };
    await cadastroController.listarCadastros(reqList, res, next);
    
  } catch (error) {
    console.error('Erro ao executar teste:', error);
  }
}

executarTeste();
