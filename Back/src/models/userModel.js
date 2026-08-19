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
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO usuarios (nome, email, senha, nivel_ensino)
        VALUES (?, ?, ?, ?)
      `;
      db.run(query, [nome, email, senha, nivel_ensino], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...userData });
      });
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
