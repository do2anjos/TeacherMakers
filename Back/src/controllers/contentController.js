const contentService = require('../services/contentService');
const responseHelper = require('../utils/responseHelper');

const contentController = {
  getModulos: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const modulos = await contentService.getModulosComProgresso(userId);
      return responseHelper.sucesso(res, modulos);
    } catch (erro) {
      next(erro);
    }
  },

  getAulasByModulo: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { moduloId } = req.params;
      const aulas = await contentService.getAulasByModulo(userId, moduloId);
      return responseHelper.sucesso(res, aulas);
    } catch (erro) {
      next(erro);
    }
  },

  getAulaDetalhes: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const aula = await contentService.getAulaDetalhes(userId, id);
      return responseHelper.sucesso(res, aula);
    } catch (erro) {
      next(erro);
    }
  },

  getPraticasByModulo: async (req, res, next) => {
    try {
      const { moduloId } = req.params;
      const praticas = await contentService.getPraticasByModulo(moduloId);
      return responseHelper.sucesso(res, praticas);
    } catch (erro) {
      next(erro);
    }
  },

  getPraticaDetalhes: async (req, res, next) => {
    try {
      const { id } = req.params;
      const pratica = await contentService.getPraticaDetalhes(id);
      return responseHelper.sucesso(res, pratica);
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = contentController;
