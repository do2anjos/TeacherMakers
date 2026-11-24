const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const logger = require('../config/logger');
const userModel = require('../models/userModel');

const backendRoot = path.resolve(__dirname, '../..');
const optionIds = ['A', 'B', 'C', 'D'];
let lastConfigurationLogSignature = null;

function logConfigurationState(level, state, details = {}) {
  const record = {
    environment: process.env.NODE_ENV || 'development',
    configuredFile: Boolean(process.env.DIAGNOSTIC_QUESTIONS_FILE),
    draftAuthorizationEnabled: process.env.DIAGNOSTIC_ALLOW_DRAFT_CONTENT === 'true',
    state,
    ...details
  };
  const signature = JSON.stringify(record);
  if (signature === lastConfigurationLogSignature) return;
  lastConfigurationLogSignature = signature;
  logger[level]('diagnostic_content_configuration', record);
}

function configurationError(code, message) {
  const error = new Error(message);
  error.status = 503;
  error.code = code;
  return error;
}

function validateQuestionBank(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content) ||
      !content.metadata || typeof content.metadata !== 'object' ||
      !['approved', 'draft'].includes(content.metadata.status) ||
      typeof content.metadata.version !== 'string' || !content.metadata.version.trim() ||
      !Array.isArray(content.questions) || content.questions.length !== 10) {
    throw configurationError('DIAGNOSTIC_CONTENT_INVALID', 'O banco do pré-teste precisa declarar status, versão e exatamente dez questões.');
  }

  const questionIds = new Set();
  const prompts = new Set();
  for (const question of content.questions) {
    const normalizedPrompt = typeof question.prompt === 'string' ? question.prompt.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR') : '';
    if (!question.id || typeof question.id !== 'string' || questionIds.has(question.id) || !normalizedPrompt || prompts.has(normalizedPrompt) ||
        !Array.isArray(question.options) || question.options.length !== 4) {
      throw configurationError('DIAGNOSTIC_CONTENT_INVALID', 'O banco do pré-teste contém enunciados, identificadores ou alternativas inválidos.');
    }

    const ids = question.options.map((option) => option?.id);
    if (new Set(ids).size !== 4 || optionIds.some((id) => !ids.includes(id)) ||
        question.options.some((option) => typeof option.label !== 'string' || !option.label.trim()) ||
        typeof question.correctOptionId !== 'string' || ids.filter((id) => id === question.correctOptionId).length !== 1) {
      throw configurationError('DIAGNOSTIC_CONTENT_INVALID', 'Cada questão deve conter as alternativas A, B, C e D e uma única resposta correta válida.');
    }
    questionIds.add(question.id);
    prompts.add(normalizedPrompt);
  }

  return content;
}

function loadQuestionBank() {
  const configuredFile = process.env.DIAGNOSTIC_QUESTIONS_FILE;
  if (!configuredFile || !configuredFile.trim()) {
    logConfigurationState('warn', 'not_configured', { code: 'DIAGNOSTIC_CONTENT_NOT_CONFIGURED' });
    throw configurationError('DIAGNOSTIC_CONTENT_NOT_CONFIGURED', 'O pré-teste está indisponível porque o banco de questões não foi configurado.');
  }

  const filename = path.isAbsolute(configuredFile)
    ? path.normalize(configuredFile)
    : path.resolve(backendRoot, configuredFile);
  if (path.extname(filename).toLowerCase() !== '.json') {
    throw configurationError('DIAGNOSTIC_CONTENT_INVALID', 'O arquivo configurado para o pré-teste precisa estar no formato JSON.');
  }

  let raw;
  try {
    fs.accessSync(filename, fs.constants.R_OK);
    raw = fs.readFileSync(filename, 'utf8');
  } catch (cause) {
    const code = cause.code === 'ENOENT' ? 'DIAGNOSTIC_CONTENT_FILE_NOT_FOUND' : 'DIAGNOSTIC_CONTENT_UNREADABLE';
    logConfigurationState('warn', 'file_unavailable', { code });
    const message = cause.code === 'ENOENT'
      ? 'O arquivo configurado para o pré-teste não foi encontrado.'
      : 'O arquivo configurado para o pré-teste não pode ser lido.';
    throw configurationError(code, message);
  }

  let content;
  try {
    content = JSON.parse(raw);
  } catch (_) {
    logConfigurationState('warn', 'invalid_json', { code: 'DIAGNOSTIC_CONTENT_JSON_INVALID' });
    throw configurationError('DIAGNOSTIC_CONTENT_JSON_INVALID', 'O arquivo configurado para o pré-teste contém JSON inválido.');
  }
  try {
    content = validateQuestionBank(content);
  } catch (error) {
    logConfigurationState('warn', 'invalid_contract', { code: error.code || 'DIAGNOSTIC_CONTENT_INVALID' });
    throw error;
  }

  if (content.metadata.status === 'draft') {
    if (process.env.NODE_ENV === 'production') {
      logConfigurationState('error', 'draft_blocked_in_production', {
        code: 'DIAGNOSTIC_DRAFT_BLOCKED_IN_PRODUCTION', version: content.metadata.version
      });
      throw configurationError('DIAGNOSTIC_DRAFT_BLOCKED_IN_PRODUCTION', 'O conteúdo diagnóstico em rascunho está bloqueado em produção.');
    }
    if (process.env.NODE_ENV !== 'development' || process.env.DIAGNOSTIC_ALLOW_DRAFT_CONTENT !== 'true') {
      logConfigurationState('warn', 'draft_not_authorized', { version: content.metadata.version });
      throw configurationError('DIAGNOSTIC_DRAFT_NOT_AUTHORIZED', 'O banco de questões está em rascunho e requer autorização explícita em ambiente de desenvolvimento.');
    }
  }

  logConfigurationState(content.metadata.status === 'draft' ? 'warn' : 'info', 'loaded', {
    contentStatus: content.metadata.status,
    version: content.metadata.version,
    questionCount: content.questions.length
  });
  return content;
}

function versionMismatch() {
  const error = new Error('A tentativa foi iniciada com outra versão do pré-teste. Contate a equipe responsável para preservar as respostas.');
  error.status = 409;
  error.code = 'DIAGNOSTIC_CONTENT_VERSION_MISMATCH';
  return error;
}

async function requireActiveUserId(userId) {
  const normalizedId = Number(userId);
  if (!Number.isSafeInteger(normalizedId) || normalizedId <= 0 || !(await userModel.findById(normalizedId))) {
    const error = new Error('Sess\u00e3o inv\u00e1lida. Fa\u00e7a login novamente.');
    error.status = 401;
    error.code = 'DIAGNOSTIC_USER_INVALID';
    throw error;
  }
  return normalizedId;
}

function assertAttemptBelongsToUser(attempt, userId) {
  if (!attempt || !Number.isSafeInteger(Number(attempt.id)) || Number(attempt.usuario_id) !== userId ||
      !['in_progress', 'completed'].includes(attempt.status)) {
    const error = new Error('N\u00e3o foi poss\u00edvel recuperar a tentativa diagn\u00f3stica deste perfil.');
    error.status = 500;
    error.code = 'DIAGNOSTIC_ATTEMPT_INCONSISTENT';
    throw error;
  }
  return attempt;
}

const diagnosticService = {
  initialize: async () => {
    try {
      const bank = loadQuestionBank();
      return { available: true, status: bank.metadata.status, version: bank.metadata.version, questionCount: bank.questions.length };
    } catch (error) {
      if (error.code === 'DIAGNOSTIC_CONTENT_NOT_CONFIGURED' || error.code === 'DIAGNOSTIC_CONTENT_FILE_NOT_FOUND' ||
          error.code === 'DIAGNOSTIC_CONTENT_UNREADABLE' || error.code === 'DIAGNOSTIC_CONTENT_JSON_INVALID' ||
          error.code === 'DIAGNOSTIC_CONTENT_INVALID' || error.code === 'DIAGNOSTIC_DRAFT_NOT_AUTHORIZED' ||
          error.code === 'DIAGNOSTIC_DRAFT_BLOCKED_IN_PRODUCTION') {
        return { available: false, code: error.code };
      }
      throw error;
    }
  },

  getForUser: async (userId) => {
    userId = await requireActiveUserId(userId);
    const bank = loadQuestionBank();
    let attempt = await queryGet(db, "SELECT * FROM diagnosticos WHERE usuario_id = ? AND tipo = 'pre'", [userId]);
    if (!attempt) {
      attempt = await db.withTransaction(async (tx) => {
        await tx.run("INSERT OR IGNORE INTO diagnosticos (usuario_id, tipo, pontuacao, total_questoes, status, data_inicio, versao_conteudo) VALUES (?, 'pre', NULL, 10, 'in_progress', CURRENT_TIMESTAMP, ?)", [userId, bank.metadata.version]);
        return tx.get("SELECT * FROM diagnosticos WHERE usuario_id = ? AND tipo = 'pre'", [userId]);
      });
    } else if (attempt.versao_conteudo && attempt.versao_conteudo !== bank.metadata.version) {
      throw versionMismatch();
    } else if (!attempt.versao_conteudo && attempt.status === 'in_progress') {
      attempt = await db.withTransaction(async (tx) => {
        await tx.run('UPDATE diagnosticos SET versao_conteudo = ? WHERE id = ? AND versao_conteudo IS NULL', [bank.metadata.version, attempt.id]);
        return tx.get('SELECT * FROM diagnosticos WHERE id = ? AND usuario_id = ?', [attempt.id, userId]);
      });
    }
    attempt = assertAttemptBelongsToUser(attempt, userId);

    const answers = await queryAll(db, 'SELECT questao_codigo, resposta FROM respostas_diagnostico WHERE diagnostico_id = ?', [attempt.id]);
    return {
      attemptId: attempt.id,
      status: attempt.status,
      versaoConteudo: attempt.versao_conteudo || null,
      pontuacao: attempt.status === 'completed' ? attempt.pontuacao : null,
      totalQuestoes: 10,
      answers: Object.fromEntries(answers.map((answer) => [answer.questao_codigo, answer.resposta])),
      questions: attempt.status === 'completed' ? [] : bank.questions.map(({ id, prompt, options }) => ({ id, prompt, options }))
    };
  },

  submit: async (userId, submittedAnswers) => {
    userId = await requireActiveUserId(userId);
    const bank = loadQuestionBank();
    const questions = bank.questions;
    if (!Array.isArray(submittedAnswers) || submittedAnswers.length !== 10) {
      const error = new Error('Responda às 10 questões antes de concluir o pré-teste.'); error.status = 422; throw error;
    }
    const answerMap = new Map();
    for (const answer of submittedAnswers) {
      if (!answer?.questionId || !answer?.optionId || answerMap.has(answer.questionId)) {
        const error = new Error('As respostas do pré-teste são inválidas ou duplicadas.'); error.status = 422; throw error;
      }
      answerMap.set(answer.questionId, answer.optionId);
    }
    if (questions.some((question) => !answerMap.has(question.id))) {
      const error = new Error('É necessário responder a todas as questões.'); error.status = 422; throw error;
    }
    for (const question of questions) {
      if (!question.options.some((option) => option.id === answerMap.get(question.id))) {
        const error = new Error('Uma ou mais alternativas não pertencem às questões apresentadas.'); error.status = 422; throw error;
      }
    }

    return db.withTransaction(async (tx) => {
      await tx.run("INSERT OR IGNORE INTO diagnosticos (usuario_id, tipo, pontuacao, total_questoes, status, data_inicio, versao_conteudo) VALUES (?, 'pre', NULL, 10, 'in_progress', CURRENT_TIMESTAMP, ?)", [userId, bank.metadata.version]);
      const attempt = assertAttemptBelongsToUser(await tx.get("SELECT * FROM diagnosticos WHERE usuario_id = ? AND tipo = 'pre'", [userId]), userId);
      if (attempt.status === 'completed') { const error = new Error('O pré-teste deste perfil já foi concluído.'); error.status = 409; throw error; }
      if (attempt.versao_conteudo && attempt.versao_conteudo !== bank.metadata.version) throw versionMismatch();
      if (!attempt.versao_conteudo) {
        await tx.run('UPDATE diagnosticos SET versao_conteudo = ? WHERE id = ?', [bank.metadata.version, attempt.id]);
      }
      let score = 0;
      for (const question of questions) {
        const selected = answerMap.get(question.id);
        const correct = selected === question.correctOptionId;
        score += correct ? 1 : 0;
        await tx.run(`
          INSERT INTO respostas_diagnostico (diagnostico_id, questao_codigo, resposta, correta)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(diagnostico_id, questao_codigo) DO UPDATE SET resposta = excluded.resposta, correta = excluded.correta
        `, [attempt.id, question.id, selected, correct ? 1 : 0]);
      }
      await tx.run("UPDATE diagnosticos SET pontuacao = ?, status = 'completed', data_conclusao = CURRENT_TIMESTAMP WHERE id = ?", [score, attempt.id]);
      return { attemptId: attempt.id, versaoConteudo: bank.metadata.version, pontuacao: score, totalQuestoes: 10, percentual: score * 10, status: 'completed' };
    });
  }
};

function queryGet(executor, sql, params) {
  return new Promise((resolve, reject) => executor.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function queryAll(executor, sql, params) {
  return new Promise((resolve, reject) => executor.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

module.exports = diagnosticService;
module.exports.loadQuestionBank = loadQuestionBank;
module.exports.validateQuestionBank = validateQuestionBank;
