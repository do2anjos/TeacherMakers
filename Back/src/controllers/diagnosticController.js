const diagnosticService = require('../services/diagnosticService');
const responseHelper = require('../utils/responseHelper');

const diagnosticController = {
  get: async (req, res, next) => {
    try { return responseHelper.sucesso(res, await diagnosticService.getForUser(req.user.id)); }
    catch (error) { next(error); }
  },
  submit: async (req, res, next) => {
    try { return responseHelper.sucesso(res, await diagnosticService.submit(req.user.id, req.body?.answers), 201, 'Pré-teste registrado.'); }
    catch (error) { next(error); }
  }
};

module.exports = diagnosticController;
