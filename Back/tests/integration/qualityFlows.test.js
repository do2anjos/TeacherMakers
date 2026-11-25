const fs = require('fs');
const os = require('os');
const path = require('path');

const isolatedDataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'teachermakers-test-'));
process.env.NODE_ENV = 'test';
process.env.DATA_DIR = isolatedDataRoot;
process.env.DATABASE_URL = path.join(isolatedDataRoot, 'test.sqlite');
process.env.JWT_SECRET = 'test-only-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const db = require('../../src/config/database');
const userModel = require('../../src/models/userModel');

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/n6sAAAAASUVORK5CYII=', 'base64');
const validDiary = 'A'.repeat(100);

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function(error) {
    if (error) reject(error); else resolve({ lastID: this.lastID, changes: this.changes });
  }));
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

async function createUser(email) {
  return userModel.create({ nome: 'Conta Sintética', email, senha: 'hash-de-teste', nivel_ensino: 'Fundamental I' });
}

function tokenFor(userId) {
  return jwt.sign({ id: userId, email: `user-${userId}@test.local` }, process.env.JWT_SECRET);
}

function diagnosticBank(status = 'approved', version = 'fixture-1.0') {
  return {
    metadata: { status, version },
    questions: Array.from({ length: 10 }, (_, index) => ({
      id: `q${index + 1}`,
      prompt: `Synthetic diagnostic question ${index + 1}`,
      correctOptionId: 'A',
      options: ['A', 'B', 'C', 'D'].map((id) => ({ id, label: `Option ${id}` }))
    }))
  };
}

async function withDiagnosticEnvironment(values, action) {
  const keys = Object.keys(values);
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === null) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return await action();
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
}

beforeAll(async () => {
  await db.initDatabase();
  await run("INSERT INTO modulos (id, titulo, descricao, cor, ordem) VALUES (1, 'Introdução', '', '#123456', 1)");
  await run("INSERT INTO modulos (id, titulo, descricao, cor, ordem) VALUES (2, 'Circuitos', '', '#123456', 2)");
  await run("INSERT INTO praticas (id, modulo_id, tipo, titulo) VALUES (1, 1, 'maker', 'Circuito básico')");
  await run("INSERT INTO praticas (id, modulo_id, tipo, titulo) VALUES (2, 2, 'maker', 'Circuito avançado')");
  await run("INSERT INTO aulas (id, modulo_id, titulo, tipo, ordem) VALUES (1, 1, 'Segurança maker', 'video', 1)");
  await run('INSERT INTO quizzes (id, aula_id) VALUES (1, 1)');
  await run("INSERT INTO questoes (id, quiz_id, pergunta, ordem) VALUES (1, 1, 'Qual é o objetivo?', 1)");
  await run("INSERT INTO opcoes (id, questoes_id, texto, correta, ordem) VALUES (1, 1, 'Resposta certa', 1, 1)");
  await run("INSERT INTO questoes (id, quiz_id, pergunta, ordem) VALUES (2, 1, 'Outra questão?', 2)");
  await run("INSERT INTO opcoes (id, questoes_id, texto, correta, ordem) VALUES (2, 2, 'Outra resposta certa', 1, 1)");
});

afterAll(async () => {
  await new Promise((resolve) => db.close(resolve));
  fs.rmSync(isolatedDataRoot, { recursive: true, force: true });
});

describe('fluxos críticos isolados do TeacherMakers', () => {
  test('rejeita envio sem arquivo e sem persistir progresso', async () => {
    const user = await createUser('sem-arquivo@test.local');
    const response = await request(app).post('/api/progress/pratica/finish')
      .set('Authorization', `Bearer ${tokenFor(user.id)}`)
      .field('praticaId', '1').field('diarioBordo', validDiary);

    expect(response.status).toBe(400);
    expect(await all('SELECT * FROM progresso_pratica WHERE usuario_id = ?', [user.id])).toHaveLength(0);
    expect(await all('SELECT * FROM evidencias')).toHaveLength(0);
  });

  test('valida tamanho mínimo, tipo, conteúdo e limite do arquivo antes da persistência', async () => {
    const user = await createUser('validacao@test.local');
    const shortDiary = await request(app).post('/api/progress/pratica/finish')
      .set('Authorization', `Bearer ${tokenFor(user.id)}`)
      .field('praticaId', '1').field('diarioBordo', 'x'.repeat(99))
      .attach('foto', png, { filename: 'evidencia.png', contentType: 'image/png' });
    expect(shortDiary.status).toBe(422);

    const mismatched = await request(app).post('/api/progress/pratica/finish')
      .set('Authorization', `Bearer ${tokenFor(user.id)}`)
      .field('praticaId', '1').field('diarioBordo', validDiary)
      .attach('foto', png, { filename: 'evidencia.jpg', contentType: 'image/jpeg' });
    expect(mismatched.status).toBe(415);

    const oversized = await request(app).post('/api/progress/pratica/finish')
      .set('Authorization', `Bearer ${tokenFor(user.id)}`)
      .field('praticaId', '1').field('diarioBordo', validDiary)
      .attach('foto', Buffer.alloc(10 * 1024 * 1024 + 1), { filename: 'grande.png', contentType: 'image/png' });
    expect(oversized.status).toBe(413);

    expect(await all('SELECT * FROM progresso_pratica WHERE usuario_id = ?', [user.id])).toHaveLength(0);
    expect(await all('SELECT * FROM evidencias')).toHaveLength(0);
    expect(fs.readdirSync(path.join(isolatedDataRoot, '.tmp', 'uploads'))).toHaveLength(0);
  });

  test('salva evidência e progresso atomicamente e retorna protocolo persistido', async () => {
    const user = await createUser('valido@test.local');
    await run("INSERT INTO progresso_aula (usuario_id, aula_id, status, video_assistido) VALUES (?, 1, 'concluido', 1)", [user.id]);
    const response = await request(app).post('/api/progress/pratica/finish')
      .set('Authorization', `Bearer ${tokenFor(user.id)}`)
      .field('praticaId', '1').field('diarioBordo', validDiary)
      .attach('foto', png, { filename: 'evidencia.png', contentType: 'image/png' });

    expect(response.status).toBe(201);
    expect(response.body.dados.protocolo).toMatch(/^TM-E-\d+$/);
    expect(response.body.dados.progressoModulo.percentual).toBe(100);
    const evidence = await all('SELECT foto_url, foto_blob, foto_mime, foto_token FROM evidencias');
    expect(evidence).toHaveLength(1);
    expect(evidence[0].foto_blob).toBeTruthy();
    expect(Buffer.from(evidence[0].foto_blob).equals(png)).toBe(true);
    expect(evidence[0].foto_mime).toBe('image/png');
    expect(evidence[0].foto_url).toMatch(/^\/api\/progress\/evidencias\/.+\/foto$/);

    const fotoResponse = await request(app).get(evidence[0].foto_url)
      .set('Authorization', `Bearer ${tokenFor(user.id)}`)
      .buffer(true);
    expect(fotoResponse.status).toBe(200);
    expect(Buffer.from(fotoResponse.body).equals(png)).toBe(true);
    expect(response.body.dados.novasConquistas.map((badge) => badge.code)).toContain('primeiro-circuito');
  });

  test('rollback remove progresso e BLOB em falha ao salvar evidência', async () => {
    const user = await createUser('rollback@test.local');
    const originalTransaction = db.withTransaction;
    db.withTransaction = (work) => originalTransaction((tx) => work({
      ...tx,
      run: (sql, params) => sql.includes('INSERT INTO evidencias') ? Promise.reject(new Error('Falha injetada no armazenamento da evidência')) : tx.run(sql, params)
    }));

    try {
      const response = await request(app).post('/api/progress/pratica/finish')
        .set('Authorization', `Bearer ${tokenFor(user.id)}`)
        .field('praticaId', '1').field('diarioBordo', validDiary)
        .attach('foto', png, { filename: 'falha.png', contentType: 'image/png' });
      expect(response.status).toBe(500);
      expect(await all('SELECT * FROM progresso_pratica WHERE usuario_id = ?', [user.id])).toHaveLength(0);
      // A evidência válida do teste anterior permanece; a falha não gravou BLOB órfão.
      const evidencias = await all('SELECT foto_blob FROM evidencias');
      expect(evidencias).toHaveLength(1);
      expect(evidencias[0].foto_blob).toBeTruthy();
    } finally {
      db.withTransaction = originalTransaction;
    }
  });

  test('reconciliação de arquivos órfãos limpa resíduos de interrupção abrupta preservando evidências válidas', async () => {
    const progressService = require('../../src/services/progressService');

// O database.js carrega o .env; isolar o gate do pre-teste nos testes.
delete process.env.REQUIRE_DIAGNOSTIC_PRETEST;
    const orphanPart = path.join(isolatedDataRoot, '.tmp', 'uploads', 'orfao-crashed.part');
    const orphanEvidence = path.join(isolatedDataRoot, 'uploads', 'evidencias', 'evidencia-orfao-sem-banco.png');

    fs.writeFileSync(orphanPart, 'dados parciais residuais');
    fs.writeFileSync(orphanEvidence, png);

    expect(fs.existsSync(orphanPart)).toBe(true);
    expect(fs.existsSync(orphanEvidence)).toBe(true);

    const limpos = await progressService.reconciliarArquivosOrfaos(db);

    expect(limpos.temporarios).toContain('orfao-crashed.part');
    expect(limpos.evidencias).toContain('evidencia-orfao-sem-banco.png');
    expect(fs.existsSync(orphanPart)).toBe(false);
    expect(fs.existsSync(orphanEvidence)).toBe(false);

    const evidenciasValidas = await all('SELECT foto_url, foto_blob FROM evidencias');
    expect(evidenciasValidas.length).toBeGreaterThan(0);
    expect(evidenciasValidas[0].foto_blob).toBeTruthy();
    expect(Buffer.from(evidenciasValidas[0].foto_blob).equals(png)).toBe(true);
  });

  test('cria estado inicial sem conclusão e impede acesso à trilha bloqueada', async () => {
    const user = await createUser('estado-inicial@test.local');
    const progress = await all('SELECT modulo_id, status, estado_acesso FROM progresso_modulo WHERE usuario_id = ? ORDER BY modulo_id', [user.id]);
    expect(progress.map((row) => [row.status, row.estado_acesso])).toEqual([['pendente', 'available'], ['pendente', 'locked']]);

    const blocked = await request(app).get('/api/content/modulos/2/praticas')
      .set('Authorization', `Bearer ${tokenFor(user.id)}`);
    expect(blocked.status).toBe(403);
  });

  test('exige autenticação e expõe conquistas bloqueadas sem concedê-las no cliente', async () => {
    const anonymous = await request(app).get('/api/progress/conquistas');
    expect(anonymous.status).toBe(401);
    const user = await createUser('badges@test.local');
    const response = await request(app).get('/api/progress/conquistas')
      .set('Authorization', `Bearer ${tokenFor(user.id)}`);
    expect(response.status).toBe(200);
    expect(response.body.dados.every((badge) => badge.desbloqueado === false)).toBe(true);
  });

  test('valida os demais fluxos de progresso e impede certificado antes da conclusão', async () => {
    const user = await createUser('regras@test.local');
    const auth = `Bearer ${tokenFor(user.id)}`;

    const missingQuizFields = await request(app).post('/api/progress/quiz/submit').set('Authorization', auth).send({});
    expect(missingQuizFields.status).toBe(400);
    const mismatchedOption = await request(app).post('/api/progress/quiz/submit').set('Authorization', auth)
      .send({ questaoId: 2, opcaoId: 1 });
    expect(mismatchedOption.status).toBe(400);

    const correctAnswer = await request(app).post('/api/progress/quiz/submit').set('Authorization', auth)
      .send({ questaoId: 1, opcaoId: 1 });
    expect(correctAnswer.status).toBe(200);
    const secondCorrectAnswer = await request(app).post('/api/progress/quiz/submit').set('Authorization', auth)
      .send({ questaoId: 2, opcaoId: 2 });
    expect(secondCorrectAnswer.status).toBe(200);

    const completedLesson = await request(app).post('/api/progress/aula/1/complete').set('Authorization', auth);
    expect(completedLesson.status).toBe(200);
    const missingLesson = await request(app).post('/api/progress/aula/999/complete').set('Authorization', auth);
    expect(missingLesson.status).toBe(404);

    const incompleteCertificate = await request(app).post('/api/progress/certificado/emitir').set('Authorization', auth);
    expect(incompleteCertificate.status).toBe(400);
    await run("UPDATE progresso_modulo SET status='concluido', percentual=100 WHERE usuario_id=?", [user.id]);
    const certificate = await request(app).post('/api/progress/certificado/emitir').set('Authorization', auth);
    expect(certificate.status).toBe(201);
    expect(certificate.body.dados.codigo).toMatch(/^TM-/);
  });

  test('rejeita prática inexistente e diário ausente sem salvar evidência', async () => {
    const user = await createUser('pratica-invalida@test.local');
    const auth = `Bearer ${tokenFor(user.id)}`;
    const invalidPractice = await request(app).post('/api/progress/pratica/finish').set('Authorization', auth)
      .field('praticaId', '999').field('diarioBordo', validDiary)
      .attach('foto', png, { filename: 'evidencia.png', contentType: 'image/png' });
    expect(invalidPractice.status).toBe(404);
    const missingDiary = await request(app).post('/api/progress/pratica/finish').set('Authorization', auth)
      .field('praticaId', '1').attach('foto', png, { filename: 'evidencia.png', contentType: 'image/png' });
    expect(missingDiary.status).toBe(400);
    expect(await all('SELECT * FROM evidencias')).toHaveLength(1);
  });

  test('cadastro registra perfil e estados iniciais, login não expõe senha', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      nome: 'Novo Perfil', email: 'cadastro@test.local', senha: 'Senha_segura_123', nivel_ensino: 'Fundamental I'
    });
    expect(registration.status).toBe(201);
    const userId = registration.body.dados.id;
    expect((await all('SELECT estado_acesso FROM progresso_modulo WHERE usuario_id = ? ORDER BY modulo_id', [userId])).map((row) => row.estado_acesso))
      .toEqual(['available', 'locked']);

    const login = await request(app).post('/api/auth/login').send({ email: 'cadastro@test.local', senha: 'Senha_segura_123' });
    expect(login.status).toBe(200);
    expect(login.body.dados.token).toBeTruthy();
    expect(login.body.dados.usuario.senha).toBeUndefined();
  });

  test('diagnostic baseline does not change onboarding state', async () => {
    const user = await createUser('diagnostico@test.local');
    const progressBefore = await all('SELECT modulo_id, status, percentual, estado_acesso FROM progresso_modulo WHERE usuario_id = ? ORDER BY modulo_id', [user.id]);
    const contentPath = path.join(isolatedDataRoot, 'diagnostic-fixture.json');
    const questions = Array.from({ length: 10 }, (_, index) => ({
      id: `q${index + 1}`,
      prompt: `Questão sintética ${index + 1}`,
      correctOptionId: 'A',
      options: [
        { id: 'A', label: 'Alternativa A de fixture' },
        { id: 'B', label: 'Alternativa B de fixture' },
        { id: 'C', label: 'Alternativa C de fixture' },
        { id: 'D', label: 'Alternativa D de fixture' }
      ]
    }));
    fs.writeFileSync(contentPath, JSON.stringify({ metadata: { status: 'approved', version: 'fixture-1.0' }, questions }));
    process.env.DIAGNOSTIC_QUESTIONS_FILE = contentPath;
    const auth = `Bearer ${tokenFor(user.id)}`;

    const initial = await request(app).get('/api/diagnostic').set('Authorization', auth);
    expect(initial.status).toBe(200);
    expect(initial.body.dados.questions).toHaveLength(10);
    expect(initial.body.dados.questions[0].correctOptionId).toBeUndefined();

    const answers = questions.map((question, index) => ({ questionId: question.id, optionId: index === 0 ? 'B' : 'A' }));
    const submitted = await request(app).post('/api/diagnostic/submit').set('Authorization', auth).send({ answers });
    expect(submitted.status).toBe(201);
    expect(submitted.body.dados.pontuacao).toBe(9);
    const duplicate = await request(app).post('/api/diagnostic/submit').set('Authorization', auth).send({ answers });
    expect(duplicate.status).toBe(409);

    const resumed = await request(app).get('/api/diagnostic').set('Authorization', auth);
    expect(resumed.body.dados.status).toBe('completed');
    expect(resumed.body.dados.questions).toHaveLength(10);
    expect(resumed.body.dados.questions.every((question) => question.correctOptionId === undefined)).toBe(true);
    expect((await all('SELECT onboarding_concluido FROM usuarios WHERE id = ?', [user.id]))[0].onboarding_concluido).toBe(0);
    expect(await all('SELECT modulo_id, status, percentual, estado_acesso FROM progresso_modulo WHERE usuario_id = ? ORDER BY modulo_id', [user.id])).toEqual(progressBefore);
    expect((await all('SELECT pontuacao, total_questoes, versao_conteudo FROM diagnosticos WHERE usuario_id = ?', [user.id]))[0])
      .toMatchObject({ pontuacao: 9, total_questoes: 10, versao_conteudo: 'fixture-1.0' });

    delete process.env.DIAGNOSTIC_QUESTIONS_FILE;
  });

  test('onboarding remains available without a diagnostic attempt', async () => {
    const user = await createUser('onboarding-without-diagnostic@test.local');
    const response = await request(app).patch('/api/auth/onboarding').set('Authorization', `Bearer ${tokenFor(user.id)}`);
    expect(response.status).toBe(200);
    expect((await all('SELECT onboarding_concluido FROM usuarios WHERE id = ?', [user.id]))[0].onboarding_concluido).toBe(1);
  });
  test('concede Pensador Computacional somente após os quatro pilares e sem duplicar a conquista', async () => {
    const concepts = [
      ['Decomposição', 'decomposição'],
      ['Padrões', 'padrões'],
      ['Abstração', 'abstração'],
      ['Algoritmos', 'algoritmos']
    ];
    for (const [index, [title, type]] of concepts.entries()) {
      await run('INSERT INTO praticas (id, modulo_id, tipo, titulo) VALUES (?, 1, ?, ?)', [3 + index, type, title]);
    }
    const user = await createUser('maker-badges@test.local');
    const auth = `Bearer ${tokenFor(user.id)}`;
    let lastResponse;
    for (let index = 0; index < concepts.length; index++) {
      lastResponse = await request(app).post('/api/progress/pratica/finish').set('Authorization', auth)
        .field('praticaId', String(3 + index)).field('diarioBordo', validDiary)
        .attach('foto', png, { filename: `maker-${index}.png`, contentType: 'image/png' });
      expect(lastResponse.status).toBe(201);
    }
    expect(lastResponse.body.dados.novasConquistas.map((badge) => badge.code)).toContain('pensador-computacional');
    const badges = await request(app).get('/api/progress/conquistas').set('Authorization', auth);
    expect(badges.body.dados.find((badge) => badge.codigo === 'pensador-computacional').desbloqueado).toBe(true);
    expect(await all('SELECT * FROM conquistas_usuario WHERE usuario_id = ? AND codigo = ?', [user.id, 'pensador-computacional'])).toHaveLength(1);
  });
});
