const fs = require('fs');
const os = require('os');
const path = require('path');

const isolatedDataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'teachermakers-auth-'));
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = isolatedDataRoot;
process.env.DATABASE_URL = path.join(isolatedDataRoot, 'test.sqlite');
process.env.JWT_SECRET = 'test-only-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../src/server');
const db = require('../../src/config/database');

// O database.js carrega o .env; isolar o gate do pre-teste nos testes.
delete process.env.REQUIRE_DIAGNOSTIC_PRETEST;

const validUser = {
  nome: 'Professora Sintética',
  email: 'sintetica@test.local',
  senha: 'senha-segura-123',
  nivel_ensino: 'Fundamental I'
};

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function(error) {
    if (error) reject(error); else resolve({ lastID: this.lastID, changes: this.changes });
  }));
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

beforeAll(async () => {
  await db.initDatabase();
  await run("INSERT INTO modulos (id, titulo, descricao, cor, ordem) VALUES (1, 'Introdução', '', '#123456', 1)");
  await run("INSERT INTO modulos (id, titulo, descricao, cor, ordem) VALUES (2, 'Circuitos', '', '#123456', 2)");
});

afterAll(async () => {
  await new Promise((resolve) => db.close(resolve));
  fs.rmSync(isolatedDataRoot, { recursive: true, force: true });
});

describe('PB-11 — authController / authService', () => {
  describe('POST /api/auth/register', () => {
    test('rejeita cadastro com campos obrigatórios ausentes (400)', async () => {
      const response = await request(app).post('/api/auth/register').send({ nome: 'Incompleto' });
      expect(response.status).toBe(400);
      expect(response.body.sucesso).toBe(false);
      expect(response.body.erro).toMatch(/obrigatórios/);
      expect(await all('SELECT * FROM usuarios')).toHaveLength(0);
    });

    test('cadastra usuário com senha hashes e progresso inicial dos módulos (201)', async () => {
      const response = await request(app).post('/api/auth/register').send(validUser);
      expect(response.status).toBe(201);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.mensagem).toBe('Usuário criado com sucesso!');
      expect(response.body.dados.email).toBe(validUser.email);
      expect(response.body.dados.senha).toBeUndefined();

      const saved = await get('SELECT * FROM usuarios WHERE email = ?', [validUser.email]);
      expect(saved).toBeDefined();
      expect(saved.senha).not.toBe(validUser.senha);
      expect(await bcrypt.compare(validUser.senha, saved.senha)).toBe(true);

      const progress = await all('SELECT modulo_id, status, estado_acesso FROM progresso_modulo WHERE usuario_id = ? ORDER BY modulo_id', [saved.id]);
      expect(progress).toEqual([
        { modulo_id: 1, status: 'pendente', estado_acesso: 'available' },
        { modulo_id: 2, status: 'pendente', estado_acesso: 'locked' }
      ]);
    });

    test('rejeita e-mail duplicado (400) sem criar segundo registro', async () => {
      const response = await request(app).post('/api/auth/register').send({ ...validUser, nome: 'Duplicado' });
      expect(response.status).toBe(400);
      expect(response.body.erro).toMatch(/já cadastrado/);
      expect(await all('SELECT * FROM usuarios WHERE email = ?', [validUser.email])).toHaveLength(1);
    });
  });

  describe('POST /api/auth/login', () => {
    test('rejeita login sem e-mail ou senha (400)', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: validUser.email });
      expect(response.status).toBe(400);
      expect(response.body.erro).toMatch(/obrigatórios/);
    });

    test('rejeita e-mail inexistente (401)', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: 'ausente@test.local', senha: 'qualquer' });
      expect(response.status).toBe(401);
      expect(response.body.erro).toMatch(/inválidos/);
    });

    test('rejeita senha incorreta (401)', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: validUser.email, senha: 'errada' });
      expect(response.status).toBe(401);
    });

    test('autentica com sucesso e devolve JWT válido sem expor a senha (200)', async () => {
      const response = await request(app).post('/api/auth/login').send({ email: validUser.email, senha: validUser.senha });
      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      expect(response.body.mensagem).toBe('Login realizado com sucesso!');
      expect(response.body.dados.usuario.email).toBe(validUser.email);
      expect(response.body.dados.usuario.senha).toBeUndefined();
      expect(response.body.dados.token).toEqual(expect.any(String));

      const decoded = jwt.verify(response.body.dados.token, process.env.JWT_SECRET);
      expect(decoded.email).toBe(validUser.email);
      expect(decoded.id).toBe(response.body.dados.usuario.id);
    });
  });

  describe('PATCH /api/auth/onboarding', () => {
    test('exige autenticação (401)', async () => {
      const response = await request(app).patch('/api/auth/onboarding');
      expect(response.status).toBe(401);
    });

    test('conclui o onboarding e persiste a flag (200)', async () => {
      const login = await request(app).post('/api/auth/login').send({ email: validUser.email, senha: validUser.senha });
      const token = login.body.dados.token;

      const response = await request(app).patch('/api/auth/onboarding')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);

      const saved = await get('SELECT onboarding_concluido FROM usuarios WHERE email = ?', [validUser.email]);
      expect(saved.onboarding_concluido).toBe(1);
    });

    test('rejeita onboarding repetido (404)', async () => {
      const login = await request(app).post('/api/auth/login').send({ email: validUser.email, senha: validUser.senha });
      const response = await request(app).patch('/api/auth/onboarding')
        .set('Authorization', `Bearer ${login.body.dados.token}`);
      expect(response.status).toBe(404);
      expect(response.body.erro).toMatch(/onboarding já concluído/);
    });
  });
});
