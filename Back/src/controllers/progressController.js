const progressService = require('../services/progressService');
const responseHelper = require('../utils/responseHelper');

const progressController = {
  completarAula: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { aulaId } = req.params;
      const resultado = await progressService.completarAula(userId, aulaId);
      return responseHelper.sucesso(res, resultado, 200, 'Aula concluída com sucesso!');
    } catch (erro) {
      next(erro);
    }
  },

  submeterQuiz: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { questaoId, opcaoId } = req.body;

      if (!questaoId || !opcaoId) {
        const erro = new Error('ID da questão e da opção são obrigatórios.');
        erro.status = 400;
        throw erro;
      }

      const resultado = await progressService.submeterRespostaQuiz(userId, questaoId, opcaoId);
      return responseHelper.sucesso(res, resultado);
    } catch (erro) {
      next(erro);
    }
  },

  finalizarPratica: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { praticaId, diarioBordo } = req.body;
      const fotoPath = req.file ? req.file.path : null;

      if (!praticaId) {
        const erro = new Error('ID da prática é obrigatório.');
        erro.status = 400;
        throw erro;
      }

      if (!diarioBordo || !diarioBordo.trim()) {
        const erro = new Error('Diário de Bordo é obrigatório.');
        erro.status = 400;
        throw erro;
      }

      if (!fotoPath) {
        const erro = new Error('Foto da Atividade é obrigatória.');
        erro.status = 400;
        throw erro;
      }

      const resultado = await progressService.finalizarPratica(userId, praticaId, diarioBordo.trim(), fotoPath);
      return responseHelper.sucesso(res, resultado, 201, 'Prática e evidências salvas com sucesso!');
    } catch (erro) {
      next(erro);
    }
  },

  emitirCertificado: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resultado = await progressService.emitirCertificado(userId);
      return responseHelper.sucesso(res, resultado, 201, 'Certificado gerado com sucesso!');
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = progressController;
