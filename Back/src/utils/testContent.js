
require('dotenv').config();
const authService = require('../services/authService');
const contentService = require('../services/contentService');
const progressService = require('../services/progressService');

async function testContentAndProgress() {
    try {
        console.log('--- 1. CRIANDO USUÁRIO PARA TESTE ---');
        const email = `aluno_${Date.now()}@teste.com`;
        await authService.register({
            nome: 'Aluno Teste',
            email,
            senha: 'senha123',
            nivel_ensino: 'Fundamental'
        });

        const login = await authService.login(email, 'senha123');
        const userId = login.usuario.id;
        console.log('Logado como ID:', userId);

        console.log('\n--- 2. LISTANDO MÓDULOS INICIAIS ---');
        const modulos = await contentService.getModulosComProgresso(userId);
        console.log('Módulo 1:', modulos[0].titulo, '- Progresso:', modulos[0].percentual + '%');

        console.log('\n--- 3. COMPLETANDO AULA 1 ---');
        await progressService.completarAula(userId, 1);
        console.log('Aula 1 marcada como concluída.');

        console.log('\n--- 4. LISTANDO MÓDULOS APÓS CONCLUIR AULA ---');
        const modulosPos = await contentService.getModulosComProgresso(userId);
        console.log('Módulo 1:', modulosPos[0].titulo, '- Progresso:', modulosPos[0].percentual + '%');

        console.log('\n--- 5. BUSCANDO DETALHES DE UMA AULA COM QUIZ ---');
        const aula = await contentService.getAulaDetalhes(1);
        console.log('Aula:', aula.titulo);
        console.log('Qtd Questões Quiz:', aula.quiz.length);
        if (aula.quiz.length > 0) {
            console.log('Primeira Pergunta:', aula.quiz[0].pergunta);
            console.log('Qtd Opções:', aula.quiz[0].opcoes.length);
        }

        console.log('\n TESTES DE CONTEÚDO E PROGRESSO CONCLUÍDOS!');
        process.exit(0);
    } catch (erro) {
        console.error(' FALHA NO TESTE:', erro);
        process.exit(1);
    }
}

testContentAndProgress();
