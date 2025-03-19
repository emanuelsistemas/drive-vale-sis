/**
 * Rotas de usuários
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { isAdmin } = require('../middlewares/auth');

// Listar todos os usuários (admin)
router.get('/', isAdmin, usuariosController.listarUsuarios);

// Obter usuário por ID
router.get('/:id', param('id').isUUID().withMessage('ID inválido'), usuariosController.obterUsuario);

// Criar usuário (admin)
router.post(
  '/',
  isAdmin,
  [
    body('nome').not().isEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('perfil').optional().isIn(['admin', 'user']).withMessage('Perfil inválido')
  ],
  usuariosController.criarUsuario
);

// Atualizar usuário
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID inválido'),
    body('nome').optional().not().isEmpty().withMessage('Nome não pode ser vazio'),
    body('perfil').optional().isIn(['admin', 'user']).withMessage('Perfil inválido'),
    body('ativo').optional().isBoolean().withMessage('Ativo deve ser booleano')
  ],
  usuariosController.atualizarUsuario
);

// Excluir usuário (admin)
router.delete(
  '/:id',
  isAdmin,
  param('id').isUUID().withMessage('ID inválido'),
  usuariosController.excluirUsuario
);

module.exports = router;
