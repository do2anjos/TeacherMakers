require('dotenv').config();
const authService = require('../services/authService');
const logger = require('../config/logger');

async function testAuth() {
    try {
        console.log('--- TESTANDO REGISTRO ---');
        
        const email = `teste_${Date.now()}@teacher.com`;
        const user = await authService.register({
            nome: 'Professor Teste',
            email: email,
            senha: 'senha123',
            nivel_ensino: 'Fundamental I'
        });
        console.log('Usuário registrado com sucesso:', user.email);

        console.log('\n--- TESTANDO LOGIN ---');
        const loginResult = await authService.login(email, 'senha123');
        console.log('Login realizado! Token gerado:', loginResult.token.substring(0, 20) + '...');

        console.log('\n--- TESTANDO LOGIN FALHA (SENHA ERRADA) ---');
        try {
            await authService.login(email, 'senha_errada');
        } catch (e) {
            console.log('Erro esperado capturado:', e.message);
        }

        console.log('\n--- TESTANDO REGISTRO DUPLICADO ---');
        try {
            await authService.register({
                nome: 'Outro Nome',
                email: email,
                senha: 'outrasenha',
                nivel_ensino: 'Médio'
            });
        } catch (e) {
            console.log('Erro esperado capturado:', e.message);
        }

        console.log('\n TESTES CONCLUÍDOS COM SUCESSO!');
        process.exit(0);
    } catch (error) {
        console.error(' FALHA NO TESTE:', error);
        process.exit(1);
    }
}

testAuth();
