module.exports = {
  version: '001_v2_progress_diagnostics_achievements',

  up: async (db) => {
    const progressColumns = await db.all('PRAGMA table_info(progresso_modulo)', []);
    if (!progressColumns.some((column) => column.name === 'estado_acesso')) {
      await db.run("ALTER TABLE progresso_modulo ADD COLUMN estado_acesso TEXT NOT NULL DEFAULT 'bloqueado'");
    }

    await db.run(`CREATE TABLE IF NOT EXISTS conquistas_usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      codigo TEXT NOT NULL,
      data_conquista DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(usuario_id, codigo),
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    )`);
    await db.run(`CREATE TABLE IF NOT EXISTS diagnosticos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'pre',
      pontuacao INTEGER,
      total_questoes INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_conclusao DATETIME,
      UNIQUE(usuario_id, tipo),
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    )`);
    await db.run(`CREATE TABLE IF NOT EXISTS respostas_diagnostico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      diagnostico_id INTEGER NOT NULL,
      questao_codigo TEXT NOT NULL,
      resposta TEXT NOT NULL,
      correta BOOLEAN NOT NULL,
      UNIQUE(diagnostico_id, questao_codigo),
      FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos (id) ON DELETE CASCADE
    )`);
    await db.run('CREATE INDEX IF NOT EXISTS idx_diagnosticos_usuario_tipo ON diagnosticos(usuario_id, tipo)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_respostas_diagnostico ON respostas_diagnostico(diagnostico_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_conquistas_usuario ON conquistas_usuario(usuario_id)');
  }
};
