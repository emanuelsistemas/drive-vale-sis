/**
 * Rotas de cadastro de usuários
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const cadastroController = require('../controllers/cadastroController');
const { authenticateJWT, isAdmin } = require('../middlewares/auth');

// Rota pública para testar conexão
router.get('/testar-conexao', cadastroController.testarConexao);

// Middleware de autenticação para as rotas protegidas
router.use(authenticateJWT);

// Listar todos os cadastros (admin)
router.get('/', isAdmin, cadastroController.listarCadastros);

// Obter cadastro por ID
router.get('/:id', param('id').isInt().withMessage('ID inválido'), cadastroController.obterCadastro);

// Criar cadastro (admin)
router.post(
  '/',
  isAdmin,
  [
    body('name').not().isEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Perfil inválido')
  ],
  cadastroController.criarCadastro
);

// Atualizar cadastro
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID inválido'),
    body('name').optional().not().isEmpty().withMessage('Nome não pode ser vazio'),
    body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Perfil inválido')
  ],
  cadastroController.atualizarCadastro
);

// Excluir cadastro (admin)
router.delete(
  '/:id',
  isAdmin,
  param('id').isInt().withMessage('ID inválido'),
  cadastroController.excluirCadastro
);

module.exports = router;
