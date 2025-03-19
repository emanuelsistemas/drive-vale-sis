/**
 * Controller de compartilhamentos
 * Gerencia operações para compartilhamentos de arquivos
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

// Listar compartilhamentos criados pelo usuário
const listarCompartilhamentosCriados = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT 
        s.id, s.permissao, s.created_at,
        a.id as arquivo_id, a.nome as arquivo_nome,
        u.id as destinatario_id, u.nome as destinatario_nome, u.email as destinatario_email
      FROM compartilhamento s
      JOIN arquivo a ON s.arquivo_id = a.id
      JOIN cad_emp_user u ON s.destinatario_id = u.id
      WHERE a.usuario_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);
    
    return res.status(200).json(result.rows);
    
  } catch (error) {
    next(error);
  }
};

// Listar compartilhamentos recebidos pelo usuário
const listarCompartilhamentosRecebidos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT 
        s.id, s.permissao, s.created_at,
        a.id as arquivo_id, a.nome as arquivo_nome, a.mimetype,
        a.tamanho_bytes, a.visualizacoes, a.downloads,
        u.id as proprietario_id, u.nome as proprietario_nome, 
        u.email as proprietario_email
      FROM compartilhamento s
      JOIN arquivo a ON s.arquivo_id = a.id
      JOIN cad_emp_user u ON a.usuario_id = u.id
      WHERE s.destinatario_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);
    
    return res.status(200).json(result.rows);
    
  } catch (error) {
    next(error);
  }
};

// Criar compartilhamento
const criarCompartilhamento = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { arquivo_id, destinatario_id, permissao = 'visualizar' } = req.body;
    
    // Iniciar transação
    await db.transaction(async (client) => {
      // Verificar propriedade do arquivo
      const fileCheck = await client.query(
        'SELECT id FROM arquivo WHERE id = $1 AND usuario_id = $2',
        [arquivo_id, userId]
      );
      
      if (fileCheck.rows.length === 0) {
        throw { statusCode: 403, message: 'Arquivo não encontrado ou acesso negado' };
      }
      
      // Verificar se o destinatário existe
      const userCheck = await client.query(
        'SELECT id FROM cad_emp_user WHERE id = $1 AND ativo = TRUE',
        [destinatario_id]
      );
      
      if (userCheck.rows.length === 0) {
        throw { statusCode: 404, message: 'Destinatário não encontrado' };
      }
      
      // Verificar se já existe compartilhamento
      const shareCheck = await client.query(
        'SELECT id FROM compartilhamento WHERE arquivo_id = $1 AND destinatario_id = $2',
        [arquivo_id, destinatario_id]
      );
      
      if (shareCheck.rows.length > 0) {
        throw { statusCode: 409, message: 'Já existe um compartilhamento para este arquivo e destinatário' };
      }
      
      // Validar permissão
      if (!['visualizar', 'editar'].includes(permissao)) {
        throw { statusCode: 400, message: 'Permissão inválida' };
      }
      
      // Inserir compartilhamento
      const result = await client.query(`
        INSERT INTO compartilhamento (id, arquivo_id, destinatario_id, permissao)
        VALUES ($1, $2, $3, $4)
        RETURNING id, arquivo_id, destinatario_id, permissao, created_at
      `, [
        uuidv4(),
        arquivo_id,
        destinatario_id,
        permissao
      ]);
      
      // Buscar dados completos
      const compartilhamento = result.rows[0];
      
      // Buscar informações do destinatário
      const destinatarioResult = await client.query(
        'SELECT nome, email FROM cad_emp_user WHERE id = $1',
        [destinatario_id]
      );
      
      if (destinatarioResult.rows.length > 0) {
        compartilhamento.destinatario_nome = destinatarioResult.rows[0].nome;
        compartilhamento.destinatario_email = destinatarioResult.rows[0].email;
      }
      
      // Buscar informações do arquivo
      const arquivoResult = await client.query(
        'SELECT nome FROM arquivo WHERE id = $1',
        [arquivo_id]
      );
      
      if (arquivoResult.rows.length > 0) {
        compartilhamento.arquivo_nome = arquivoResult.rows[0].nome;
      }
      
      return res.status(201).json(compartilhamento);
    });
    
  } catch (error) {
    next(error);
  }
};

// Atualizar compartilhamento
const atualizarCompartilhamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { permissao } = req.body;
    
    // Validar permissão
    if (!['visualizar', 'editar'].includes(permissao)) {
      return res.status(400).json({ error: 'Permissão inválida' });
    }
    
    // Verificar propriedade do compartilhamento
    const shareCheck = await db.query(`
      SELECT s.id 
      FROM compartilhamento s
      JOIN arquivo a ON s.arquivo_id = a.id
      WHERE s.id = $1 AND a.usuario_id = $2
    `, [id, userId]);
    
    if (shareCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Compartilhamento não encontrado ou acesso negado' });
    }
    
    // Atualizar compartilhamento
    await db.query(
      'UPDATE compartilhamento SET permissao = $1 WHERE id = $2',
      [permissao, id]
    );
    
    // Buscar compartilhamento atualizado
    const result = await db.query(`
      SELECT 
        s.id, s.permissao, s.created_at,
        a.id as arquivo_id, a.nome as arquivo_nome,
        u.id as destinatario_id, u.nome as destinatario_nome, u.email as destinatario_email
      FROM compartilhamento s
      JOIN arquivo a ON s.arquivo_id = a.id
      JOIN cad_emp_user u ON s.destinatario_id = u.id
      WHERE s.id = $1
    `, [id]);
    
    return res.status(200).json(result.rows[0]);
    
  } catch (error) {
    next(error);
  }
};

// Excluir compartilhamento
const excluirCompartilhamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar propriedade do compartilhamento
    const shareCheck = await db.query(`
      SELECT s.id 
      FROM compartilhamento s
      JOIN arquivo a ON s.arquivo_id = a.id
      WHERE s.id = $1 AND a.usuario_id = $2
    `, [id, userId]);
    
    if (shareCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Compartilhamento não encontrado ou acesso negado' });
    }
    
    // Excluir compartilhamento
    await db.query(
      'DELETE FROM compartilhamento WHERE id = $1',
      [id]
    );
    
    return res.status(200).json({ message: 'Compartilhamento excluído com sucesso' });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarCompartilhamentosCriados,
  listarCompartilhamentosRecebidos,
  criarCompartilhamento,
  atualizarCompartilhamento,
  excluirCompartilhamento
};
