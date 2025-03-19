/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido e define o usuário na requisição
 */

const jwt = require('jsonwebtoken');

// Middleware para verificar JWT
const authenticateJWT = (req, res, next) => {
  // Obter o token do header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }
  
  // Formato esperado: "Bearer TOKEN"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }
  
  const [scheme, token] = parts;
  
  // Verificar se começa com "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }
  
  // Verificar o token
  jwt.verify(token, process.env.JWT_SECRET || 'valeterm-secret-key', (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Definir o usuário na requisição
    req.user = decoded;
    
    return next();
  });
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  if (req.user.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso permitido apenas para administradores' });
  }
  
  next();
};

module.exports = {
  authenticateJWT,
  isAdmin
};
