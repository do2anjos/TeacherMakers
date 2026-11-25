const progressModel = require('../models/progressModel');
const contentModel = require('../models/contentModel');
const contentService = require('./contentService');
const db = require('../config/database');
const storage = require('../config/storage');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const CERTIFICATE_HOURS = 40;

const progressService = {
  listarConquistas: async (userId) => {
    const earned = await queryAll(db, 'SELECT codigo, data_conquista FROM conquistas_usuario WHERE usuario_id = ?', [userId]);
    const earnedByCode = new Map(earned.map((row) => [row.codigo, row.data_conquista]));
    return [
      { codigo: 'primeiro-circuito', nome: 'Primeiro Circuito', descricao: 'Concluiu a primeira prática de circuitos.' },
      { codigo: 'mestre-decomposicao', nome: 'Mestre da Decomposição', descricao: 'Concluiu a prática de Decomposição.' },
      { codigo: 'cacador-padroes', nome: 'Caçador de Padrões', descricao: 'Concluiu a prática de Reconhecimento de Padrões.' },
      { codigo: 'pensador-computacional', nome: 'Pensador Computacional', descricao: 'Concluiu práticas dos quatro pilares do pensamento computacional.' }
    ].map((badge) => ({ ...badge, desbloqueado: earnedByCode.has(badge.codigo), dataConquista: earnedByCode.get(badge.codigo) || null }));
  },

  completarAula: async (userId, aulaId) => {
    const aula = await contentModel.findAulaById(aulaId);
    if (!aula) {
      const erro = new Error('Aula não encontrada.');
      erro.status = 404;
      throw erro;
    }
    await contentService.assertModuleAvailable(userId, aula.modulo_id);

    const quizQuestions = await contentModel.findQuizByAulaId(aulaId);
    if (quizQuestions.length) {
      const answers = await progressModel.getQuizAnswersForAula(userId, aulaId);
      if (answers.length !== quizQuestions.length || answers.some((answer) => !answer.acertou)) {
        const erro = new Error('Responda corretamente a todas as questões do quiz antes de concluir a aula.');
        erro.status = 403;
        throw erro;
      }
    }

    await progressModel.upsertAulaProgress(userId, aulaId, 'concluido', true);
    await progressService.recalcularModulo(userId, aula.modulo_id);

    return { aulaId, moduloId: aula.modulo_id, status: 'concluido' };
  },

  recalcularModulo: async (userId, moduloId, executor = db) => {
    const [aulasTotais, praticasTotais, aulasProgresso, praticasProgresso, modulos] = await Promise.all([
      queryAll(executor, 'SELECT id FROM aulas WHERE modulo_id = ?', [moduloId]),
      queryAll(executor, 'SELECT id FROM praticas WHERE modulo_id = ?', [moduloId]),
      queryAll(executor, 'SELECT aula_id, status FROM progresso_aula WHERE usuario_id = ?', [userId]),
      queryAll(executor, 'SELECT pratica_id, status FROM progresso_pratica WHERE usuario_id = ?', [userId]),
      queryAll(executor, 'SELECT id, ordem FROM modulos ORDER BY ordem ASC', [])
    ]);

    const aulasModuloIds = aulasTotais.map(a => a.id);
    const praticasModuloIds = praticasTotais.map(p => p.id);

    const aulasConcluidas = aulasProgresso.filter(p =>
      aulasModuloIds.includes(p.aula_id) && p.status === 'concluido'
    );
    const praticasConcluidas = praticasProgresso.filter(p =>
      praticasModuloIds.includes(p.pratica_id) && p.status === 'concluido'
    );

    const totalItens = aulasTotais.length + praticasTotais.length;
    const totalConcluido = aulasConcluidas.length + praticasConcluidas.length;
    const percentual = totalItens ? Math.round((totalConcluido / totalItens) * 100) : 0;
    const status = percentual === 100 ? 'concluido' : (percentual > 0 ? 'em_andamento' : 'pendente');

    await queryRun(executor, `
      INSERT INTO progresso_modulo (usuario_id, modulo_id, status, percentual, estado_acesso)
      VALUES (?, ?, ?, ?, 'bloqueado')
      ON CONFLICT(usuario_id, modulo_id) DO UPDATE SET
        status = excluded.status,
        percentual = excluded.percentual,
        data_conclusao = CASE WHEN excluded.status = 'concluido' THEN CURRENT_TIMESTAMP ELSE data_conclusao END
    `, [userId, moduloId, status, percentual]);

    let previousComplete = true;
    for (const modulo of modulos) {
      const access = previousComplete ? 'available' : 'locked';
      await queryRun(executor, `
        INSERT INTO progresso_modulo (usuario_id, modulo_id, status, percentual, estado_acesso)
        VALUES (?, ?, 'pendente', 0, ?)
        ON CONFLICT(usuario_id, modulo_id) DO UPDATE SET estado_acesso = excluded.estado_acesso
      `, [userId, modulo.id, access]);
      const row = await queryGet(executor, 'SELECT status, percentual FROM progresso_modulo WHERE usuario_id = ? AND modulo_id = ?', [userId, modulo.id]);
      previousComplete = !!row && row.status === 'concluido' && row.percentual === 100;
    }

  },

  submeterRespostaQuiz: async (userId, questaoId, opcaoId) => {
    const questao = await contentModel.findQuestaoById(questaoId);
    if (!questao) { const erro = new Error('Questão não encontrada.'); erro.status = 404; throw erro; }
    await contentService.assertModuleAvailable(userId, questao.modulo_id);
    const opcao = await progressModel.findOpcaoById(opcaoId);
    if (!opcao || opcao.questoes_id !== parseInt(questaoId)) {
      const erro = new Error('Opção inválida para esta questão.');
      erro.status = 400;
      throw erro;
    }

    const acertou = !!opcao.correta;
    await progressModel.saveRespostaQuiz(userId, questaoId, opcaoId, acertou);

    return {
      acertou,
      mensagem: acertou ? 'Resposta correta!' : 'Resposta incorreta. Tente novamente.'
    };
  },

  finalizarPratica: async (userId, praticaId, diarioBordo, fotoPath) => {
    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      const erro = new Error('Usuário inválido.'); erro.status = 401; throw erro;
    }
    if (typeof diarioBordo !== 'string' || Array.from(diarioBordo.trim()).length < 100) {
      const erro = new Error('O Diário de Bordo deve conter pelo menos 100 caracteres.'); erro.status = 422; throw erro;
    }
    const { validateImage } = require('../utils/imageValidation');
    const imageError = validateImage(fotoPath);
    if (imageError) { const erro = new Error(imageError); erro.status = 415; throw erro; }

    const practice = await contentModel.findPraticaById(praticaId);
    if (!practice) { const erro = new Error('Prática não encontrada.'); erro.status = 404; throw erro; }
    await contentService.assertModuleAvailable(userId, practice.modulo_id);
    const user = await queryGet(db, 'SELECT id FROM usuarios WHERE id = ?', [userId]);
    if (!user) { const erro = new Error('Usuário não encontrado.'); erro.status = 401; throw erro; }

    // A imagem é gravada como BLOB no banco (Turso/SQLite), sem depender de disco local.
    // Isso elimina a perda de evidências em filesystems efêmeros (ex.: Render free).
    const fotoToken = crypto.randomUUID();
    const fotoMime = fotoPath.mimetype || 'application/octet-stream';
    const fotoBuffer = Buffer.from(fotoPath.buffer);

    try {
      const result = await db.withTransaction(async (tx) => {
        await queryRun(tx, `
          INSERT INTO progresso_pratica (usuario_id, pratica_id, status, etapa_atual)
          VALUES (?, ?, 'concluido', 100)
          ON CONFLICT(usuario_id, pratica_id) DO UPDATE SET
            status = 'concluido', etapa_atual = 100, data_conclusao = CURRENT_TIMESTAMP
        `, [userId, praticaId]);
        await progressService.recalcularModulo(userId, practice.modulo_id, tx);
        const progresso = await queryGet(tx, 'SELECT id FROM progresso_pratica WHERE usuario_id = ? AND pratica_id = ?', [userId, praticaId]);
        if (!progresso) throw new Error('Não foi possível localizar o progresso recém-salvo.');

        const evidence = await queryRun(tx, `
          INSERT INTO evidencias (progresso_pratica_id, diario_bordo, foto_url, foto_blob, foto_mime, foto_token)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [progresso.id, diarioBordo.trim(), `/api/progress/evidencias/${fotoToken}/foto`, fotoBuffer, fotoMime, fotoToken]);
        const saved = await queryGet(tx, 'SELECT data_envio FROM evidencias WHERE id = ?', [evidence.lastID]);

        const newBadges = await awardPracticeAchievements(tx, userId, practice);
        const moduleProgress = await queryGet(tx, 'SELECT status, percentual FROM progresso_modulo WHERE usuario_id = ? AND modulo_id = ?', [userId, practice.modulo_id]);
        const modules = await queryAll(tx, 'SELECT id, titulo, ordem FROM modulos ORDER BY ordem ASC', []);
        const nextModule = moduleProgress?.status === 'concluido' && Number(moduleProgress.percentual) === 100
          ? modules.find((module) => module.ordem > practice.modulo_ordem) || null
          : { id: practice.modulo_id, titulo: practice.modulo_titulo, continuarNoModulo: true };

        return {
          sucesso: true,
          praticaId,
          moduloId: practice.modulo_id,
          evidenciaId: evidence.lastID,
          protocolo: `TM-E-${evidence.lastID}`,
          fotoUrl: `/api/progress/evidencias/${fotoToken}/foto`,
          dataEnvio: saved?.data_envio || new Date().toISOString(),
          progressoModulo: moduleProgress || { status: 'em_andamento', percentual: 0 },
          proximoPasso: nextModule ? { moduloId: nextModule.id, titulo: nextModule.titulo } : null,
          novasConquistas: newBadges
        };
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  emitirCertificado: async (userId) => {
    const [modulos, progressoModulos] = await Promise.all([
      contentModel.findAllModulos(),
      progressModel.getUserModulosProgress(userId)
    ]);

    const todosConcluidos = modulos.every(m => {
      const p = progressoModulos.find(prog => prog.modulo_id === m.id);
      return p && p.status === 'concluido' && p.percentual === 100;
    });

    if (!todosConcluidos) {
      const erro = new Error('Você precisa concluir todos os módulos antes de emitir o certificado.');
      erro.status = 400;
      throw erro;
    }

    const codigo = `TM-${userId}-${Date.now().toString(36).toUpperCase()}`;

    await progressModel.createCertificado(userId, codigo, CERTIFICATE_HOURS);

    return { codigo, cargaHoraria: CERTIFICATE_HOURS, dataEmissao: new Date() };
  },

  reconciliarArquivosOrfaos: async (executor = db) => {
    await storage.ensureStorage();
    const limpos = { temporarios: [], evidencias: [] };

    try {
      const tempFiles = await fs.readdir(storage.temporaryDir);
      for (const file of tempFiles) {
        if (file.endsWith('.part')) {
          const filePath = path.join(storage.temporaryDir, file);
          await fs.rm(filePath, { force: true }).catch(() => {});
          limpos.temporarios.push(file);
        }
      }
    } catch (_) {}

    try {
      const evidenceFiles = await fs.readdir(storage.evidenceDir);
      if (evidenceFiles.length > 0) {
        const rows = await queryAll(executor, 'SELECT foto_url FROM evidencias', []);
        const referencedFiles = new Set(
          rows.map((r) => (r.foto_url ? decodeURIComponent(r.foto_url.split('/').pop()) : null)).filter(Boolean)
        );
        for (const file of evidenceFiles) {
          if (!referencedFiles.has(file)) {
            const filePath = path.join(storage.evidenceDir, file);
            await fs.rm(filePath, { force: true }).catch(() => {});
            limpos.evidencias.push(file);
          }
        }
      }
    } catch (_) {}

    return limpos;
  },

  reconcileOrphans: async (executor = db) => {
    return progressService.reconciliarArquivosOrfaos(executor);
  }
};

function queryAll(executor, sql, params) {
  if (executor !== db) return executor.all(sql, params);
  return new Promise((resolve, reject) => executor.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

function queryGet(executor, sql, params) {
  if (executor !== db) return executor.get(sql, params);
  return new Promise((resolve, reject) => executor.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function queryRun(executor, sql, params) {
  if (executor !== db) return executor.run(sql, params);
  return new Promise((resolve, reject) => executor.run(sql, params, function(error) {
    if (error) reject(error); else resolve({ lastID: this.lastID, changes: this.changes });
  }));
}

async function awardPracticeAchievements(executor, userId, practice) {
  const title = `${practice.titulo || ''} ${practice.tipo || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const candidates = [];
  if (title.includes('circuit')) candidates.push({ code: 'primeiro-circuito', name: 'Primeiro Circuito', description: 'Concluiu a primeira prática de circuitos.' });
  if (title.includes('decomposicao')) candidates.push({ code: 'mestre-decomposicao', name: 'Mestre da Decomposição', description: 'Concluiu a prática de Decomposição.' });
  if (title.includes('padroes')) candidates.push({ code: 'cacador-padroes', name: 'Caçador de Padrões', description: 'Concluiu a prática de Reconhecimento de Padrões.' });

  const completed = await executor.all(`
    SELECT p.titulo, p.tipo FROM praticas p
    JOIN progresso_pratica pp ON pp.pratica_id = p.id
    WHERE pp.usuario_id = ? AND pp.status = 'concluido'
  `, [userId]);
  const concepts = new Set(completed.map((item) => `${item.titulo || ''} ${item.tipo || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()));
  if (['decomposicao', 'padroes', 'abstracao', 'algoritmos'].every((concept) => [...concepts].some((value) => value.includes(concept)))) {
    candidates.push({ code: 'pensador-computacional', name: 'Pensador Computacional', description: 'Concluiu práticas dos quatro pilares do pensamento computacional.' });
  }

  const awarded = [];
  for (const badge of candidates) {
    const result = await executor.run('INSERT OR IGNORE INTO conquistas_usuario (usuario_id, codigo) VALUES (?, ?)', [userId, badge.code]);
    if (result.changes > 0) awarded.push(badge);
  }
  return awarded;
}

module.exports = progressService;
