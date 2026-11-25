module.exports = {
  version: '005_evidencia_foto_blob',

  up: async (db) => {
    const columns = await db.all('PRAGMA table_info(evidencias)', []);
    const names = columns.map((column) => column.name);

    if (!names.includes('foto_blob')) {
      await db.run('ALTER TABLE evidencias ADD COLUMN foto_blob BLOB');
    }
    if (!names.includes('foto_mime')) {
      await db.run('ALTER TABLE evidencias ADD COLUMN foto_mime TEXT');
    }
    if (!names.includes('foto_token')) {
      await db.run('ALTER TABLE evidencias ADD COLUMN foto_token TEXT');
    }
  }
};
