const contentModel = require('../models/contentModel');
const progressModel = require('../models/progressModel');
const userModel = require('../models/userModel');

const UNLINKED_PRATICA_ORDEM_BASE = 999;

function isIntroModule(modulo) {
  return modulo.id === 0 || modulo.titulo.toLowerCase().includes('introdução');
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
          status: (isIntro && user.onboarding_concluido) ? 'concluido' : (aulaProgressMap[aula.id] || 'pendente'),
          ordem: aula.ordem
        });

        const praticaVinculada = praticas.find(p => p.aula_id === aula.id);
        if (praticaVinculada) {
          items.push({
            id: praticaVinculada.id,
            tipo: 'pratica',
            titulo: praticaVinculada.titulo,
            subtitulo: praticaVinculada.subtitulo,
            status: (isIntro && user.onboarding_concluido) ? 'concluido' : (praticaProgressMap[praticaVinculada.id] || 'pendente'),
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
          status: (isIntro && user.onboarding_concluido) ? 'concluido' : (praticaProgressMap[p.id] || 'pendente'),
          ordem: UNLINKED_PRATICA_ORDEM_BASE + p.id
        });
      });

      const totalItens = items.length;
      const itensConcluidos = items.filter(item => item.status === 'concluido').length;
      const percentual = totalItens ? Math.round((itensConcluidos / totalItens) * 100) : (isIntro && user.onboarding_concluido ? 100 : 0);

      const trilhaOrdenada = items.sort((a, b) => a.ordem - b.ordem).map(item => {
        const isCurrent = !currentFoundGlobal && item.status !== 'concluido';
        if (isCurrent) currentFoundGlobal = true;
        return { ...item, isCurrent };
      });

      fullModulos.push({
        ...m,
        isIntro,
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

  getPraticasByModulo: async (moduloId) => {
    const praticas = await contentModel.findPraticasByModulo(moduloId);

    const praticasComEtapas = await Promise.all(praticas.map(async (p) => {
      const etapas = await contentModel.findEtapasByPratica(p.id);
      return { ...p, etapas };
    }));

    return praticasComEtapas;
  },

  getPraticaDetalhes: async (id) => {
    const pratica = await contentModel.findPraticaById(id);
    if (!pratica) {
      const erro = new Error('Prática não encontrada.');
      erro.status = 404;
      throw erro;
    }

    const etapas = await contentModel.findEtapasByPratica(id);

    return { ...pratica, etapas };
  }
};

module.exports = contentService;
