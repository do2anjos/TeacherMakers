const responseHelper = require('../utils/responseHelper');

const SAFE_DIAGNOSTIC_MESSAGES = {
  DIAGNOSTIC_USER_INVALID: 'Sua sess\u00e3o n\u00e3o corresponde a uma conta ativa. Fa\u00e7a login novamente.',
  DIAGNOSTIC_ATTEMPT_INCONSISTENT: 'N\u00e3o foi poss\u00edvel recuperar uma tentativa diagn\u00f3stica consistente.',
  DIAGNOSTIC_CONTENT_NOT_CONFIGURED: 'Pré-teste indisponível: o banco de questões não foi configurado.',
  DIAGNOSTIC_CONTENT_FILE_NOT_FOUND: 'Pré-teste indisponível: o arquivo configurado não foi encontrado.',
  DIAGNOSTIC_CONTENT_UNREADABLE: 'Pré-teste indisponível: não foi possível ler o arquivo configurado.',
  DIAGNOSTIC_CONTENT_JSON_INVALID: 'Pré-teste indisponível: o arquivo configurado contém JSON inválido.',
  DIAGNOSTIC_CONTENT_INVALID: 'Pré-teste indisponível: o banco de questões configurado é inválido.',
  DIAGNOSTIC_DRAFT_NOT_AUTHORIZED: 'Pré-teste indisponível: conteúdo em rascunho exige autorização local explícita.',
  DIAGNOSTIC_DRAFT_BLOCKED_IN_PRODUCTION: 'Pré-teste indisponível: conteúdo em rascunho não pode ser usado em produção.'
};

function errorHandler(erro, req, res, next) {
  const status = erro.status || 500;
  const isDiagnosticConfigurationError = typeof erro.code === 'string' &&
    (erro.code.startsWith('DIAGNOSTIC_CONTENT_') || erro.code.startsWith('DIAGNOSTIC_DRAFT_'));
  const safeClientMessage = SAFE_DIAGNOSTIC_MESSAGES[erro.code] ||
    (status >= 500 ? 'Erro interno do servidor.' : (erro.message || 'Solicitação inválida.'));
  req.requestError = {
    name: erro.name || 'Error',
    code: erro.code || undefined,
    message: status >= 500 ? 'Internal server error' : safeClientMessage,
    ...(status >= 500 && erro.stack && !isDiagnosticConfigurationError ? { stack: erro.stack } : {})
  };

  return responseHelper.erro(res, safeClientMessage, status);
}

module.exports = errorHandler;
