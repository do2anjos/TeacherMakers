const db = require('../config/database');

const userModel = {
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, nome, email, nivel_ensino, data_cadastro, onboarding_concluido FROM usuarios WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  create: (userData) => {
    const { nome, email, senha, nivel_ensino } = userData;
    return db.withTransaction(async (tx) => {
      const result = await tx.run(`
        INSERT INTO usuarios (nome, email, senha, nivel_ensino)
        VALUES (?, ?, ?, ?)
      `, [nome, email, senha, nivel_ensino]);
      const modulos = await tx.all('SELECT id, ordem FROM modulos ORDER BY ordem ASC');
      for (const [index, modulo] of modulos.entries()) {
        await tx.run(`
          INSERT INTO progresso_modulo (usuario_id, modulo_id, status, percentual, estado_acesso)
          VALUES (?, ?, 'pendente', 0, ?)
        `, [result.lastID, modulo.id, index === 0 ? 'available' : 'locked']);
      }
      return { id: result.lastID, ...userData };
    });
  },

  completeOnboarding: (userId) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE usuarios SET onboarding_concluido = 1 WHERE id = ?', [userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }
};

module.exports = userModel;
