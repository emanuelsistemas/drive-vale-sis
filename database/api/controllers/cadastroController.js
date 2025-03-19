/**
 * Controller de cadastro de usuários
 * Gerencia operações para o cadastro de usuários na tabela users
 */

const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

// Função auxiliar para executar comandos SQL via Docker
const executarSqlViaPg = async (sql, params = []) => {
  try {
    // Converter parâmetros para formato SQL
    const paramsConvertidos = params.map(param => {
      if (param === null) return 'NULL';
      if (typeof param === 'string') return `'${param.replace(/'/g, "''")}'`;
      return param;
    });
    
    // Substituir parâmetros na query
    let queryFinal = sql;
    paramsConvertidos.forEach((param, index) => {
      queryFinal = queryFinal.replace(`$${index + 1}`, param);
    });
    
    // Executar o comando usando docker exec
    const comando = `docker exec drive-vale-sis_supabase-db-1 psql -U postgres -c "${queryFinal.replace(/"/g, '\\"')}"`;
    const resultado = execSync(comando).toString();
    
    // Extrair as linhas relevantes
    const linhas = resultado.split('\n');
    
    // Verificar se é uma consulta de seleção (tem cabeçalho)
    if (linhas.length > 3 && linhas[0].includes('|')) {
      // Consulta SELECT
      const cabecalho = linhas[0].split('|').map(col => col.trim());
      const dados = [];
      
      // Pular cabeçalho e rodapé
      for (let i = 2; i < linhas.length - 2; i++) {
        if (linhas[i].includes('|')) {
          const valores = linhas[i].split('|').map(val => val.trim());
          const obj = {};
          cabecalho.forEach((col, idx) => {
            if (col) obj[col] = valores[idx];
          });
          dados.push(obj);
        }
      }
      
      return { rows: dados };
    } else {
      // Consulta INSERT, UPDATE, DELETE
      return { rows: [], comando: comando, resultado: resultado };
    }
  } catch (error) {
    console.error('Erro ao executar SQL via Docker:', error);
    throw error;
  }
};

// Listar todos os cadastros
const listarCadastros = async (req, res, next) => {
  try {
    // Parâmetros de paginação e filtros
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // Construir consulta com filtro de busca
    let query = `
      SELECT 
        u.id, u.email, u.name, u.role, u.company, u.created_at, u.updated_at
      FROM users u
      WHERE 1=1
    `;
    
    const params = [];
    
    // Adicionar filtro de busca se fornecido
    if (search) {
      query += ` AND (u.name ILIKE '%${search}%' OR u.email ILIKE '%${search}%')`;
    }
    
    // Adicionar ordenação
    query += ` ORDER BY u.name ASC`;
    
    // Adicionar paginação
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    
    // Executar consulta
    const result = await executarSqlViaPg(query);
    
    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users u
      WHERE 1=1
      ${search ? ` AND (u.name ILIKE '%${search}%' OR u.email ILIKE '%${search}%')` : ''}
    `;
    
    const countResult = await executarSqlViaPg(countQuery);
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    // Retornar resultados paginados
    return res.status(200).json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar cadastros:', error);
    next(error);
  }
};

// Obter detalhes de um cadastro
const obterCadastro = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Buscar usuário
    const result = await executarSqlViaPg(`
      SELECT 
        u.id, u.email, u.name, u.role, u.company, u.created_at, u.updated_at
      FROM users u
      WHERE u.id = ${id}
    `);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cadastro não encontrado' });
    }
    
    return res.status(200).json(result.rows[0]);
    
  } catch (error) {
    console.error('Erro ao obter cadastro:', error);
    next(error);
  }
};

// Criar novo cadastro
const criarCadastro = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user', company } = req.body;
    
    // Verificar se o email já existe
    const checkEmail = await executarSqlViaPg(`
      SELECT id FROM users WHERE email = '${email}'
    `);
    
    if (checkEmail.rows.length > 0) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }
    
    // Gerar hash da senha
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    
    // Inserir o usuário
    const result = await executarSqlViaPg(`
      INSERT INTO users (
        email, name, password_hash, role, company
      )
      VALUES (
        '${email}', '${name}', '${passwordHash}', '${role}', ${company ? `'${company}'` : 'NULL'}
      )
      RETURNING id, email, name, role, company, created_at
    `);
    
    return res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Erro ao criar cadastro:', error);
    next(error);
  }
};

// Atualizar cadastro
const atualizarCadastro = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, password, role, company } = req.body;
    
    // Verificar se o cadastro existe
    const checkCadastro = await executarSqlViaPg(`
      SELECT id FROM users WHERE id = ${id}
    `);
    
    if (checkCadastro.rows.length === 0) {
      return res.status(404).json({ error: 'Cadastro não encontrado' });
    }
    
    // Preparar campos para atualização
    const updates = [];
    
    if (name) updates.push(`name = '${name}'`);
    if (company !== undefined) updates.push(`company = ${company ? `'${company}'` : 'NULL'}`);
    if (role) updates.push(`role = '${role}'`);
    
    // Se houver senha, gerar hash
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      updates.push(`password_hash = '${passwordHash}'`);
    }
    
    // Adicionar timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Se não há nada para atualizar
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    // Montar query
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ${id}
      RETURNING id, email, name, role, company, updated_at
    `;
    
    // Executar atualização
    const result = await executarSqlViaPg(query);
    
    return res.status(200).json(result.rows[0]);
    
  } catch (error) {
    console.error('Erro ao atualizar cadastro:', error);
    next(error);
  }
};

// Excluir cadastro
const excluirCadastro = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o cadastro existe
    const checkCadastro = await executarSqlViaPg(`
      SELECT id FROM users WHERE id = ${id}
    `);
    
    if (checkCadastro.rows.length === 0) {
      return res.status(404).json({ error: 'Cadastro não encontrado' });
    }
    
    // Excluir cadastro
    await executarSqlViaPg(`
      DELETE FROM users 
      WHERE id = ${id}
    `);
    
    return res.status(200).json({ message: 'Cadastro excluído com sucesso' });
    
  } catch (error) {
    console.error('Erro ao excluir cadastro:', error);
    next(error);
  }
};

// Testar conexão com o banco
const testarConexao = async (req, res, next) => {
  try {
    const result = await executarSqlViaPg('SELECT 1 as conectado');
    
    return res.status(200).json({
      conectado: true,
      mensagem: 'Conexão com o banco de dados está funcionando corretamente',
      detalhes: result.rows
    });
    
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return res.status(500).json({
      conectado: false,
      mensagem: 'Falha na conexão com o banco de dados',
      erro: error.message
    });
  }
};

module.exports = {
  listarCadastros,
  obterCadastro,
  criarCadastro,
  atualizarCadastro,
  excluirCadastro,
  testarConexao
};
