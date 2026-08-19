const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const logger = require('../config/logger');

const SALT_ROUNDS = 10;
const JWT_EXPIRATION = '7d';

const authService = {
  register: async (dadosUsuario) => {
    const { email, senha } = dadosUsuario;

    const usuarioExistente = await userModel.findByEmail(email);
    if (usuarioExistente) {
      const erro = new Error('E-mail já cadastrado no sistema.');
      erro.status = 400;
      throw erro;
    }

    const senhaCriptografada = await bcrypt.hash(senha, SALT_ROUNDS);

    const novoUsuario = await userModel.create({
      ...dadosUsuario,
      senha: senhaCriptografada
    });

    logger.info(`Novo usuário registrado: ${email}`);

    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    return usuarioSemSenha;
  },

  login: async (email, senha) => {
    const usuario = await userModel.findByEmail(email);
    if (!usuario) {
      const erro = new Error('E-mail ou senha inválidos.');
      erro.status = 401;
      throw erro;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      const erro = new Error('E-mail ou senha inválidos.');
      erro.status = 401;
      throw erro;
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    logger.info(`Usuário logado: ${email}`);

    const { senha: _, ...usuarioSemSenha } = usuario;
    return {
      usuario: usuarioSemSenha,
      token
    };
  }
};

module.exports = authService;
