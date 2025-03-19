/**
 * Controller de usuários
 * Gerencia operações CRUD para usuários
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

// Listar todos os usuários (admin apenas)
const listarUsuarios = async (req, res, next) => {
  try {
    // Parâmetros de paginação e filtros
    const { page = 1, limit = 10, search = '', sort = 'nome', order = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    
    // Construir consulta com filtro de busca
    let query = `
      SELECT 
        u.id, u.nome, u.email, u.telefone, u.empresa, u.cargo, 
        p.tipo as perfil, u.ativo, u.created_at, u.updated_at
      FROM cad_emp_user u
      JOIN perfil_acesso p ON u.perfil_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Adicionar filtro de busca se fornecido
    if (search) {
      query += ` AND (u.nome ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    // Verificar se o campo de ordenação é válido
    const validSortFields = ['nome', 'email', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'nome';
    
    // Verificar se a direção é válida
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Adicionar ordenação
    query += ` ORDER BY u.${sortField} ${sortOrder}`;
    
    // Adicionar paginação
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    // Executar consulta
    const result = await db.query(query, params);
    
    // Contar total de registros
    const countResult = await db.query(`
      SELECT COUNT(*) AS total
      FROM cad_emp_user u
      JOIN perfil_acesso p ON u.perfil_id = p.id
      WHERE 1=1
      ${search ? ` AND (u.nome ILIKE $1 OR u.email ILIKE $1)` : ''}
    `, search ? [`%${search}%`] : []);
    
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
    next(error);
  }
};

// Obter detalhes de um usuário
const obterUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário tem permissão
    if (req.user.perfil !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Buscar usuário
    const result = await db.query(`
      SELECT 
        u.id, u.nome, u.email, u.telefone, u.empresa, u.cargo, 
        p.tipo as perfil, u.ativo, u.created_at, u.updated_at
      FROM cad_emp_user u
      JOIN perfil_acesso p ON u.perfil_id = p.id
      WHERE u.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    return res.status(200).json(result.rows[0]);
    
  } catch (error) {
    next(error);
  }
};

// Criar novo usuário (admin apenas)
const criarUsuario = async (req, res, next) => {
  try {
    const { nome, email, telefone, empresa, cargo, perfil } = req.body;
    
    // Iniciar transação
    await db.transaction(async (client) => {
      // Verificar perfil
      let perfilQuery;
      if (perfil) {
        perfilQuery = await client.query(
          'SELECT id FROM perfil_acesso WHERE tipo = $1',
          [perfil]
        );
      } else {
        perfilQuery = await client.query(
          "SELECT id FROM perfil_acesso WHERE tipo = 'user'"
        );
      }
      
      if (perfilQuery.rows.length === 0) {
        throw new Error('Perfil não encontrado');
      }
      
      const perfilId = perfilQuery.rows[0].id;
      
      // Criar o auth_id (em uma implementação real, seria o ID do usuário no Supabase Auth)
      const authId = uuidv4();
      
      // Inserir o usuário
      const result = await client.query(`
        INSERT INTO cad_emp_user (
          nome, email, telefone, empresa, cargo, perfil_id, auth_id, ativo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        RETURNING id, nome, email, telefone, empresa, cargo, created_at
      `, [
        nome,
        email,
        telefone || null,
        empresa || null,
        cargo || null,
        perfilId,
        authId
      ]);
      
      // Buscar informações completas do usuário
      const usuarioCompleto = await client.query(`
        SELECT 
          u.id, u.nome, u.email, u.telefone, u.empresa, u.cargo, 
          p.tipo as perfil, u.ativo, u.created_at
        FROM cad_emp_user u
        JOIN perfil_acesso p ON u.perfil_id = p.id
        WHERE u.id = $1
      `, [result.rows[0].id]);
      
      return res.status(201).json(usuarioCompleto.rows[0]);
    });
    
  } catch (error) {
    // Verificar se é erro de violação de chave única
    if (error.code === '23505' && error.constraint === 'cad_emp_user_email_key') {
      return res.status(409).json({ error: 'Email já está em uso' });
    }
    
    next(error);
  }
};

// Atualizar usuário
const atualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, telefone, empresa, cargo, perfil, ativo } = req.body;
    
    // Verificar permissões
    // Apenas admin pode mudar perfil ou status ativo
    if (req.user.perfil !== 'admin' && (perfil || ativo !== undefined)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Usuários comuns só podem editar seus próprios dados
    if (req.user.perfil !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Iniciar transação
    await db.transaction(async (client) => {
      // Verificar se o usuário existe
      const userCheck = await client.query(
        'SELECT id FROM cad_emp_user WHERE id = $1',
        [id]
      );
      
      if (userCheck.rows.length === 0) {
        throw { statusCode: 404, message: 'Usuário não encontrado' };
      }
      
      // Preparar campos para atualização
      const updates = [];
      const params = [];
      
      if (nome) {
        updates.push(`nome = $${params.length + 1}`);
        params.push(nome);
      }
      
      if (telefone !== undefined) {
        updates.push(`telefone = $${params.length + 1}`);
        params.push(telefone);
      }
      
      if (empresa !== undefined) {
        updates.push(`empresa = $${params.length + 1}`);
        params.push(empresa);
      }
      
      if (cargo !== undefined) {
        updates.push(`cargo = $${params.length + 1}`);
        params.push(cargo);
      }
      
      if (ativo !== undefined && req.user.perfil === 'admin') {
        updates.push(`ativo = $${params.length + 1}`);
        params.push(ativo);
      }
      
      // Verificar perfil
      let perfilId = null;
      if (perfil && req.user.perfil === 'admin') {
        const perfilQuery = await client.query(
          'SELECT id FROM perfil_acesso WHERE tipo = $1',
          [perfil]
        );
        
        if (perfilQuery.rows.length === 0) {
          throw { statusCode: 400, message: 'Perfil não encontrado' };
        }
        
        perfilId = perfilQuery.rows[0].id;
        updates.push(`perfil_id = $${params.length + 1}`);
        params.push(perfilId);
      }
      
      // Atualizar timestamp
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Se não há nada para atualizar
      if (updates.length === 0) {
        throw { statusCode: 400, message: 'Nenhum campo para atualizar' };
      }
      
      // Montar query
      const query = `
        UPDATE cad_emp_user 
        SET ${updates.join(', ')}
        WHERE id = $${params.length + 1}
      `;
      
      params.push(id);
      
      // Executar atualização
      await client.query(query, params);
      
      // Buscar usuário atualizado
      const result = await client.query(`
        SELECT 
          u.id, u.nome, u.email, u.telefone, u.empresa, u.cargo, 
          p.tipo as perfil, u.ativo, u.created_at, u.updated_at
        FROM cad_emp_user u
        JOIN perfil_acesso p ON u.perfil_id = p.id
        WHERE u.id = $1
      `, [id]);
      
      return res.status(200).json(result.rows[0]);
    });
    
  } catch (error) {
    next(error);
  }
};

// Excluir usuário (admin apenas)
const excluirUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userCheck = await db.query(
      'SELECT id FROM cad_emp_user WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Em vez de excluir fisicamente, desativar o usuário
    await db.query(`
      UPDATE cad_emp_user 
      SET ativo = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);
    
    return res.status(200).json({ message: 'Usuário desativado com sucesso' });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarUsuarios,
  obterUsuario,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario
};
