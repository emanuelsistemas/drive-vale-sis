/**
 * Middleware de tratamento de erros
 * Fornece uma resposta consistente para todos os erros da aplicação
 */

const errorHandler = (err, req, res, next) => {
  console.error(`[Erro ${req.id}]`, err);
  
  // Verificar se é um erro conhecido
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      requestId: req.id
    });
  }
  
  // Erros do PostgreSQL
  if (err.code && err.code.startsWith('23')) {
    // Códigos de erro de violação de integridade
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Registro duplicado',
        detail: err.detail,
        requestId: req.id
      });
    }
    
    return res.status(400).json({
      error: 'Erro de validação no banco de dados',
      detail: err.detail,
      requestId: req.id
    });
  }
  
  // Erro interno do servidor
  return res.status(500).json({
    error: 'Erro interno do servidor',
    requestId: req.id
  });
};

module.exports = errorHandler;
