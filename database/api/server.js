/**
 * Servidor API REST para o Drive Vale-Sis
 * Este servidor expõe endpoints para gerenciar usuários, arquivos e compartilhamentos
 */

// Carregar variáveis de ambiente
require('dotenv').config();

// Importar dependências
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

// Importar rotas
const usuariosRoutes = require('./routes/usuarios');
const arquivosRoutes = require('./routes/arquivos');
const compartilhamentosRoutes = require('./routes/compartilhamentos');
const authRoutes = require('./routes/auth');
const cadastroRoutes = require('./routes/cadastro');

// Importar middlewares
const { authenticateJWT } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

// Criar aplicação Express
const app = express();

// Configurar middlewares
app.use(helmet()); // Segurança
app.use(cors()); // Permitir cross-origin requests
app.use(express.json()); // Parsear JSON no body
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded no body
app.use(morgan('dev')); // Logging

// Adicionar ID de requisição para logging
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rota de teste de conexão (pública)
app.get('/api/cadastro/testar-conexao', (req, res, next) => {
  cadastroRoutes.stack
    .find(layer => layer.route && layer.route.path === '/testar-conexao')
    .handle(req, res, next);
});

// Middleware de autenticação para rotas protegidas
app.use('/api', authenticateJWT);

// Rotas protegidas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/arquivos', arquivosRoutes);
app.use('/api/compartilhamentos', compartilhamentosRoutes);
app.use('/api/cadastro', cadastroRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'API Drive Vale-Sis', 
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Handler para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Definir porta
const PORT = process.env.PORT || 3001;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesse http://localhost:${PORT}`);
  console.log(`🛢️ Conectando ao PostgreSQL em ${process.env.POSTGRES_HOST}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
});
