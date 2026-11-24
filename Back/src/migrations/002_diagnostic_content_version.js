module.exports = {
  version: '002_diagnostic_content_version',

  up: async (db) => {
    const columns = await db.all('PRAGMA table_info(diagnosticos)', []);
    if (!columns.some((column) => column.name === 'versao_conteudo')) {
      await db.run('ALTER TABLE diagnosticos ADD COLUMN versao_conteudo TEXT');
    }
  }
};
