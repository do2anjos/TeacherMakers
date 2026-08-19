require('dotenv').config();
const authService = require('../services/authService');
const progressService = require('../services/progressService');
const contentModel = require('../models/contentModel');
const progressModel = require('../models/progressModel');

async function testFinalFlow() {
    try {
        console.log('--- 1. PREPARANDO USUÁRIO PARA CERTIFICADO ---');
        const email = `mestre_${Date.now()}@teacher.com`;
        await authService.register({
            nome: 'Mestre Yoda',
            email,
            senha: 'senha123',
            nivel_ensino: 'Superior'
        });
        const login = await authService.login(email, 'senha123');
        const userId = login.usuario.id;

        console.log('\n--- 2. TENTANDO EMITIR CERTIFICADO SEM CONCLUIR ---');
        try {
            await progressService.emitirCertificado(userId);
        } catch (e) {
            console.log('Erro esperado (Correto):', e.message);
        }

        console.log('\n--- 3. SIMULANDO CONCLUSÃO DE TODOS OS MÓDULOS ---');
        const modulos = await contentModel.findAllModulos();
        for (const mod of modulos) {
            await progressModel.upsertModuloProgress(userId, mod.id, 'concluido', 100);
        }
        console.log('Todos os módulos marcados como 100%.');

        console.log('\n--- 4. EMITINDO CERTIFICADO FINAL ---');
        const certificado = await progressService.emitirCertificado(userId);
        console.log('Certificado Gerado:', certificado.codigo);
        console.log('Carga Horária:', certificado.cargaHoraria, 'horas');

        console.log('\n FLUXO FINAL CONCLUÍDO COM SUCESSO!');
        process.exit(0);
    } catch (error) {
        console.error(' FALHA NO TESTE FINAL:', error);
        process.exit(1);
    }
}

testFinalFlow();
