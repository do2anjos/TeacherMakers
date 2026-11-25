const progressService = require('../services/progressService');
const responseHelper = require('../utils/responseHelper');
const { validateImage } = require('../utils/imageValidation');
const db = require('../config/database');

const progressController = {
  getEvidenciaFoto: async (req, res, next) => {
    try {
      const row = await new Promise((resolve, reject) => {
        db.get('SELECT foto_blob, foto_mime FROM evidencias WHERE foto_token = ?', [req.params.token], (error, data) => error ? reject(error) : resolve(data));
      });
      if (!row || !row.foto_blob) {
        const erro = new Error('Foto da evidência não encontrada.');
        erro.status = 404;
        throw erro;
      }
      const bytes = row.foto_blob instanceof Buffer ? row.foto_blob : Buffer.from(row.foto_blob);
      res.set('Content-Type', row.foto_mime || 'application/octet-stream');
      res.set('Cache-Control', 'private, max-age=3600');
      return res.send(bytes);
    } catch (erro) {
      next(erro);
    }
  },


  listarConquistas: async (req, res, next) => {
    try {
      const conquistas = await progressService.listarConquistas(req.user.id);
      return responseHelper.sucesso(res, conquistas);
    } catch (erro) { next(erro); }
  },

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

      if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
        const erro = new Error('Usuário inválido.');
        erro.status = 401;
        throw erro;
      }

      if (!praticaId || !/^\d+$/.test(String(praticaId)) || Number(praticaId) <= 0) {
        const erro = new Error('ID da prática é obrigatório.');
        erro.status = 400;
        throw erro;
      }

      const diarioNormalizado = typeof diarioBordo === 'string' ? diarioBordo.trim() : '';
      if (!diarioNormalizado) {
        const erro = new Error('Diário de Bordo é obrigatório.');
        erro.status = 400;
        throw erro;
      }

      if (Array.from(diarioNormalizado).length < 100) {
        const erro = new Error('O Diário de Bordo deve conter pelo menos 100 caracteres.');
        erro.status = 422;
        throw erro;
      }

      const imageError = validateImage(req.file);
      if (imageError) {
        const erro = new Error(imageError);
        erro.status = req.file ? 415 : 400;
        throw erro;
      }

      const resultado = await progressService.finalizarPratica(userId, Number(praticaId), diarioNormalizado, req.file);
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
