const fs = require('fs');
const os = require('os');
const path = require('path');
const { createRequire } = require('module');

const isolatedDataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'teachermakers-diagnostic-test-'));
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = isolatedDataRoot;
process.env.DATABASE_URL = path.join(isolatedDataRoot, 'diagnostic.sqlite');
process.env.JWT_SECRET = 'diagnostic-test-secret';
delete process.env.DIAGNOSTIC_QUESTIONS_FILE;
delete process.env.DIAGNOSTIC_ALLOW_DRAFT_CONTENT;

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const db = require('../../src/config/database');
const userModel = require('../../src/models/userModel');
const diagnosticService = require('../../src/services/diagnosticService');

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function(error) {
    if (error) reject(error); else resolve({ lastID: this.lastID, changes: this.changes });
  }));
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

function tokenFor(userId) {
  return jwt.sign({ id: userId, email: `diagnostic-${userId}@test.local` }, process.env.JWT_SECRET);
}

function bank(status = 'approved', version = '1.0') {
  return {
    metadata: { status, version, title: 'Synthetic test fixture' },
    questions: Array.from({ length: 10 }, (_, index) => ({
      id: `q${index + 1}`,
      prompt: `Synthetic question ${index + 1}`,
      options: ['A', 'B', 'C', 'D'].map((id) => ({ id, label: `Option ${id}` })),
      correctOptionId: 'A'
    }))
  };
}

function writeBank(name, content) {
  const filename = path.join(isolatedDataRoot, name);
  fs.writeFileSync(filename, JSON.stringify(content), 'utf8');
  return filename;
}

async function createUser(email) {
  return userModel.create({ nome: 'Conta diagnóstica sintética', email, senha: 'hash-de-teste', nivel_ensino: 'Fundamental I' });
}

async function withEnv(values, action) {
  const keys = Object.keys(values);
  const before = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === null) delete process.env[key];
    else process.env[key] = value;
  }
  try { return await action(); }
  finally {
    for (const key of keys) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
}

beforeAll(async () => db.initDatabase());

afterAll(async () => {
  await new Promise((resolve) => db.close(resolve));
  fs.rmSync(isolatedDataRoot, { recursive: true, force: true });
});

describe('configuração segura do pré-teste diagnóstico', () => {
  test('imports do servidor, authController e errorHandler resolvem sem dependência circular problemática', () => {
    const backendRoot = path.resolve(__dirname, '../..');
    const serverFile = path.join(backendRoot, 'src/server.js');
    const authFile = path.join(backendRoot, 'src/controllers/authController.js');
    const diagnosticControllerFile = path.join(backendRoot, 'src/controllers/diagnosticController.js');
    const imports = [
      [serverFile, './middlewares/errorHandler'],
      [serverFile, './routes/diagnosticRoutes'],
      [authFile, '../services/diagnosticService'],
      [diagnosticControllerFile, '../services/diagnosticService']
    ];
    for (const [importer, specifier] of imports) {
      expect(createRequire(importer).resolve(specifier)).toBeTruthy();
    }
    expect(typeof require(authFile).completeOnboarding).toBe('function');
    expect(typeof require(diagnosticControllerFile).get).toBe('function');
    expect(typeof require(path.join(backendRoot, 'src/middlewares/errorHandler'))).toBe('function');
    expect(typeof require(serverFile)).toBe('function');
  });

  test('banco draft entregue está estruturalmente válido, versionado e não aprovado', () => {
    const draftPath = path.resolve(__dirname, '../../docs/diagnostic-questions.draft.json');
    const content = diagnosticService.validateQuestionBank(JSON.parse(fs.readFileSync(draftPath, 'utf8')));
    expect(content.metadata).toMatchObject({ status: 'draft', version: '0.1', approval: 'pending' });
    expect(content.questions).toHaveLength(10);
    expect(new Set(content.questions.map((question) => question.id)).size).toBe(10);
    for (const question of content.questions) {
      expect(question.options.map((option) => option.id).sort()).toEqual(['A', 'B', 'C', 'D']);
      expect(question.options.filter((option) => option.id === question.correctOptionId)).toHaveLength(1);
    }
  });

  test('sem configuração retorna 503 e não procura rascunho nem cria tentativa', async () => {
    const user = await createUser('no-config@test.local');
    const response = await withEnv({ DIAGNOSTIC_QUESTIONS_FILE: null, DIAGNOSTIC_ALLOW_DRAFT_CONTENT: null }, () =>
      request(app).get('/api/diagnostic').set('Authorization', `Bearer ${tokenFor(user.id)}`));
    expect(response.status).toBe(503);
    expect(response.body.erro).toContain('configurado.');
    expect(response.text).not.toContain(isolatedDataRoot);
    expect(await all('SELECT * FROM diagnosticos WHERE usuario_id = ?', [user.id])).toHaveLength(0);
  });

  test('distingue arquivo inexistente de JSON invÃ¡lido sem persistir', async () => {
    const user = await createUser('file-errors@test.local');
    const auth = `Bearer ${tokenFor(user.id)}`;
    const missingPath = path.join(isolatedDataRoot, 'absent.json');
    const missing = await withEnv({ DIAGNOSTIC_QUESTIONS_FILE: missingPath }, () => request(app).get('/api/diagnostic').set('Authorization', auth));
    expect(missing.status).toBe(503);
    expect(missing.body.erro).toMatch(/arquivo configurado n.o foi encontrado/i);

    const invalidPath = path.join(isolatedDataRoot, 'invalid.json');
    fs.writeFileSync(invalidPath, '{ invalid json', 'utf8');
    const invalid = await withEnv({ DIAGNOSTIC_QUESTIONS_FILE: invalidPath }, () => request(app).get('/api/diagnostic').set('Authorization', auth));
    expect(invalid.status).toBe(503);
    expect(invalid.body.erro).toContain('JSON inv');
    expect(await all('SELECT * FROM diagnosticos WHERE usuario_id = ?', [user.id])).toHaveLength(0);
  });

  test('resolve caminho relativo a partir de Back e entrega banco aprovado sem gabarito', async () => {
    const user = await createUser('approved-bank@test.local');
    const filename = writeBank('approved.json', bank('approved', '1.3'));
    const relativeFromBack = path.relative(path.resolve(__dirname, '../..'), filename);
    const response = await withEnv({ NODE_ENV: 'test', DIAGNOSTIC_QUESTIONS_FILE: relativeFromBack }, () =>
      request(app).get('/api/diagnostic').set('Authorization', `Bearer ${tokenFor(user.id)}`));
    expect(response.status).toBe(200);
    expect(response.body.dados.questions).toHaveLength(10);
    expect(response.body.dados.questions[0].correctOptionId).toBeUndefined();
    expect(response.body.dados.questions[0].options.map((option) => option.id)).toEqual(['A', 'B', 'C', 'D']);
    expect((await all('SELECT versao_conteudo FROM diagnosticos WHERE usuario_id = ?', [user.id]))[0].versao_conteudo).toBe('1.3');
  });

  test('recusa rascunho sem opt-in e recusa-o em production mesmo com opt-in', async () => {
    const user = await createUser('blocked-draft@test.local');
    const filename = writeBank('blocked-draft.json', bank('draft', '0.1'));
    const auth = `Bearer ${tokenFor(user.id)}`;
    const unauthorized = await withEnv({ NODE_ENV: 'development', DIAGNOSTIC_QUESTIONS_FILE: filename, DIAGNOSTIC_ALLOW_DRAFT_CONTENT: null }, () =>
      request(app).get('/api/diagnostic').set('Authorization', auth));
    expect(unauthorized.status).toBe(503);
    expect(unauthorized.body.erro).toMatch(/rascunho exige autoriza/iu);

    const production = await withEnv({ NODE_ENV: 'production', DIAGNOSTIC_QUESTIONS_FILE: filename, DIAGNOSTIC_ALLOW_DRAFT_CONTENT: 'true' }, () =>
      request(app).get('/api/diagnostic').set('Authorization', auth));
    expect(production.status).toBe(503);
    expect(production.body.erro).toMatch(/rascunho n.o pode ser usado em produ/iu);
    expect(await all('SELECT * FROM diagnosticos WHERE usuario_id = ?', [user.id])).toHaveLength(0);
  });

  test('permite rascunho somente com NODE_ENV development e opt-in explícito', async () => {
    const user = await createUser('allowed-draft@test.local');
    const filename = writeBank('allowed-draft.json', bank('draft', '0.1'));
    const response = await withEnv({ NODE_ENV: 'development', DIAGNOSTIC_QUESTIONS_FILE: filename, DIAGNOSTIC_ALLOW_DRAFT_CONTENT: 'true' }, () =>
      request(app).get('/api/diagnostic').set('Authorization', `Bearer ${tokenFor(user.id)}`));
    expect(response.status).toBe(200);
    expect(response.body.dados.versaoConteudo).toBe('0.1');
    expect(response.body.dados.questions).toHaveLength(10);
    expect(response.body.dados.questions.some((question) => Object.hasOwn(question, 'correctOptionId'))).toBe(false);
  });

  test('rejeita estrutura inválida e resposta incompleta sem persistir resposta', async () => {
    const user = await createUser('invalid-content@test.local');
    const auth = `Bearer ${tokenFor(user.id)}`;
    const invalidBank = bank();
    invalidBank.questions[0].options = [{ id: 'a', label: 'Lowercase' }];
    const invalidFile = writeBank('invalid-structure.json', invalidBank);
    const invalid = await withEnv({ DIAGNOSTIC_QUESTIONS_FILE: invalidFile }, () => request(app).get('/api/diagnostic').set('Authorization', auth));
    expect(invalid.status).toBe(503);
    expect(invalid.body.erro).toMatch(/banco de quest.es configurado . inv.lido/i);

    const approvedFile = writeBank('valid-for-submit.json', bank());
    const submission = await withEnv({ DIAGNOSTIC_QUESTIONS_FILE: approvedFile }, () =>
      request(app).post('/api/diagnostic/submit').set('Authorization', auth).send({ answers: [{ questionId: 'q1', optionId: 'A' }] }));
    expect(submission.status).toBe(422);
    expect(await all('SELECT * FROM respostas_diagnostico WHERE diagnostico_id IN (SELECT id FROM diagnosticos WHERE usuario_id = ?)', [user.id])).toHaveLength(0);
  });

  test('exige autenticação e mantém versão do conteúdo ao persistir submissão', async () => {
    const unauthenticated = await request(app).get('/api/diagnostic');
    expect(unauthenticated.status).toBe(401);

    const user = await createUser('submit-diagnostic@test.local');
    const filename = writeBank('submit-approved.json', bank('approved', '2.0'));
    const auth = `Bearer ${tokenFor(user.id)}`;
    const answers = bank().questions.map((question) => ({ questionId: question.id, optionId: 'A' }));
    const submitted = await withEnv({ DIAGNOSTIC_QUESTIONS_FILE: filename }, () =>
      request(app).post('/api/diagnostic/submit').set('Authorization', auth).send({ answers }));
    expect(submitted.status).toBe(201);
    expect(submitted.body.dados.versaoConteudo).toBe('2.0');
    expect(await all('SELECT versao_conteudo, status, pontuacao FROM diagnosticos WHERE usuario_id = ?', [user.id]))
      .toEqual([{ versao_conteudo: '2.0', status: 'completed', pontuacao: 10 }]);
    expect(await all('SELECT * FROM respostas_diagnostico WHERE diagnostico_id IN (SELECT id FROM diagnosticos WHERE usuario_id = ?)', [user.id])).toHaveLength(10);
  });

  test('recusa continuar uma tentativa iniciada com outra versão do banco', async () => {
    const user = await createUser('version-mismatch@test.local');
    const firstVersion = writeBank('version-1.json', bank('approved', '1.0'));
    const auth = `Bearer ${tokenFor(user.id)}`;
    const started = await withEnv({ DIAGNOSTIC_QUESTIONS_FILE: firstVersion }, () => request(app).get('/api/diagnostic').set('Authorization', auth));
    expect(started.status).toBe(200);
    const changedVersion = writeBank('version-2.json', bank('approved', '2.0'));
    const resumed = await withEnv({ DIAGNOSTIC_QUESTIONS_FILE: changedVersion }, () => request(app).get('/api/diagnostic').set('Authorization', auth));
    expect(resumed.status).toBe(409);
    expect(resumed.body.erro).toMatch(/outra vers.o do pr.-teste/i);
  });
});
