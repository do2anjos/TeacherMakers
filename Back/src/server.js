const { initDatabase } = require('./config/database');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const errorHandler = require('./middlewares/errorHandler');
const { swaggerUi, specs } = require('./config/swagger');
const diagnosticService = require('./services/diagnosticService');
const crypto = require('crypto');

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedPatterns = [
      /^https:\/\/.*\.onrender\.com$/,
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));

    if (isAllowed || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: { sucesso: false, erro: 'Muitas requisições deste IP. Tente novamente mais tarde.' }
});
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(require('./config/storage').uploadsDir, { fallthrough: false }));

app.use((req, res, next) => {
  const suppliedId = req.get('x-request-id');
  req.requestId = suppliedId && /^[\w.-]{1,80}$/.test(suppliedId) ? suppliedId : crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  const requestPath = req.originalUrl.split('?')[0] || '/';
  const startedAt = process.hrtime.bigint();
  let logged = false;
  const logCompletion = () => {
    if (logged) return;
    logged = true;
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.info('http_request', {
      requestId: req.requestId,
      method: req.method,
      path: requestPath,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ...(req.requestError ? { error: req.requestError } : {})
    });
  };
  res.once('finish', logCompletion);
  res.once('close', logCompletion);
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/diagnostic', require('./routes/diagnosticRoutes'));

app.get('/health', (req, res) => {
  res.status(200).json({ sucesso: true, mensagem: 'API TeacherMakers operante!' });
});

app.use((req, res, next) => {
  const erro = new Error(`Rota não encontrada: ${req.originalUrl}`);
  erro.status = 404;
  next(erro);
});

app.use(errorHandler);

if (require.main === module) {
  logger.info('runtime_environment', {
    environment: process.env.NODE_ENV || 'development',
    diagnosticQuestionsConfigured: Boolean(process.env.DIAGNOSTIC_QUESTIONS_FILE),
    draftAuthorizationEnabled: process.env.DIAGNOSTIC_ALLOW_DRAFT_CONTENT === 'true'
  });
  let httpServer;
  const shutdownAfterFatalError = (event, error) => {
    logger.error(event, {
      name: error?.name || 'Error',
      message: error?.message || String(error),
      stack: error?.stack
    });
    if (httpServer) httpServer.close(() => process.exit(1));
    else process.exit(1);
  };
  process.on('unhandledRejection', (reason) => shutdownAfterFatalError('unhandled_rejection', reason));
  process.on('uncaughtException', (error) => shutdownAfterFatalError('uncaught_exception', error));

  initDatabase().then(async () => {
    await diagnosticService.initialize();
    await require('./services/progressService').reconciliarArquivosOrfaos().catch((err) => {
      logger.warn('orphan_reconciliation_warning', { error: err?.message || String(err) });
    });
    httpServer = app.listen(port, () => {
      logger.info(`Servidor rodando na porta ${port}`);
      logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`);
    });
    httpServer.once('error', (error) => shutdownAfterFatalError('http_server_error', error));
  }).catch(err => {
    logger.error('Failed to start server due to database initialization error:', err);
    process.exit(1);
  });
}

module.exports = app;
