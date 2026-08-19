const authService = require('../services/authService');
const userModel = require('../models/userModel');
const responseHelper = require('../utils/responseHelper');

const authController = {
  register: async (req, res, next) => {
    try {
      const dadosUsuario = req.body;

      if (!dadosUsuario.nome || !dadosUsuario.email || !dadosUsuario.senha || !dadosUsuario.nivel_ensino) {
        const erro = new Error('Todos os campos são obrigatórios.');
        erro.status = 400;
        throw erro;
      }

      const user = await authService.register(dadosUsuario);
      return responseHelper.sucesso(res, user, 201, 'Usuário criado com sucesso!');
    } catch (erro) {
      next(erro);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        const erro = new Error('E-mail e senha são obrigatórios.');
        erro.status = 400;
        throw erro;
      }

      const resultado = await authService.login(email, senha);
      return responseHelper.sucesso(res, resultado, 200, 'Login realizado com sucesso!');
    } catch (erro) {
      next(erro);
    }
  },

  completeOnboarding: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const sucesso = await userModel.completeOnboarding(userId);
      if (!sucesso) {
        const erro = new Error('Usuário não encontrado ou onboarding já concluído.');
        erro.status = 404;
        throw erro;
      }
      return responseHelper.sucesso(res, null, 200, 'Onboarding concluído com sucesso!');
    } catch (erro) {
      next(erro);
    }
  }
};

module.exports = authController;
