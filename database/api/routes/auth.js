/**
 * Rotas de autenticação
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/auth');

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
  ],
  authController.login
);

// Registro
router.post(
  '/register',
  [
    body('nome').not().isEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
  ],
  authController.register
);

// Informações do usuário autenticado
router.get('/me', authenticateJWT, authController.me);

module.exports = router;
