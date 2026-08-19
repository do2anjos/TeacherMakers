const db = require('../config/database');

const contentModel = {
  findAllModulos: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM modulos ORDER BY ordem ASC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findAulasByModulo: (moduloId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM aulas WHERE modulo_id = ? ORDER BY ordem ASC', [moduloId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findAulaById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.*, m.titulo as modulo_titulo
        FROM aulas a
        JOIN modulos m ON m.id = a.modulo_id
        WHERE a.id = ?
      `;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findQuizByAulaId: (aulaId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT q.id as quiz_id, qt.id as id, qt.pergunta, qt.ordem as questao_ordem
        FROM quizzes q
        JOIN questoes qt ON qt.quiz_id = q.id
        WHERE q.aula_id = ?
        ORDER BY qt.ordem ASC
      `;
      db.all(query, [aulaId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findOpcoesByQuestaoId: (questaoId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM opcoes WHERE questoes_id = ? ORDER BY ordem ASC', [questaoId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findPraticasByModulo: (moduloId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM praticas WHERE modulo_id = ?', [moduloId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findEtapasByPratica: (praticaId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM etapas_pratica WHERE pratica_id = ? ORDER BY ordem ASC', [praticaId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findPraticaById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, m.titulo as modulo_titulo
        FROM praticas p
        JOIN modulos m ON m.id = p.modulo_id
        WHERE p.id = ?
      `;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findAllAulas: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM aulas ORDER BY modulo_id ASC, ordem ASC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findAllPraticas: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM praticas', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = contentModel;
