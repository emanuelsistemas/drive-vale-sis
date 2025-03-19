/**
 * Rotas de arquivos
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const arquivosController = require('../controllers/arquivosController');

// Listar arquivos do usuário
router.get('/', arquivosController.listarArquivos);

// Obter arquivo por ID
router.get(
  '/:id',
  param('id').isUUID().withMessage('ID inválido'),
  arquivosController.obterArquivo
);

// Criar arquivo
router.post(
  '/',
  [
    body('nome').not().isEmpty().withMessage('Nome é obrigatório'),
    body('mimetype').not().isEmpty().withMessage('Tipo MIME é obrigatório'),
    body('tamanho_bytes').isInt({ min: 0 }).withMessage('Tamanho inválido')
  ],
  arquivosController.criarArquivo
);

// Atualizar arquivo
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID inválido'),
    body('nome').optional().not().isEmpty().withMessage('Nome não pode ser vazio'),
    body('favorito').optional().isBoolean().withMessage('Favorito deve ser booleano')
  ],
  arquivosController.atualizarArquivo
);

// Excluir arquivo
router.delete(
  '/:id',
  param('id').isUUID().withMessage('ID inválido'),
  arquivosController.excluirArquivo
);

// Registrar download
router.post(
  '/:id/download',
  param('id').isUUID().withMessage('ID inválido'),
  arquivosController.registrarDownload
);

module.exports = router;
