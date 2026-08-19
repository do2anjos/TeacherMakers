const responseHelper = {
  sucesso: (res, dados, status = 200, mensagem = null) => {
    return res.status(status).json({
      sucesso: true,
      mensagem,
      dados
    });
  },

  erro: (res, mensagem, status = 400, stack = null) => {
    return res.status(status).json({
      sucesso: false,
      erro: mensagem,
      ...(process.env.NODE_ENV === 'development' && { stack })
    });
  }
};

module.exports = responseHelper;
