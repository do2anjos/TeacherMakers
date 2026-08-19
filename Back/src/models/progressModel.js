const db = require('../config/database');

const progressModel = {
  getUserAulasProgress: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT aula_id, status, video_assistido FROM progresso_aula WHERE usuario_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getUserPraticasProgress: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT pratica_id, status, etapa_atual FROM progresso_pratica WHERE usuario_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getUserModulosProgress: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT modulo_id, status, percentual FROM progresso_modulo WHERE usuario_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  upsertAulaProgress: (userId, aulaId, status, videoAssistido) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO progresso_aula (usuario_id, aula_id, status, video_assistido)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(usuario_id, aula_id) DO UPDATE SET
          status = excluded.status,
          video_assistido = excluded.video_assistido,
          data_conclusao = CASE WHEN excluded.status = 'concluido' THEN CURRENT_TIMESTAMP ELSE data_conclusao END
      `;
      db.run(query, [userId, aulaId, status, videoAssistido ? 1 : 0], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  upsertModuloProgress: (userId, moduloId, status, percentual) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO progresso_modulo (usuario_id, modulo_id, status, percentual)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(usuario_id, modulo_id) DO UPDATE SET
          status = excluded.status,
          percentual = excluded.percentual,
          data_conclusao = CASE WHEN excluded.status = 'concluido' THEN CURRENT_TIMESTAMP ELSE data_conclusao END
      `;
      db.run(query, [userId, moduloId, status, percentual], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  findOpcaoById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM opcoes WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  saveRespostaQuiz: (userId, questaoId, opcaoId, acertou) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO resposta_quiz (usuario_id, questao_id, opcao_id, acertou)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(usuario_id, questao_id) DO UPDATE SET
          opcao_id = excluded.opcao_id,
          acertou = excluded.acertou,
          tentativas = tentativas + 1,
          data_resposta = CURRENT_TIMESTAMP
      `;
      db.run(query, [userId, questaoId, opcaoId, acertou ? 1 : 0], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  saveEvidencia: (progressoPraticaId, diarioBordo, fotoUrl) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO evidencias (progresso_pratica_id, diario_bordo, foto_url)
        VALUES (?, ?, ?)
      `;
      db.run(query, [progressoPraticaId, diarioBordo, fotoUrl], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  findProgressoPratica: (userId, praticaId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM progresso_pratica WHERE usuario_id = ? AND pratica_id = ?', [userId, praticaId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  upsertProgressoPratica: (userId, praticaId, status, etapaAtual) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO progresso_pratica (usuario_id, pratica_id, status, etapa_atual)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(usuario_id, pratica_id) DO UPDATE SET
          status = excluded.status,
          etapa_atual = excluded.etapa_atual,
          data_conclusao = CASE WHEN excluded.status = 'concluido' THEN CURRENT_TIMESTAMP ELSE data_conclusao END
      `;
      db.run(query, [userId, praticaId, status, etapaAtual], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  createCertificado: (userId, codigo, cargaHoraria) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO certificados (usuario_id, codigo_validacao, carga_horaria)
        VALUES (?, ?, ?)
      `;
      db.run(query, [userId, codigo, cargaHoraria], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
};

module.exports = progressModel;
