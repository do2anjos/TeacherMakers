module.exports = {
  version: '003_repair_legacy_diagnostics',

  up: async (db) => {
    const columns = await db.all('PRAGMA table_info(diagnosticos)', []);
    if (!columns.some((column) => column.name === 'status')) {
      await db.run('ALTER TABLE diagnosticos ADD COLUMN status TEXT');
    }
    if (!columns.some((column) => column.name === 'data_inicio')) {
      await db.run('ALTER TABLE diagnosticos ADD COLUMN data_inicio DATETIME');
    }

    await db.run(`UPDATE diagnosticos
      SET status = CASE WHEN data_conclusao IS NOT NULL THEN 'completed' ELSE 'in_progress' END
      WHERE status IS NULL OR TRIM(status) = ''`);
  }
};
