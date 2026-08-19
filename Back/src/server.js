require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const errorHandler = require('./middlewares/errorHandler');
const { swaggerUi, specs } = require('./config/swagger');
const { initDatabase } = require('./config/database');

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

app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));

app.get('/health', (req, res) => {
  res.status(200).json({ sucesso: true, mensagem: 'API TeacherMakers operante!' });
});

app.use((req, res, next) => {
  const erro = new Error(`Rota não encontrada: ${req.originalUrl}`);
  erro.status = 404;
  next(erro);
});

app.use(errorHandler);

initDatabase().then(() => {
  app.listen(port, () => {
    logger.info(`Servidor rodando na porta ${port}`);
    logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  logger.error('Failed to start server due to database initialization error:', err);
  process.exit(1);
});
