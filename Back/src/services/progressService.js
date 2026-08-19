const progressModel = require('../models/progressModel');
const contentModel = require('../models/contentModel');
const logger = require('../config/logger');

const CERTIFICATE_HOURS = 40;

const progressService = {
  completarAula: async (userId, aulaId) => {
    const aula = await contentModel.findAulaById(aulaId);
    if (!aula) {
      const erro = new Error('Aula não encontrada.');
      erro.status = 404;
      throw erro;
    }

    await progressModel.upsertAulaProgress(userId, aulaId, 'concluido', true);
    await progressService.recalcularModulo(userId, aula.modulo_id);

    return { aulaId, moduloId: aula.modulo_id, status: 'concluido' };
  },

  recalcularModulo: async (userId, moduloId) => {
    const [aulasTotais, praticasTotais, aulasProgresso, praticasProgresso] = await Promise.all([
      contentModel.findAulasByModulo(moduloId),
      contentModel.findPraticasByModulo(moduloId),
      progressModel.getUserAulasProgress(userId),
      progressModel.getUserPraticasProgress(userId)
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

    await progressModel.upsertModuloProgress(userId, moduloId, status, percentual);

    logger.info(`Progresso do Módulo ${moduloId} atualizado para ${percentual}% (Usuário: ${userId})`);
  },

  submeterRespostaQuiz: async (userId, questaoId, opcaoId) => {
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
    const pratica = await contentModel.findPraticaById(praticaId);
    if (!pratica) {
      const erro = new Error('Prática não encontrada.');
      erro.status = 404;
      throw erro;
    }

    await progressModel.upsertProgressoPratica(userId, praticaId, 'concluido', 100);
    await progressService.recalcularModulo(userId, pratica.modulo_id);

    const progresso = await progressModel.findProgressoPratica(userId, praticaId);
    await progressModel.saveEvidencia(progresso.id, diarioBordo, fotoPath);

    logger.info(`Prática ${praticaId} finalizada por Usuário ${userId}`);
    return { sucesso: true, praticaId, moduloId: pratica.modulo_id };
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

    logger.info(`Certificado emitido: ${codigo} para Usuário ${userId}`);
    return { codigo, cargaHoraria: CERTIFICATE_HOURS, dataEmissao: new Date() };
  }
};

module.exports = progressService;
