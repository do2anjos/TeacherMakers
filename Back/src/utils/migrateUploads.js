const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const db = require('../config/database');
const storage = require('../config/storage');
const apply = process.argv.includes('--apply');
const backRoot = path.resolve(__dirname, '../..');
const legacyUploadsDir = path.join(backRoot, 'uploads');

function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

async function main() {
  await db.initDatabase();
  const references = await queryAll('SELECT id, foto_url FROM evidencias WHERE foto_url IS NOT NULL AND foto_url <> \'\' ORDER BY id');
  const report = { mode: apply ? 'apply' : 'dry-run', referenced: references.length, alreadyMigrated: 0, copied: 0, missing: [], unsafe: [], collisions: [] };

  for (const reference of references) {
    const raw = String(reference.foto_url);
    if (raw.startsWith('/uploads/')) { report.alreadyMigrated++; continue; }
    const relative = raw.replace(/^[/\\]+/, '').replace(/^uploads[/\\]/i, '');
    const source = path.resolve(path.isAbsolute(raw) ? raw : path.join(legacyUploadsDir, relative));
    if (!source.startsWith(`${legacyUploadsDir}${path.sep}`)) { report.unsafe.push(reference.id); continue; }

    let sourceStat;
    try { sourceStat = await fs.stat(source); } catch (_) { report.missing.push(reference.id); continue; }
    if (!sourceStat.isFile()) { report.missing.push(reference.id); continue; }

    let filename = path.basename(source);
    let destination = path.join(storage.evidenceDir, filename);
    try {
      await fs.stat(destination);
      const [targetBytes, sourceBytes] = await Promise.all([fs.readFile(destination), fs.readFile(source)]);
      if (!targetBytes.equals(sourceBytes)) {
        report.collisions.push(reference.id);
        const hash = crypto.createHash('sha256').update(sourceBytes).digest('hex').slice(0, 12);
        filename = `${path.parse(filename).name}-${hash}${path.extname(filename)}`;
        destination = path.join(storage.evidenceDir, filename);
      }
    } catch (_) { /* Destination does not exist yet. */ }

    if (apply) {
      await storage.ensureStorage();
      const temporary = path.join(storage.temporaryDir, `migration-${reference.id}-${crypto.randomUUID()}.part`);
      let copied = false;
      try {
        await fs.copyFile(source, temporary);
        try { await fs.copyFile(temporary, destination, require('fs').constants.COPYFILE_EXCL); copied = true; }
        catch (error) {
          if (error.code !== 'EEXIST') throw error;
          const existing = await fs.readFile(destination);
          const incoming = await fs.readFile(temporary);
          if (!existing.equals(incoming)) throw new Error(`Collision for evidence ${reference.id}`);
        }
        await db.withTransaction((tx) => tx.run('UPDATE evidencias SET foto_url = ? WHERE id = ?', [storage.evidenceUrl(filename), reference.id]));
        report.copied++;
      } catch (error) {
        if (copied) await fs.rm(destination, { force: true }).catch(() => {});
        throw error;
      } finally {
        await fs.rm(temporary, { force: true }).catch(() => {});
      }
    } else {
      report.copied++;
    }
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.missing.length || report.unsafe.length || report.collisions.length) process.exitCode = 2;
  await new Promise((resolve, reject) => db.close((error) => error ? reject(error) : resolve()));
}

main().catch(async (error) => {
  process.stderr.write(`${error.message}\n`);
  try { await new Promise((resolve) => db.close(() => resolve())); } catch (_) { /* noop */ }
  process.exitCode = 1;
});
