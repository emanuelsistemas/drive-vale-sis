/**
 * Rotas de compartilhamentos
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const compartilhamentosController = require('../controllers/compartilhamentosController');

// Listar compartilhamentos criados pelo usuário
router.get('/criados', compartilhamentosController.listarCompartilhamentosCriados);

// Listar compartilhamentos recebidos pelo usuário
router.get('/recebidos', compartilhamentosController.listarCompartilhamentosRecebidos);

// Criar compartilhamento
router.post(
  '/',
  [
    body('arquivo_id').isUUID().withMessage('ID de arquivo inválido'),
    body('destinatario_id').isUUID().withMessage('ID de destinatário inválido'),
    body('permissao').optional().isIn(['visualizar', 'editar']).withMessage('Permissão inválida')
  ],
  compartilhamentosController.criarCompartilhamento
);

// Atualizar compartilhamento
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID inválido'),
    body('permissao').isIn(['visualizar', 'editar']).withMessage('Permissão inválida')
  ],
  compartilhamentosController.atualizarCompartilhamento
);

// Excluir compartilhamento
router.delete(
  '/:id',
  param('id').isUUID().withMessage('ID inválido'),
  compartilhamentosController.excluirCompartilhamento
);

module.exports = router;
