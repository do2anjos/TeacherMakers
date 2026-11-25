const fs = require('fs');
const os = require('os');
const path = require('path');

const isolatedDataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'teachermakers-content-'));
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = isolatedDataRoot;
process.env.DATABASE_URL = path.join(isolatedDataRoot, 'test.sqlite');
process.env.JWT_SECRET = 'test-only-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const db = require('../../src/config/database');
const userModel = require('../../src/models/userModel');
const contentService = require('../../src/services/contentService');

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function(error) {
    if (error) reject(error); else resolve({ lastID: this.lastID, changes: this.changes });
  }));
}

async function createUser(email) {
  return userModel.create({ nome: 'Conta Content', email, senha: 'hash-de-teste', nivel_ensino: 'Fundamental I' });
}

function tokenFor(userId) {
  return jwt.sign({ id: userId, email: `user-${userId}@test.local` }, process.env.JWT_SECRET);
}

beforeAll(async () => {
  await db.initDatabase();
  await run("INSERT INTO modulos (id, titulo, descricao, cor, ordem) VALUES (1, 'Introdução', '', '#123456', 1)");
  await run("INSERT INTO modulos (id, titulo, descricao, cor, ordem) VALUES (2, 'Circuitos', '', '#123456', 2)");
  await run("INSERT INTO aulas (id, modulo_id, titulo, subtitulo, descricao, tipo, ordem) VALUES (1, 1, 'Segurança maker', 'Sub', 'Desc', 'video', 1)");
  await run("INSERT INTO aulas (id, modulo_id, titulo, subtitulo, descricao, tipo, ordem) VALUES (2, 2, 'Circuitos básicos', 'Sub', 'Desc', 'video', 1)");
  await run('INSERT INTO quizzes (id, aula_id) VALUES (1, 1)');
  await run("INSERT INTO questoes (id, quiz_id, pergunta, ordem) VALUES (1, 1, 'Qual é o objetivo?', 1)");
  await run("INSERT INTO opcoes (id, questoes_id, texto, correta, ordem) VALUES (1, 1, 'Resposta certa', 1, 1)");
  await run("INSERT INTO praticas (id, modulo_id, aula_id, tipo, titulo, subtitulo) VALUES (1, 1, 1, 'maker', 'Prática intro', 'Sub')");
  await run("INSERT INTO praticas (id, modulo_id, tipo, titulo, subtitulo) VALUES (2, 2, 'maker', 'Prática avançada', 'Sub')");
  await run("INSERT INTO etapas_pratica (id, pratica_id, titulo, texto_instrucao, ordem) VALUES (1, 1, 'Etapa 1', 'Instrução 1', 1)");
  await run("INSERT INTO etapas_pratica (id, pratica_id, titulo, texto_instrucao, ordem) VALUES (2, 1, 'Etapa 2', 'Instrução 2', 2)");
});

afterAll(async () => {
  await new Promise((resolve) => db.close(resolve));
  fs.rmSync(isolatedDataRoot, { recursive: true, force: true });
});

describe('PB-11 — contentController / contentService', () => {
  describe('GET /api/content/modulos', () => {
    test('exige autenticação (401)', async () => {
      const response = await request(app).get('/api/content/modulos');
      expect(response.status).toBe(401);
    });

    test('retorna módulos com progresso, trilha ordenada e item atual (200)', async () => {
      const user = await createUser('modulos@test.local');
      const response = await request(app).get('/api/content/modulos')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.sucesso).toBe(true);
      const modulos = response.body.dados;
      expect(modulos).toHaveLength(2);
      expect(modulos[0].acesso).toBe('available');
      expect(modulos[0].bloqueado).toBe(false);
      expect(modulos[0].isIntro).toBe(true);
      expect(modulos[1].acesso).toBe('locked');
      expect(modulos[1].bloqueado).toBe(true);
      expect(modulos[0].trilha.map((item) => item.tipo)).toEqual(['aula', 'pratica']);
      expect(modulos[0].trilha.map((item) => item.ordem)).toEqual([1, 1.5]);
      expect(modulos[0].trilha.filter((item) => item.isCurrent)).toHaveLength(1);
    });

    test('com onboarding concluído, o próximo módulo é liberado', async () => {
      const user = await createUser('onboarding@test.local');
      await userModel.completeOnboarding(user.id);
      const modulos = await contentService.getModulosComProgresso(user.id);
      expect(modulos[0].isIntro).toBe(true);
      expect(modulos[1].acesso).toBe('available');
      expect(modulos[1].bloqueado).toBe(false);
    });
  });

  describe('assertModuleAvailable (contentService)', () => {
    test('lança 404 para módulo inexistente', async () => {
      const user = await createUser('inexistente@test.local');
      await expect(contentService.assertModuleAvailable(user.id, 999)).rejects.toMatchObject({ status: 404 });
    });

    test('lança 403 para módulo bloqueado sem pré-requisitos', async () => {
      const user = await createUser('bloqueado@test.local');
      await expect(contentService.assertModuleAvailable(user.id, 2)).rejects.toMatchObject({ status: 403 });
    });

    test('permite módulo 2 quando o anterior está concluído', async () => {
      const user = await createUser('liberado@test.local');
      await run("UPDATE progresso_modulo SET status = 'concluido', percentual = 100 WHERE usuario_id = ? AND modulo_id = 1", [user.id]);
      await run("UPDATE progresso_modulo SET estado_acesso = 'available' WHERE usuario_id = ? AND modulo_id = 2", [user.id]);
      await expect(contentService.assertModuleAvailable(user.id, 2)).resolves.toBeUndefined();
    });
  });

  describe('GET /api/content/modulos/:moduloId/aulas', () => {
    test('retorna aulas com status e video_assistido do progresso (200)', async () => {
      const user = await createUser('aulas@test.local');
      await run("INSERT INTO progresso_aula (usuario_id, aula_id, status, video_assistido) VALUES (?, 1, 'concluido', 1)", [user.id]);
      const response = await request(app).get('/api/content/modulos/1/aulas')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.dados).toHaveLength(1);
      expect(response.body.dados[0]).toMatchObject({ id: 1, titulo: 'Segurança maker', status: 'concluido', video_assistido: 1 });
    });

    test('nega aulas de módulo bloqueado (403)', async () => {
      const user = await createUser('aulas-bloqueadas@test.local');
      const response = await request(app).get('/api/content/modulos/2/aulas')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/content/aulas/:id', () => {
    test('retorna 404 para aula inexistente', async () => {
      const user = await createUser('aula-404@test.local');
      const response = await request(app).get('/api/content/aulas/999')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);
      expect(response.status).toBe(404);
      expect(response.body.erro).toMatch(/não encontrada/);
    });

    test('retorna aula com quiz e opções aninhadas (200)', async () => {
      const user = await createUser('aula-quiz@test.local');
      const response = await request(app).get('/api/content/aulas/1')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.dados.status).toBe('pendente');
      expect(response.body.dados.video_assistido).toBe(false);
      expect(response.body.dados.quiz).toHaveLength(1);
      expect(response.body.dados.quiz[0].opcoes).toHaveLength(1);
      expect(response.body.dados.quiz[0].opcoes[0].texto).toBe('Resposta certa');
    });
  });

  describe('GET /api/content/modulos/:moduloId/praticas', () => {
    test('nega práticas de módulo bloqueado (403)', async () => {
      const user = await createUser('praticas-bloqueadas@test.local');
      const response = await request(app).get('/api/content/modulos/2/praticas')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);
      expect(response.status).toBe(403);
    });

    test('retorna práticas com etapas (200)', async () => {
      const user = await createUser('praticas@test.local');
      const response = await request(app).get('/api/content/modulos/1/praticas')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.dados).toHaveLength(1);
      expect(response.body.dados[0].etapas.map((etapa) => etapa.titulo)).toEqual(['Etapa 1', 'Etapa 2']);
    });
  });

  describe('GET /api/content/praticas/:id', () => {
    test('retorna 404 para prática inexistente', async () => {
      const user = await createUser('pratica-404@test.local');
      const response = await request(app).get('/api/content/praticas/999')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);
      expect(response.status).toBe(404);
      expect(response.body.erro).toMatch(/não encontrada/);
    });

    test('retorna prática com etapas ordenadas (200)', async () => {
      const user = await createUser('pratica-detalhes@test.local');
      const response = await request(app).get('/api/content/praticas/1')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`);

      expect(response.status).toBe(200);
      expect(response.body.dados.titulo).toBe('Prática intro');
      expect(response.body.dados.etapas.map((etapa) => etapa.titulo)).toEqual(['Etapa 1', 'Etapa 2']);
    });
  });
});
