require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const path = require('path');
const db = require('../config/database');
const { initDatabase } = require('../config/database');
const logger = require('../config/logger');

const dados = require(path.resolve(__dirname, '../../../db_dump.json'));

async function seed() {
    try {
        logger.info('Iniciando seed do banco de dados...');

        await initDatabase();

        
        for (const mod of dados.modulos) {
            await runQuery(
                'INSERT OR REPLACE INTO modulos (id, titulo, descricao, cor, ordem) VALUES (?, ?, ?, ?, ?)',
                [mod.id, mod.titulo, mod.descricao || null, mod.cor, mod.ordem]
            );
        }
        logger.info(`${dados.modulos.length} módulos inseridos.`);

        
        for (const aula of dados.aulas) {
            await runQuery(
                'INSERT OR REPLACE INTO aulas (id, modulo_id, titulo, subtitulo, descricao, tipo, url_video, duracao_min, ordem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [aula.id, aula.modulo_id, aula.titulo, aula.subtitulo, aula.descricao, aula.tipo, aula.url_video, aula.duracao_min, aula.ordem]
            );
        }
        logger.info(`${dados.aulas.length} aulas inseridas.`);

        
        for (const quiz of dados.quizzes) {
            await runQuery(
                'INSERT OR REPLACE INTO quizzes (id, aula_id) VALUES (?, ?)',
                [quiz.id, quiz.aula_id]
            );
        }
        logger.info(`${dados.quizzes.length} quizzes inseridos.`);

        
        for (const questao of dados.questoes) {
            await runQuery(
                'INSERT OR REPLACE INTO questoes (id, quiz_id, pergunta, ordem) VALUES (?, ?, ?, ?)',
                [questao.id, questao.quiz_id, questao.pergunta, questao.ordem]
            );
        }
        logger.info(`${dados.questoes.length} questões inseridas.`);

        
        for (const opcao of dados.opcoes) {
            await runQuery(
                'INSERT OR REPLACE INTO opcoes (id, questoes_id, texto, correta, ordem) VALUES (?, ?, ?, ?, ?)',
                [opcao.id, opcao.questoes_id, opcao.texto, opcao.correta, opcao.ordem]
            );
        }
        logger.info(`${dados.opcoes.length} opções inseridas.`);

        
        for (const pratica of dados.praticas) {
            await runQuery(
                'INSERT OR REPLACE INTO praticas (id, modulo_id, aula_id, tipo, titulo, subtitulo, icone) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [pratica.id, pratica.modulo_id, pratica.aula_id || null, pratica.tipo, pratica.titulo, pratica.subtitulo, pratica.icone]
            );
        }
        logger.info(`${dados.praticas.length} práticas inseridas.`);

        
        for (const etapa of dados.etapas_pratica) {
            await runQuery(
                'INSERT OR REPLACE INTO etapas_pratica (id, pratica_id, titulo, texto_instrucao, instrucao_professor, ordem) VALUES (?, ?, ?, ?, ?, ?)',
                [etapa.id, etapa.pratica_id, etapa.titulo, etapa.texto_instrucao, etapa.instrucao_professor || null, etapa.ordem]
            );
        }
        logger.info(`${dados.etapas_pratica.length} etapas de prática inseridas.`);

        logger.info('Seed concluído com sucesso!');
        process.exit(0);

    } catch (erro) {
        logger.error('Falha no seed:', erro);
        process.exit(1);
    }
}

function runQuery(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

module.exports = { seed };

seed();
