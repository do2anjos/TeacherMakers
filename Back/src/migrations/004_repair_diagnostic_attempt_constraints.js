module.exports = {
  version: '004_repair_diagnostic_attempt_constraints',

  up: async (db) => {
    const diagnosticColumns = await db.all('PRAGMA table_info(diagnosticos)', []);
    const scoreColumn = diagnosticColumns.find((column) => column.name === 'pontuacao');
    const completionColumn = diagnosticColumns.find((column) => column.name === 'data_conclusao');

    if (!scoreColumn || !completionColumn) {
      throw new Error('The diagnostic table is missing required columns for migration 004.');
    }
    if (scoreColumn.notnull === 0 && completionColumn.dflt_value == null) return;

    await db.run('ALTER TABLE respostas_diagnostico RENAME TO respostas_diagnostico__v004_old');
    await db.run('ALTER TABLE diagnosticos RENAME TO diagnosticos__v004_old');

    await db.run(`CREATE TABLE diagnosticos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'pre',
      pontuacao INTEGER,
      total_questoes INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_conclusao DATETIME,
      versao_conteudo TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    )`);
    await db.run(`INSERT INTO diagnosticos
      (id, usuario_id, tipo, pontuacao, total_questoes, status, data_inicio, data_conclusao, versao_conteudo)
      SELECT id, usuario_id, tipo, pontuacao, total_questoes,
        CASE WHEN status IS NULL OR TRIM(status) = '' THEN
          CASE WHEN data_conclusao IS NOT NULL THEN 'completed' ELSE 'in_progress' END
        ELSE status END,
        data_inicio, data_conclusao, versao_conteudo
      FROM diagnosticos__v004_old`);

    await db.run(`CREATE TABLE respostas_diagnostico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      diagnostico_id INTEGER NOT NULL,
      questao_codigo TEXT NOT NULL,
      resposta TEXT NOT NULL,
      correta BOOLEAN NOT NULL,
      UNIQUE(diagnostico_id, questao_codigo),
      FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos (id) ON DELETE CASCADE
    )`);
    await db.run(`INSERT INTO respostas_diagnostico
      (id, diagnostico_id, questao_codigo, resposta, correta)
      SELECT id, diagnostico_id, questao_codigo, resposta, correta
      FROM respostas_diagnostico__v004_old`);

    await db.run('DROP TABLE respostas_diagnostico__v004_old');
    await db.run('DROP TABLE diagnosticos__v004_old');
    await db.run('CREATE INDEX IF NOT EXISTS idx_diagnosticos_usuario_tipo ON diagnosticos(usuario_id, tipo)');
    await db.run('CREATE UNIQUE INDEX IF NOT EXISTS uq_diagnosticos_usuario_tipo ON diagnosticos(usuario_id, tipo)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_respostas_diagnostico ON respostas_diagnostico(diagnostico_id)');

    const foreignKeyViolations = await db.all('PRAGMA foreign_key_check', []);
    if (foreignKeyViolations.length) {
      throw new Error('Migration 004 would leave diagnostic foreign-key violations.');
    }
  }
};
