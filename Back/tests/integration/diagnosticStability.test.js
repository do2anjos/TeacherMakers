const fs = require('fs');
const os = require('os');
const path = require('path');

const dataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'teachermakers-stability-test-'));
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = dataRoot;
process.env.DATABASE_URL = path.join(dataRoot, 'stability.sqlite');
process.env.JWT_SECRET = 'stability-test-secret';

const sqlite3 = require('sqlite3').verbose();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const db = require('../../src/config/database');
const userModel = require('../../src/models/userModel');
const logger = require('../../src/config/logger');
const migration = require('../../src/migrations/003_repair_legacy_diagnostics');
const attemptConstraintMigration = require('../../src/migrations/004_repair_diagnostic_attempt_constraints');

// O database.js carrega o .env do backend; remover depois dos requires para isolar o teste.
delete process.env.DIAGNOSTIC_QUESTIONS_FILE;
delete process.env.DIAGNOSTIC_ALLOW_DRAFT_CONTENT;

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function(error) {
    if (error) reject(error); else resolve({ lastID: this.lastID });
  }));
}

function questionBankFile(name = 'approved-diagnostic.json', status = 'approved', version = 'test-1.0') {
  const filename = path.join(dataRoot, name);
  const questions = Array.from({ length: 10 }, (_, index) => ({
    id: `q${index + 1}`,
    prompt: `Synthetic diagnostic question ${index + 1}`,
    options: ['A', 'B', 'C', 'D'].map((id) => ({ id, label: `Option ${id}` })),
    correctOptionId: 'A'
  }));
  fs.writeFileSync(filename, JSON.stringify({ metadata: { status, version }, questions }));
  return filename;
}

async function withEnvironment(values, action) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === null) delete process.env[key];
    else process.env[key] = value;
  }
  try { return await action(); }
  finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

beforeAll(async () => db.initDatabase());

afterAll(async () => {
  await new Promise((resolve) => db.close(resolve));
  fs.rmSync(dataRoot, { recursive: true, force: true });
});

test('HTTP request logger preserves the received path under a mounted router', async () => {
  const user = await userModel.create({ nome: 'Synthetic', email: 'request-path@test.local', senha: 'hash', nivel_ensino: 'Fundamental I' });
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
  const info = jest.spyOn(logger, 'info').mockImplementation(() => {});
  try {
    const response = await request(app).get('/api/diagnostic?source=ui').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(503);
    const entry = info.mock.calls.find(([message, metadata]) => message === 'http_request' && metadata?.method === 'GET');
    expect(entry?.[1]?.path).toBe('/api/diagnostic');
  } finally {
    info.mockRestore();
  }
});

test('authentication, health, content, and progress stay available without diagnostic content', async () => {
  const health = await request(app).get('/health');
  expect(health.status).toBe(200);

  const credentials = { nome: 'Synthetic', email: 'no-diagnostic-config@test.local', senha: 'Senha_teste_123', nivel_ensino: 'Fundamental I' };
  const registration = await request(app).post('/api/auth/register').send(credentials);
  expect(registration.status).toBe(201);
  const login = await request(app).post('/api/auth/login').send({ email: credentials.email, senha: credentials.senha });
  expect(login.status).toBe(200);
  expect(login.body.dados.token).toBeTruthy();
  const auth = `Bearer ${login.body.dados.token}`;

  expect((await request(app).get('/api/content/modulos').set('Authorization', auth)).status).toBe(200);
  expect((await request(app).get('/api/progress/conquistas').set('Authorization', auth)).status).toBe(200);
  const diagnostic = await request(app).get('/api/diagnostic').set('Authorization', auth);
  expect(diagnostic.status).toBe(503);
  expect(diagnostic.body.erro).toContain('configurado.');
});

test('first access creates one attempt, repeat GET resumes it, and users remain isolated', async () => {
  const bankPath = questionBankFile();
  const firstUser = await userModel.create({ nome: 'Synthetic A', email: 'first-diagnostic@test.local', senha: 'hash', nivel_ensino: 'Fundamental I' });
  const secondUser = await userModel.create({ nome: 'Synthetic B', email: 'second-diagnostic@test.local', senha: 'hash', nivel_ensino: 'Fundamental I' });
  const firstAuth = `Bearer ${jwt.sign({ id: firstUser.id }, process.env.JWT_SECRET)}`;
  const secondAuth = `Bearer ${jwt.sign({ id: secondUser.id }, process.env.JWT_SECRET)}`;

  await withEnvironment({ DIAGNOSTIC_QUESTIONS_FILE: bankPath }, async () => {
    const first = await request(app).get('/api/diagnostic').set('Authorization', firstAuth);
    const resumed = await request(app).get('/api/diagnostic').set('Authorization', firstAuth);
    const second = await request(app).get('/api/diagnostic').set('Authorization', secondAuth);
    expect(first.status).toBe(200);
    expect(first.body.dados.questions).toHaveLength(10);
    expect(first.body.dados.questions[0].correctOptionId).toBeUndefined();
    expect(resumed.body.dados.attemptId).toBe(first.body.dados.attemptId);
    expect(second.status).toBe(200);
    expect(second.body.dados.attemptId).not.toBe(first.body.dados.attemptId);
  });

  expect(await new Promise((resolve, reject) => db.all(
    "SELECT usuario_id, count(*) AS total FROM diagnosticos WHERE tipo = 'pre' GROUP BY usuario_id ORDER BY usuario_id",
    [],
    (error, rows) => error ? reject(error) : resolve(rows)
  ))).toEqual([
    { usuario_id: firstUser.id, total: 1 },
    { usuario_id: secondUser.id, total: 1 }
  ]);
});

test('authorized development draft completes the full diagnostic and persists answers without changing lesson progress', async () => {
  const bankPath = questionBankFile('draft-diagnostic.json', 'draft', '0.1');
  const user = await userModel.create({ nome: 'Synthetic Draft', email: 'draft-diagnostic@test.local', senha: 'hash', nivel_ensino: 'Fundamental I' });
  const auth = `Bearer ${jwt.sign({ id: user.id }, process.env.JWT_SECRET)}`;
  const progressBefore = await new Promise((resolve, reject) => db.all(
    'SELECT * FROM progresso_modulo WHERE usuario_id = ? ORDER BY modulo_id',
    [user.id],
    (error, rows) => error ? reject(error) : resolve(rows)
  ));

  await withEnvironment({
    NODE_ENV: 'development',
    DIAGNOSTIC_QUESTIONS_FILE: bankPath,
    DIAGNOSTIC_ALLOW_DRAFT_CONTENT: 'true'
  }, async () => {
    const initial = await request(app).get('/api/diagnostic').set('Authorization', auth);
    expect(initial.status).toBe(200);
    expect(initial.body.dados.questions).toHaveLength(10);
    expect(initial.body.dados.versaoConteudo).toBe('0.1');
    expect(initial.body.dados.questions.every((question) => question.correctOptionId === undefined)).toBe(true);

    const answers = initial.body.dados.questions.map((question) => ({ questionId: question.id, optionId: 'A' }));
    const submitted = await request(app).post('/api/diagnostic/submit').set('Authorization', auth).send({ answers });
    expect(submitted.status).toBe(201);
    expect(submitted.body.dados.status).toBe('completed');
    expect(submitted.body.dados.versaoConteudo).toBe('0.1');

    const duplicate = await request(app).post('/api/diagnostic/submit').set('Authorization', auth).send({ answers });
    expect(duplicate.status).toBe(409);

    const completed = await request(app).get('/api/diagnostic').set('Authorization', auth);
    expect(completed.status).toBe(200);
    expect(completed.body.dados.status).toBe('completed');
    expect(completed.body.dados.questions).toEqual([]);
  });

  const persisted = await new Promise((resolve, reject) => db.get(
    `SELECT d.id, d.status, d.versao_conteudo, d.pontuacao,
      (SELECT count(*) FROM respostas_diagnostico r WHERE r.diagnostico_id = d.id) AS answer_count
     FROM diagnosticos d WHERE d.usuario_id = ? AND d.tipo = 'pre'`,
    [user.id],
    (error, row) => error ? reject(error) : resolve(row)
  ));
  expect(persisted).toMatchObject({ status: 'completed', versao_conteudo: '0.1', pontuacao: 10, answer_count: 10 });
  const progressAfter = await new Promise((resolve, reject) => db.all(
    'SELECT * FROM progresso_modulo WHERE usuario_id = ? ORDER BY modulo_id',
    [user.id],
    (error, rows) => error ? reject(error) : resolve(rows)
  ));
  expect(progressAfter).toEqual(progressBefore);
});

test('legacy in-progress attempts adopt the configured version and inconsistent attempts return a safe error', async () => {
  const bankPath = questionBankFile('legacy-diagnostic.json');
  const legacyUser = await userModel.create({ nome: 'Synthetic Legacy', email: 'legacy-diagnostic@test.local', senha: 'hash', nivel_ensino: 'Fundamental I' });
  const inconsistentUser = await userModel.create({ nome: 'Synthetic Inconsistent', email: 'inconsistent-diagnostic@test.local', senha: 'hash', nivel_ensino: 'Fundamental I' });
  const legacyAttempt = await run(
    "INSERT INTO diagnosticos (usuario_id, tipo, pontuacao, total_questoes, status, data_inicio, versao_conteudo) VALUES (?, 'pre', NULL, 10, 'in_progress', CURRENT_TIMESTAMP, NULL)",
    [legacyUser.id]
  );
  await run(
    "INSERT INTO diagnosticos (usuario_id, tipo, pontuacao, total_questoes, status, data_inicio, versao_conteudo) VALUES (?, 'pre', NULL, 10, 'corrupt', CURRENT_TIMESTAMP, 'test-1.0')",
    [inconsistentUser.id]
  );
  const legacyAuth = `Bearer ${jwt.sign({ id: legacyUser.id }, process.env.JWT_SECRET)}`;
  const inconsistentAuth = `Bearer ${jwt.sign({ id: inconsistentUser.id }, process.env.JWT_SECRET)}`;

  await withEnvironment({ DIAGNOSTIC_QUESTIONS_FILE: bankPath }, async () => {
    const legacy = await request(app).get('/api/diagnostic').set('Authorization', legacyAuth);
    expect(legacy.status).toBe(200);
    expect(legacy.body.dados.attemptId).toBe(legacyAttempt.lastID);
    expect(legacy.body.dados.versaoConteudo).toBe('test-1.0');
    expect(legacy.body.dados.questions).toHaveLength(10);

    const inconsistent = await request(app).get('/api/diagnostic').set('Authorization', inconsistentAuth);
    expect(inconsistent.status).toBe(500);
    expect(inconsistent.body.erro).toContain('consistente');
    expect(inconsistent.text).not.toContain('diagnosticService');
  });

  const storedVersion = await new Promise((resolve, reject) => db.get(
    'SELECT versao_conteudo FROM diagnosticos WHERE id = ?',
    [legacyAttempt.lastID],
    (error, row) => error ? reject(error) : resolve(row?.versao_conteudo)
  ));
  expect(storedVersion).toBe('test-1.0');
});

test('rejects a signed token without a valid active user instead of creating a broken attempt', async () => {
  const bankPath = questionBankFile('invalid-identity-approved.json');
  const missingId = jwt.sign({ email: 'legacy-token@test.local' }, process.env.JWT_SECRET);
  const deletedUser = jwt.sign({ id: 999999, email: 'deleted-user@test.local' }, process.env.JWT_SECRET);
  const attemptsBefore = await new Promise((resolve, reject) => db.get('SELECT count(*) AS total FROM diagnosticos', [], (error, row) => error ? reject(error) : resolve(row.total)));
  await withEnvironment({ DIAGNOSTIC_QUESTIONS_FILE: bankPath }, async () => {
    for (const token of [missingId, deletedUser]) {
      const response = await request(app).get('/api/diagnostic').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(401);
      expect(response.body.erro).toContain('conta ativa');
      expect(response.text).not.toContain('diagnosticService');
    }
  });
  const attempts = await new Promise((resolve, reject) => db.get('SELECT count(*) AS total FROM diagnosticos', [], (error, row) => error ? reject(error) : resolve(row.total)));
  expect(attempts).toBe(attemptsBefore);
});

test('repair migration adds legacy columns, preserves rows, and is idempotent', async () => {
  const legacy = new sqlite3.Database(':memory:');
  const invoke = (method, sql, params = []) => new Promise((resolve, reject) => {
    legacy[method](sql, params, function(error, value) {
      if (error) reject(error);
      else resolve(method === 'all' ? value : { changes: this.changes });
    });
  });
  const executor = { all: (sql, params) => invoke('all', sql, params), run: (sql, params) => invoke('run', sql, params) };
  try {
    await invoke('run', `CREATE TABLE diagnosticos (
      id INTEGER PRIMARY KEY, usuario_id INTEGER, tipo TEXT, pontuacao INTEGER,
      total_questoes INTEGER, data_conclusao DATETIME, versao_conteudo TEXT
    )`);
    await invoke('run', "INSERT INTO diagnosticos (id, usuario_id, tipo, pontuacao, total_questoes, data_conclusao) VALUES (1, 11, 'pre', 7, 10, CURRENT_TIMESTAMP)");
    await invoke('run', "INSERT INTO diagnosticos (id, usuario_id, tipo, pontuacao, total_questoes) VALUES (2, 12, 'pre', NULL, 10)");
    await migration.up(executor);
    await migration.up(executor);
    const rows = await invoke('all', 'SELECT id, usuario_id, status, data_inicio, pontuacao FROM diagnosticos ORDER BY id');
    expect(rows).toHaveLength(2);
    expect(rows.map(({ id, usuario_id, status, pontuacao }) => ({ id, usuario_id, status, pontuacao }))).toEqual([
      { id: 1, usuario_id: 11, status: 'completed', pontuacao: 7 },
      { id: 2, usuario_id: 12, status: 'in_progress', pontuacao: null }
    ]);
    expect((await invoke('all', 'PRAGMA table_info(diagnosticos)')).map(({ name }) => name)).toEqual(expect.arrayContaining(['status', 'data_inicio']));
  } finally {
    await new Promise((resolve) => legacy.close(resolve));
  }
});

test('constraint migration preserves diagnostic attempts and answers while allowing an unfinished attempt', async () => {
  const legacy = new sqlite3.Database(':memory:');
  const invoke = (method, sql, params = []) => new Promise((resolve, reject) => {
    legacy[method](sql, params, function(error, value) {
      if (error) reject(error);
      else resolve(method === 'all' ? value : { lastID: this.lastID, changes: this.changes });
    });
  });
  const executor = { all: (sql, params) => invoke('all', sql, params), run: (sql, params) => invoke('run', sql, params) };
  try {
    await invoke('run', 'PRAGMA foreign_keys = ON');
    await invoke('run', 'CREATE TABLE usuarios (id INTEGER PRIMARY KEY)');
    await invoke('run', `CREATE TABLE diagnosticos (
      id INTEGER PRIMARY KEY AUTOINCREMENT, usuario_id INTEGER NOT NULL, tipo TEXT NOT NULL DEFAULT 'pre',
      pontuacao INTEGER NOT NULL, total_questoes INTEGER NOT NULL, data_conclusao DATETIME DEFAULT CURRENT_TIMESTAMP,
      versao_conteudo TEXT, status TEXT, data_inicio DATETIME,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    )`);
    await invoke('run', `CREATE TABLE respostas_diagnostico (
      id INTEGER PRIMARY KEY AUTOINCREMENT, diagnostico_id INTEGER NOT NULL, questao_codigo TEXT NOT NULL,
      resposta TEXT NOT NULL, correta BOOLEAN NOT NULL, UNIQUE(diagnostico_id, questao_codigo),
      FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos (id) ON DELETE CASCADE
    )`);
    await invoke('run', 'CREATE INDEX idx_diagnosticos_usuario_tipo ON diagnosticos(usuario_id, tipo)');
    await invoke('run', 'CREATE UNIQUE INDEX uq_diagnosticos_usuario_tipo ON diagnosticos(usuario_id, tipo)');
    await invoke('run', 'CREATE INDEX idx_respostas_diagnostico ON respostas_diagnostico(diagnostico_id)');
    await invoke('run', 'INSERT INTO usuarios (id) VALUES (11), (12)');
    await invoke('run', `INSERT INTO diagnosticos
      (id, usuario_id, tipo, pontuacao, total_questoes, status, data_inicio, data_conclusao, versao_conteudo)
      VALUES (1, 11, 'pre', 7, 10, 'completed', '2026-11-01 10:00:00', '2026-11-01 10:10:00', '0.1')`);
    await invoke('run', `INSERT INTO diagnosticos
      (id, usuario_id, tipo, pontuacao, total_questoes, status, data_inicio, data_conclusao, versao_conteudo)
      VALUES (2, 12, 'pre', 0, 10, 'in_progress', '2026-11-02 10:00:00', NULL, '0.1')`);
    await invoke('run', "INSERT INTO respostas_diagnostico (id, diagnostico_id, questao_codigo, resposta, correta) VALUES (1, 1, 'q1', 'B', 0), (2, 2, 'q1', 'A', 1)");

    await invoke('run', 'BEGIN IMMEDIATE');
    try {
      await attemptConstraintMigration.up(executor);
      await invoke('run', 'COMMIT');
    } catch (error) {
      await invoke('run', 'ROLLBACK');
      throw error;
    }
    await attemptConstraintMigration.up(executor);

    const attempts = await invoke('all', 'SELECT id, usuario_id, status, pontuacao, versao_conteudo, data_conclusao FROM diagnosticos ORDER BY id');
    expect(attempts).toEqual([
      { id: 1, usuario_id: 11, status: 'completed', pontuacao: 7, versao_conteudo: '0.1', data_conclusao: '2026-11-01 10:10:00' },
      { id: 2, usuario_id: 12, status: 'in_progress', pontuacao: 0, versao_conteudo: '0.1', data_conclusao: null }
    ]);
    const answers = await invoke('all', 'SELECT id, diagnostico_id, questao_codigo, resposta, correta FROM respostas_diagnostico ORDER BY id');
    expect(answers).toEqual([
      { id: 1, diagnostico_id: 1, questao_codigo: 'q1', resposta: 'B', correta: 0 },
      { id: 2, diagnostico_id: 2, questao_codigo: 'q1', resposta: 'A', correta: 1 }
    ]);
    expect(await invoke('all', 'PRAGMA foreign_key_check')).toEqual([]);

    const diagnosticColumns = await invoke('all', 'PRAGMA table_info(diagnosticos)');
    expect(diagnosticColumns.find(({ name }) => name === 'pontuacao').notnull).toBe(0);
    expect(diagnosticColumns.find(({ name }) => name === 'data_conclusao').dflt_value).toBeNull();

    await invoke('run', `INSERT INTO diagnosticos (usuario_id, tipo, pontuacao, total_questoes, status, data_inicio, versao_conteudo)
      VALUES (11, 'pos', NULL, 10, 'in_progress', CURRENT_TIMESTAMP, 'test-new')`);
    const newAttempt = await invoke('all', "SELECT pontuacao, status, data_conclusao FROM diagnosticos WHERE tipo = 'pos'");
    expect(newAttempt).toEqual([{ pontuacao: null, status: 'in_progress', data_conclusao: null }]);
  } finally {
    await new Promise((resolve) => legacy.close(resolve));
  }
});
