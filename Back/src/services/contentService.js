const contentModel = require('../models/contentModel');
const progressModel = require('../models/progressModel');
const userModel = require('../models/userModel');

const UNLINKED_PRATICA_ORDEM_BASE = 999;

function isIntroModule(modulo) {
  return modulo.id === 0 || modulo.titulo.toLowerCase().includes('introdução');
}

async function assertModuleAvailable(userId, moduleId) {
  const [modules, user] = await Promise.all([
    contentModel.findAllModulos(),
    userModel.findById(userId)
  ]);
  const moduleIndex = modules.findIndex((module) => Number(module.id) === Number(moduleId));
  if (moduleIndex < 0) { const error = new Error('Módulo não encontrado.'); error.status = 404; throw error; }
  const onboardingConcluido = !!user?.onboarding_concluido;
  const progress = await progressModel.getUserModulosProgress(userId);
  const priorComplete = modules.slice(0, moduleIndex).every((module) => {
    if (onboardingConcluido && isIntroModule(module)) return true;
    const row = progress.find((item) => Number(item.modulo_id) === Number(module.id));
    return row?.status === 'concluido' && Number(row.percentual) === 100;
  });
  const currentProgress = progress.find((item) => Number(item.modulo_id) === Number(moduleId));
  if (moduleIndex > 0 && !priorComplete && !(currentProgress?.status === 'concluido' && Number(currentProgress.percentual) === 100)) {
    const error = new Error('Este módulo ainda está bloqueado. Conclua os pré-requisitos da trilha.');
    error.status = 403;
    throw error;
  }
}

const contentService = {
  getModulosComProgresso: async (userId) => {
    const [modulos, user, aulaProgress, praticaProgress, allAulas, allPraticas] = await Promise.all([
      contentModel.findAllModulos(),
      userModel.findById(userId),
      progressModel.getUserAulasProgress(userId),
      progressModel.getUserPraticasProgress(userId),
      contentModel.findAllAulas(),
      contentModel.findAllPraticas()
    ]);

    const aulaProgressMap = aulaProgress.reduce((acc, p) => {
      acc[p.aula_id] = p.status;
      return acc;
    }, {});

    const praticaProgressMap = praticaProgress.reduce((acc, p) => {
      acc[p.pratica_id] = p.status;
      return acc;
    }, {});

    let currentFoundGlobal = false;
    let priorModulesComplete = true;
    const fullModulos = [];

    for (const m of modulos) {
      const isIntro = isIntroModule(m);

      const aulas = allAulas.filter(a => a.modulo_id === m.id);
      const praticas = allPraticas.filter(p => p.modulo_id === m.id);

      let items = [];

      aulas.forEach(aula => {
        items.push({
          id: aula.id,
          tipo: 'aula',
          titulo: aula.titulo,
          subtitulo: aula.subtitulo,
          descricao: aula.descricao,
          status: aulaProgressMap[aula.id] || 'pendente',
          ordem: aula.ordem
        });

        const praticaVinculada = praticas.find(p => p.aula_id === aula.id);
        if (praticaVinculada) {
          items.push({
            id: praticaVinculada.id,
            tipo: 'pratica',
            titulo: praticaVinculada.titulo,
            subtitulo: praticaVinculada.subtitulo,
            status: praticaProgressMap[praticaVinculada.id] || 'pendente',
            ordem: aula.ordem + 0.5
          });
        }
      });

      praticas.filter(p => !p.aula_id).forEach(p => {
        items.push({
          id: p.id,
          tipo: 'pratica',
          titulo: p.titulo,
          subtitulo: p.subtitulo,
          status: praticaProgressMap[p.id] || 'pendente',
          ordem: UNLINKED_PRATICA_ORDEM_BASE + p.id
        });
      });

      const totalItens = items.length;
      const itensConcluidos = items.filter(item => item.status === 'concluido').length;
      const percentual = totalItens ? Math.round((itensConcluidos / totalItens) * 100) : 0;
      const moduleComplete = (isIntro && user?.onboarding_concluido) || percentual === 100;
      const acesso = priorModulesComplete ? 'available' : 'locked';
      priorModulesComplete = priorModulesComplete && moduleComplete;

      const trilhaOrdenada = items.sort((a, b) => a.ordem - b.ordem).map(item => {
        const isCurrent = acesso === 'available' && !currentFoundGlobal && item.status !== 'concluido';
        if (isCurrent) currentFoundGlobal = true;
        return { ...item, isCurrent };
      });

      fullModulos.push({
        ...m,
        isIntro,
        acesso,
        bloqueado: acesso === 'locked',
        status: percentual === 100 ? 'concluido' : (percentual > 0 ? 'em_andamento' : 'pendente'),
        percentual,
        totalItens,
        itensConcluidos,
        trilha: trilhaOrdenada
      });
    }

    return fullModulos;
  },

  getAulasByModulo: async (userId, moduloId) => {
    await assertModuleAvailable(userId, moduloId);
    const [aulas, progress] = await Promise.all([
      contentModel.findAulasByModulo(moduloId),
      progressModel.getUserAulasProgress(userId)
    ]);

    const progressMap = progress.reduce((acc, p) => {
      acc[p.aula_id] = { status: p.status, video_assistido: p.video_assistido };
      return acc;
    }, {});

    return aulas.map(a => ({
      ...a,
      status: progressMap[a.id]?.status || 'pendente',
      video_assistido: progressMap[a.id]?.video_assistido || 0
    }));
  },

  getAulaDetalhes: async (userId, aulaId) => {
    const [aula, progress] = await Promise.all([
      contentModel.findAulaById(aulaId),
      progressModel.getUserAulasProgress(userId)
    ]);

    if (!aula) {
      const erro = new Error('Aula não encontrada.');
      erro.status = 404;
      throw erro;
    }
    await assertModuleAvailable(userId, aula.modulo_id);

    const progressoAula = progress.find(p => p.aula_id === parseInt(aulaId));
    const status = progressoAula ? progressoAula.status : 'pendente';
    const video_assistido = progressoAula ? !!progressoAula.video_assistido : false;

    const quizQuestoes = await contentModel.findQuizByAulaId(aulaId);

    let quizCompleto = [];
    if (quizQuestoes.length > 0) {
      quizCompleto = await Promise.all(quizQuestoes.map(async (q) => {
        const opcoes = await contentModel.findOpcoesByQuestaoId(q.id);
        return { ...q, opcoes };
      }));
    }

    return {
      ...aula,
      status,
      video_assistido,
      quiz: quizCompleto
    };
  },

  getPraticasByModulo: async (userId, moduloId) => {
    await assertModuleAvailable(userId, moduloId);
    const praticas = await contentModel.findPraticasByModulo(moduloId);

    const praticasComEtapas = await Promise.all(praticas.map(async (p) => {
      const etapas = await contentModel.findEtapasByPratica(p.id);
      return { ...p, etapas };
    }));

    return praticasComEtapas;
  },

  getPraticaDetalhes: async (userId, id) => {
    const pratica = await contentModel.findPraticaById(id);
    if (!pratica) {
      const erro = new Error('Prática não encontrada.');
      erro.status = 404;
      throw erro;
    }
    await assertModuleAvailable(userId, pratica.modulo_id);

    const etapas = await contentModel.findEtapasByPratica(id);

    return { ...pratica, etapas };
  }
};

contentService.assertModuleAvailable = assertModuleAvailable;

module.exports = contentService;
