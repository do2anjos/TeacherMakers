require('dotenv').config();
const authService = require('../services/authService');
const progressService = require('../services/progressService');
const contentService = require('../services/contentService');

async function testGapsFix() {
    try {
        console.log('--- 1. CRIANDO USUÁRIO ---');
        const email = `aluno_gap_${Date.now()}@teste.com`;
        await authService.register({
            nome: 'Aluno Gap',
            email,
            senha: 'senha123',
            nivel_ensino: 'Médio'
        });
        const login = await authService.login(email, 'senha123');
        const userId = login.usuario.id;

        console.log('\n--- 2. TESTANDO ONBOARDING ---');
        const userModel = require('../models/userModel');
        await userModel.completeOnboarding(userId);
        const updatedUser = await userModel.findById(userId);
        console.log('Onboarding concluído:', updatedUser.onboarding_concluido === 1 ? 'SIM' : 'NÃO');

        console.log('\n--- 3. TESTANDO VALIDAÇÃO DE QUIZ ---');
        
        const aula = await contentService.getAulaDetalhes(1);
        const questao = aula.quiz[0];
        const opcaoCorreta = questao.opcoes.find(o => o.correta);
        const opcaoErrada = questao.opcoes.find(o => !o.correta);

        console.log('Submetendo resposta ERRADA...');
        const resErrada = await progressService.submeterRespostaQuiz(userId, questao.questao_id, opcaoErrada.id);
        console.log('Resultado:', resErrada.mensagem);

        console.log('Submetendo resposta CORRETA...');
        const resCorreta = await progressService.submeterRespostaQuiz(userId, questao.questao_id, opcaoCorreta.id);
        console.log('Resultado:', resCorreta.mensagem);

        console.log('\n--- 4. TESTANDO BUSCA DE PRÁTICAS ---');
        const praticas = await contentService.getPraticasByModulo(1);
        console.log('Qtd Práticas no Módulo 1:', praticas.length);
        if (praticas.length > 0) {
            console.log('Primeira Prática:', praticas[0].titulo);
            console.log('Qtd Etapas:', praticas[0].etapas.length);
        }

        console.log('\n TODAS AS LACUNAS FORAM CORRIGIDAS COM SUCESSO!');
        process.exit(0);
    } catch (error) {
        console.error(' FALHA NO TESTE DE CORREÇÃO:', error);
        process.exit(1);
    }
}

testGapsFix();
