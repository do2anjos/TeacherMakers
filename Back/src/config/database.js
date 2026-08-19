require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { createClient } = require('@libsql/client');
const path = require('path');
const logger = require('./logger');

const isTurso = (process.env.NODE_ENV === 'production' || process.env.USE_TURSO === 'true') && !!process.env.TURSO_DATABASE_URL;
let db;

if (isTurso) {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    
    db = {
        all: (sql, params, callback) => {
            if (typeof params === 'function') { callback = params; params = []; }
            client.execute({ sql, args: params || [] })
                .then(rs => callback(null, rs.rows))
                .catch(err => callback(err));
        },
        get: (sql, params, callback) => {
            if (typeof params === 'function') { callback = params; params = []; }
            client.execute({ sql, args: params || [] })
                .then(rs => callback(null, rs.rows[0]))
                .catch(err => callback(err));
        },
        run: function(sql, params, callback) {
            if (typeof params === 'function') { callback = params; params = []; }
            client.execute({ sql, args: params || [] })
                .then(rs => {
                    if (callback) callback.call({ 
                        lastID: rs.lastInsertRowid ? Number(rs.lastInsertRowid) : null, 
                        changes: rs.rowsAffected 
                    }, null);
                })
                .catch(err => {
                    if (callback) callback(err);
                    else logger.error('Turso Execute Error:', err);
                });
        },
        exec: (sql, callback) => {
            const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
            client.batch(statements, 'write')
                .then(() => { if (callback) callback(null); })
                .catch(err => { if (callback) callback(err); });
        },
        serialize: (callback) => {
            callback();
        },
        close: (callback) => {
            if (callback) callback(null);
        }
    };
    logger.info('Using Turso (LibSQL) database.');
} else {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, '../../', process.env.DATABASE_URL || 'database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            logger.error('Error connecting to the database:', err.message);
        } else {
            logger.info('Connected to the SQLite database.');
            db.run('PRAGMA foreign_keys = ON');
        }
    });
}

let dbInitPromise;

function initDatabase() {
    if (dbInitPromise) return dbInitPromise;

    dbInitPromise = new Promise((resolve, reject) => {
        const schema = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                nivel_ensino TEXT NOT NULL,
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
                onboarding_concluido BOOLEAN DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS modulos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                descricao TEXT,
                cor TEXT NOT NULL,
                ordem INTEGER UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS aulas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                modulo_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                subtitulo TEXT,
                descricao TEXT,
                tipo TEXT NOT NULL,
                url_video TEXT,
                duracao_min INTEGER,
                ordem INTEGER NOT NULL,
                FOREIGN KEY (modulo_id) REFERENCES modulos (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                aula_id INTEGER UNIQUE NOT NULL,
                FOREIGN KEY (aula_id) REFERENCES aulas (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS questoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id INTEGER NOT NULL,
                pergunta TEXT NOT NULL,
                ordem INTEGER NOT NULL,
                FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS opcoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                questoes_id INTEGER NOT NULL,
                texto TEXT NOT NULL,
                correta BOOLEAN NOT NULL,
                ordem INTEGER NOT NULL,
                FOREIGN KEY (questoes_id) REFERENCES questoes (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS praticas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                modulo_id INTEGER NOT NULL,
                aula_id INTEGER UNIQUE,
                tipo TEXT NOT NULL,
                titulo TEXT NOT NULL,
                subtitulo TEXT,
                icone TEXT,
                FOREIGN KEY (modulo_id) REFERENCES modulos (id) ON DELETE CASCADE,
                FOREIGN KEY (aula_id) REFERENCES aulas (id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS etapas_pratica (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pratica_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                texto_instrucao TEXT NOT NULL,
                instrucao_professor TEXT,
                ordem INTEGER NOT NULL,
                FOREIGN KEY (pratica_id) REFERENCES praticas (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS progresso_modulo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                modulo_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                percentual INTEGER DEFAULT 0,
                data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
                data_conclusao DATETIME,
                UNIQUE(usuario_id, modulo_id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
                FOREIGN KEY (modulo_id) REFERENCES modulos (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS progresso_aula (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                aula_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                video_assistido BOOLEAN DEFAULT 0,
                data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
                data_conclusao DATETIME,
                minutos_estudo INTEGER DEFAULT 0,
                UNIQUE(usuario_id, aula_id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
                FOREIGN KEY (aula_id) REFERENCES aulas (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS resposta_quiz (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                questao_id INTEGER NOT NULL,
                opcao_id INTEGER NOT NULL,
                acertou BOOLEAN NOT NULL,
                tentativas INTEGER DEFAULT 1,
                data_resposta DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(usuario_id, questao_id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
                FOREIGN KEY (questao_id) REFERENCES questoes (id) ON DELETE CASCADE,
                FOREIGN KEY (opcao_id) REFERENCES opcoes (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS progresso_pratica (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                pratica_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                etapa_atual INTEGER DEFAULT 1,
                data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
                data_conclusao DATETIME,
                UNIQUE(usuario_id, pratica_id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
                FOREIGN KEY (pratica_id) REFERENCES praticas (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS evidencias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                progresso_pratica_id INTEGER NOT NULL,
                diario_bordo TEXT,
                foto_url TEXT,
                data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (progresso_pratica_id) REFERENCES progresso_pratica (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS certificados (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER UNIQUE NOT NULL,
                codigo_validacao TEXT UNIQUE NOT NULL,
                data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
                carga_horaria INTEGER NOT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
            );
        `;

        db.exec(schema, (err) => {
            if (err) {
                logger.error('Failed to initialize database schema:', err);
                reject(err);
            } else {
                logger.info('Database schema initialized.');
                resolve();
            }
        });
    });

    return dbInitPromise;
}

module.exports = db;
module.exports.initDatabase = initDatabase;
module.exports.isTurso = isTurso;
