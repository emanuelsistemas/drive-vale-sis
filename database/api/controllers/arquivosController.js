/**
 * Controller de arquivos
 * Gerencia operações CRUD para arquivos
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

// Listar arquivos do usuário
const listarArquivos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, search = '', categoria = '', sort = 'nome', order = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    
    // Construir consulta base
    let query = `
      SELECT 
        a.id, a.nome, a.descricao, a.mimetype, a.tamanho_bytes, a.pasta,
        a.favorito, a.visualizacoes, a.downloads, a.versao,
        c.id as categoria_id, c.nome as categoria_nome, c.cor as categoria_cor,
        a.created_at, a.updated_at
      FROM arquivo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      WHERE a.usuario_id = $1
    `;
    
    const params = [userId];
    
    // Adicionar filtro de busca se fornecido
    if (search) {
      query += ` AND (a.nome ILIKE $${params.length + 1} OR a.descricao ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    // Filtrar por categoria
    if (categoria) {
      query += ` AND c.id = $${params.length + 1}`;
      params.push(categoria);
    }
    
    // Verificar se o campo de ordenação é válido
    const validSortFields = ['nome', 'tamanho_bytes', 'visualizacoes', 'downloads', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'nome';
    
    // Verificar se a direção é válida
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Adicionar ordenação
    query += ` ORDER BY a.${sortField} ${sortOrder}`;
    
    // Adicionar paginação
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    // Executar consulta
    const result = await db.query(query, params);
    
    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM arquivo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      WHERE a.usuario_id = $1
      ${search ? ` AND (a.nome ILIKE $2 OR a.descricao ILIKE $2)` : ''}
      ${categoria && search ? ` AND c.id = $3` : categoria ? ` AND c.id = $2` : ''}
    `;
    
    const countParams = [userId];
    if (search) countParams.push(`%${search}%`);
    if (categoria) countParams.push(categoria);
    
    const countResult = await db.query(countQuery, countParams);
    
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

// Obter detalhes de um arquivo
const obterArquivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar acesso ao arquivo (próprio ou compartilhado)
    let query = `
      SELECT 
        a.id, a.nome, a.descricao, a.mimetype, a.tamanho_bytes, a.pasta,
        a.favorito, a.visualizacoes, a.downloads, a.usuario_id, a.versao,
        c.id as categoria_id, c.nome as categoria_nome, c.cor as categoria_cor,
        u.nome as usuario_nome, u.email as usuario_email,
        a.created_at, a.updated_at
      FROM arquivo a
      LEFT JOIN categoria c ON a.categoria_id = c.id
      JOIN cad_emp_user u ON a.usuario_id = u.id
      WHERE a.id = $1 AND (
        a.usuario_id = $2
        OR 
        EXISTS (
          SELECT 1 FROM compartilhamento s 
          WHERE s.arquivo_id = a.id AND s.destinatario_id = $2
        )
      )
    `;
    
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Arquivo não encontrado ou acesso negado' });
    }
    
    const arquivo = result.rows[0];
    
    // Incrementar contador de visualizações
    await db.query(
      'UPDATE arquivo SET visualizacoes = visualizacoes + 1 WHERE id = $1',
      [id]
    );
    
    // Buscar compartilhamentos
    if (arquivo.usuario_id === userId) {
      const compartilhamentos = await db.query(`
        SELECT 
          s.id, s.permissao, s.created_at,
          u.id as usuario_id, u.nome as usuario_nome, u.email as usuario_email
        FROM compartilhamento s
        JOIN cad_emp_user u ON s.destinatario_id = u.id
        WHERE s.arquivo_id = $1
      `, [id]);
      
      arquivo.compartilhamentos = compartilhamentos.rows;
    }
    
    return res.status(200).json(arquivo);
    
  } catch (error) {
    next(error);
  }
};

// Criar novo arquivo
const criarArquivo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      nome, 
      descricao, 
      mimetype, 
      tamanho_bytes, 
      pasta, 
      categoria_id, 
      favorito = false 
    } = req.body;
    
    // Iniciar transação
    await db.transaction(async (client) => {
      // Verificar categoria se fornecida
      if (categoria_id) {
        const categoriaCheck = await client.query(
          'SELECT id FROM categoria WHERE id = $1 AND (usuario_id = $2 OR publica = TRUE)',
          [categoria_id, userId]
        );
        
        if (categoriaCheck.rows.length === 0) {
          throw { statusCode: 404, message: 'Categoria não encontrada ou acesso negado' };
        }
      }
      
      // Inserir arquivo
      const result = await client.query(`
        INSERT INTO arquivo (
          id, nome, descricao, mimetype, tamanho_bytes, pasta,
          favorito, visualizacoes, downloads, usuario_id, categoria_id, versao
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, $8, $9, 1)
        RETURNING *
      `, [
        uuidv4(),
        nome,
        descricao || null,
        mimetype,
        tamanho_bytes,
        pasta || '/',
        favorito,
        userId,
        categoria_id || null
      ]);
      
      // Buscar dados completos
      const arquivo = result.rows[0];
      
      if (categoria_id) {
        const categoriaResult = await client.query(
          'SELECT id, nome, cor FROM categoria WHERE id = $1',
          [categoria_id]
        );
        
        if (categoriaResult.rows.length > 0) {
          arquivo.categoria_nome = categoriaResult.rows[0].nome;
          arquivo.categoria_cor = categoriaResult.rows[0].cor;
        }
      }
      
      return res.status(201).json(arquivo);
    });
    
  } catch (error) {
    next(error);
  }
};

// Atualizar arquivo
const atualizarArquivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { 
      nome, 
      descricao, 
      pasta, 
      categoria_id, 
      favorito 
    } = req.body;
    
    // Verificar propriedade do arquivo
    const fileCheck = await db.query(
      'SELECT id FROM arquivo WHERE id = $1 AND usuario_id = $2',
      [id, userId]
    );
    
    if (fileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Arquivo não encontrado ou acesso negado' });
    }
    
    // Iniciar transação
    await db.transaction(async (client) => {
      // Verificar categoria se fornecida
      if (categoria_id) {
        const categoriaCheck = await client.query(
          'SELECT id FROM categoria WHERE id = $1 AND (usuario_id = $2 OR publica = TRUE)',
          [categoria_id, userId]
        );
        
        if (categoriaCheck.rows.length === 0) {
          throw { statusCode: 404, message: 'Categoria não encontrada ou acesso negado' };
        }
      }
      
      // Preparar campos para atualização
      const updates = [];
      const params = [];
      
      if (nome) {
        updates.push(`nome = $${params.length + 1}`);
        params.push(nome);
      }
      
      if (descricao !== undefined) {
        updates.push(`descricao = $${params.length + 1}`);
        params.push(descricao);
      }
      
      if (pasta) {
        updates.push(`pasta = $${params.length + 1}`);
        params.push(pasta);
      }
      
      if (categoria_id !== undefined) {
        updates.push(`categoria_id = $${params.length + 1}`);
        params.push(categoria_id === null ? null : categoria_id);
      }
      
      if (favorito !== undefined) {
        updates.push(`favorito = $${params.length + 1}`);
        params.push(favorito);
      }
      
      // Atualizar timestamp
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Se não há nada para atualizar
      if (updates.length === 0) {
        throw { statusCode: 400, message: 'Nenhum campo para atualizar' };
      }
      
      // Montar query
      const query = `
        UPDATE arquivo 
        SET ${updates.join(', ')}
        WHERE id = $${params.length + 1} AND usuario_id = $${params.length + 2}
      `;
      
      params.push(id, userId);
      
      // Executar atualização
      await client.query(query, params);
      
      // Buscar arquivo atualizado
      const result = await client.query(`
        SELECT 
          a.id, a.nome, a.descricao, a.mimetype, a.tamanho_bytes, a.pasta,
          a.favorito, a.visualizacoes, a.downloads, a.versao,
          c.id as categoria_id, c.nome as categoria_nome, c.cor as categoria_cor,
          a.created_at, a.updated_at
        FROM arquivo a
        LEFT JOIN categoria c ON a.categoria_id = c.id
        WHERE a.id = $1
      `, [id]);
      
      return res.status(200).json(result.rows[0]);
    });
    
  } catch (error) {
    next(error);
  }
};

// Excluir arquivo
const excluirArquivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar propriedade do arquivo
    const fileCheck = await db.query(
      'SELECT id FROM arquivo WHERE id = $1 AND usuario_id = $2',
      [id, userId]
    );
    
    if (fileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Arquivo não encontrado ou acesso negado' });
    }
    
    // Excluir compartilhamentos primeiro
    await db.query(
      'DELETE FROM compartilhamento WHERE arquivo_id = $1',
      [id]
    );
    
    // Excluir arquivo
    await db.query(
      'DELETE FROM arquivo WHERE id = $1 AND usuario_id = $2',
      [id, userId]
    );
    
    return res.status(200).json({ message: 'Arquivo excluído com sucesso' });
    
  } catch (error) {
    next(error);
  }
};

// Registrar download
const registrarDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar acesso ao arquivo
    const fileCheck = await db.query(`
      SELECT id FROM arquivo WHERE id = $1 AND (
        usuario_id = $2
        OR 
        EXISTS (
          SELECT 1 FROM compartilhamento s 
          WHERE s.arquivo_id = id AND s.destinatario_id = $2
        )
      )
    `, [id, userId]);
    
    if (fileCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Arquivo não encontrado ou acesso negado' });
    }
    
    // Incrementar contador de downloads
    await db.query(
      'UPDATE arquivo SET downloads = downloads + 1 WHERE id = $1',
      [id]
    );
    
    return res.status(200).json({ message: 'Download registrado com sucesso' });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarArquivos,
  obterArquivo,
  criarArquivo,
  atualizarArquivo,
  excluirArquivo,
  registrarDownload
};
