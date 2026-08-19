const jwt = require('jsonwebtoken');
const responseHelper = require('../utils/responseHelper');
const logger = require('../config/logger');

function authMiddleware(req, res, next) {
  if (!process.env.JWT_SECRET) {
    logger.error('CRITICAL: JWT_SECRET não está definido no ambiente!');
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn(`Tentativa de acesso sem token: ${req.originalUrl}`);
    return responseHelper.erro(res, 'Acesso negado. Token não fornecido.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (erro) {
    logger.error(`Token inválido ou expirado: ${erro.message}`);
    return responseHelper.erro(res, 'Token inválido ou expirado.', 401);
  }
}

module.exports = authMiddleware;
