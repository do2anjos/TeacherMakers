const fs = require('fs/promises');
const fsConstants = require('fs').constants;
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const dataRoot = path.resolve(process.env.DATA_DIR || projectRoot);
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(dataRoot, 'uploads'));
const evidenceDir = path.join(uploadsDir, 'evidencias');
const temporaryDir = path.resolve(process.env.TEMP_UPLOADS_DIR || path.join(dataRoot, '.tmp', 'uploads'));
const maxUploadBytes = Number(process.env.UPLOAD_MAX_BYTES || 10 * 1024 * 1024);
if (!Number.isSafeInteger(maxUploadBytes) || maxUploadBytes < 1024 || maxUploadBytes > 50 * 1024 * 1024) {
  throw new Error('UPLOAD_MAX_BYTES must be an integer between 1024 and 52428800.');
}
const configuredDatabase = process.env.DATABASE_URL;
const databasePath = configuredDatabase
  ? path.resolve(path.isAbsolute(configuredDatabase) ? configuredDatabase : path.join(dataRoot, configuredDatabase))
  : path.join(dataRoot, 'database.sqlite');

async function ensureStorage() {
  // As evidências são gravadas como BLOB no banco; disco local é opcional.
  // Em produção sem DATA_DIR (ex.: Render free), não há diretórios a criar.
  if (process.env.NODE_ENV === 'production' && !process.env.DATA_DIR) {
    return;
  }
  await Promise.all([
    fs.mkdir(evidenceDir, { recursive: true }),
    fs.mkdir(temporaryDir, { recursive: true }),
    ...(databasePath === ':memory:' ? [] : [fs.mkdir(path.dirname(databasePath), { recursive: true })])
  ]);
  await Promise.all([fs.access(evidenceDir, fsConstants.W_OK), fs.access(temporaryDir, fsConstants.W_OK)]);
}

function evidenceUrl(filename) {
  return `/uploads/evidencias/${encodeURIComponent(filename)}`;
}

module.exports = { projectRoot, dataRoot, uploadsDir, evidenceDir, temporaryDir, databasePath, maxUploadBytes, ensureStorage, evidenceUrl };
