/**
 * Controller de autenticação
 * Gerencia login, registro e gerenciamento de tokens
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');

// Login de usuário
const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    
    // Verificar se o usuário existe
    const result = await db.query(`
      SELECT 
        id, 
        email, 
        name,
        password_hash,
        role
      FROM users
      WHERE email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const user = result.rows[0];
    
    // Verificar a senha com bcrypt
    const senhaCorreta = await bcrypt.compare(senha, user.password_hash);
    
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        nome: user.name, 
        perfil: user.role 
      },
      process.env.JWT_SECRET || 'valeterm-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Retornar dados do usuário e token
    return res.status(200).json({
      user: {
        id: user.id,
        nome: user.name,
        email: user.email,
        perfil: user.role
      },
      token
    });
    
  } catch (error) {
    next(error);
  }
};

// Obter informações do usuário autenticado
const me = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Buscar dados atualizados do usuário
    const result = await db.query(`
      SELECT 
        id, 
        name, 
        email, 
        role,
        company
      FROM users
      WHERE id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    return res.status(200).json({
      id: result.rows[0].id,
      nome: result.rows[0].name,
      email: result.rows[0].email,
      perfil: result.rows[0].role,
      empresa: result.rows[0].company
    });
    
  } catch (error) {
    next(error);
  }
};

// Registrar novo usuário
const register = async (req, res, next) => {
  try {
    const { nome, email, senha, empresa } = req.body;
    
    // Verificar se o email já está em uso
    const emailCheck = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }
    
    // Gerar hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    // Inserir o usuário na tabela users
    const result = await db.query(`
      INSERT INTO users (
        name, email, password_hash, role, company, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, email, role
    `, [
      nome,
      email,
      senhaHash,
      'user',
      empresa || null
    ]);
    
    const newUser = result.rows[0];
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        nome: newUser.name, 
        perfil: newUser.role 
      },
      process.env.JWT_SECRET || 'valeterm-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Retornar dados do usuário e token
    return res.status(201).json({
      user: {
        id: newUser.id,
        nome: newUser.name,
        email: newUser.email,
        perfil: newUser.role
      },
      token
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  me,
  register
};
