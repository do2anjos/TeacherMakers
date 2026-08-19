const logger = require('../config/logger');
const responseHelper = require('../utils/responseHelper');

function errorHandler(erro, req, res, next) {
  const status = erro.status || 500;
  const mensagem = erro.message || 'Erro interno do servidor';

  logger.error(`${status} - ${mensagem} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: erro.stack
  });

  return responseHelper.erro(res, mensagem, status, erro.stack);
}

module.exports = errorHandler;
