require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../config/database');
const logger = require('../config/logger');

const dados = {
    5: {
        resumo: `
            <h3>Imaginar</h3>
            <p>O ato de imaginar é o grande ponto de partida da Cultura Maker. Dentro do pilar da criatividade, o movimento defende a premissa fundamental de que tudo o que pode ser imaginado e pensado também pode ser criado e materializado com as próprias mãos.</p>
            <p>No contexto educacional, a imaginação ganha um papel central. Os espaços maker (ou makerspaces) são ambientes projetados especificamente para estimular a imaginação e a inovação, permitindo que os alunos explorem seus interesses e assumam o controle do seu próprio aprendizado.</p>
            <p>A educação maker incentiva o desenvolvimento da imaginação em conjunto com a invenção e a brincadeira. Ao explorar a imaginação de forma prática, aliada à autonomia, a escola ajuda a desenvolver o pensamento crítico e criativo dos estudantes.</p>
            <p>Além disso, recorrer à imaginação e à criatividade é uma das competências exigidas pela Base Nacional Comum Curricular (BNCC). Ela é considerada uma capacidade essencial para que os alunos possam utilizar diferentes linguagens, formular e defender ideias e encontrar soluções inovadoras para os desafios do mundo moderno.</p>
        `
    },
    6: {
        resumo: `
            <h3>Planejar</h3>
            <p>O ato de planejar na Cultura Maker possui duas dimensões essenciais: o planejamento institucional para a criação de um espaço maker e o planejamento como uma habilidade desenvolvida pelo próprio aluno durante a aprendizagem.</p>
            <h4>1. O Planejamento na Criação do Espaço Maker</h4>
            <p>A implementação de um makerspace em uma escola ou empresa não deve ser improvisada, pois exige cuidado e estratégia. Um bom planejamento envolve etapas estruturadas:</p>
            <ul>
                <li><strong>Definição de objetivos:</strong> É o primeiro passo, no qual se deve entender para que o espaço será utilizado, quem serão os usuários (alunos, professores, comunidade) e alinhar essa proposta ao projeto político-pedagógico da instituição.</li>
                <li><strong>Escolha e adaptação do ambiente:</strong> O espaço físico precisa ser acessível, seguro e inspirador, considerando aspectos estruturais como iluminação e ventilação. O local deve ser organizado em zonas de trabalho (como eletrônica, marcenaria e robótica) e utilizar mesas modulares para estimular o trabalho colaborativo.</li>
                <li><strong>Levantamento de recursos e equipamentos:</strong> Planejar a aquisição de ferramentas é vital. O ambiente pode ter desde o básico (chaves, alicates, tesouras, papel, madeira, sucatas) até tecnologias mais avançadas (impressoras 3D, cortadoras a laser, kits de robótica e placas Arduino). Tudo pode ser adquirido de forma gradual.</li>
                <li><strong>Capacitação da equipe:</strong> É preciso formar e treinar profissionais e educadores para que saibam gerenciar o espaço de forma segura e atuar como mediadores e facilitadores no processo de aprendizagem dos estudantes.</li>
            </ul>
            <h4>2. O Planejamento no Aprendizado do Aluno</h4>
            <p>Quando o aluno coloca a "mão na massa", o planejamento se torna uma competência central do seu desenvolvimento e protagonismo:</p>
            <ul>
                <li><strong>Elaboração de projetos e protótipos:</strong> Diante de um desafio do mundo real, o estudante é incentivado a fazer perguntas, definir problemas e planejar soluções, modelos ou esboços antes da execução propriamente dita.</li>
                <li><strong>Ciclo de tentativa e erro:</strong> Na metodologia maker, o erro é visto como uma oportunidade de aprendizado natural. Se um protótipo falha, o aluno aprende a refletir, voltar à etapa de planejamento, fazer ajustes e testar novamente. Em um relato de atividade prática, um estudante exemplifica bem esse amadurecimento: "Desperdicei palitos [...] depois medi melhor e planejei antes".</li>
                <li><strong>Desenvolvimento de autonomia:</strong> Ao tomar decisões, planejar suas ações e adaptar seus projetos ao longo do caminho, o aprendiz desenvolve autonomia, autogestão e pensamento crítico, que são competências vitais para o século XXI.</li>
            </ul>
            <p>Para guiar essa estrutura de ação, metodologias como o PDCA (Planejar, Fazer, Checar e Agir) e o Design Thinking também são frequentemente aplicadas nos projetos maker.</p>
        `
    },
    7: {
        resumo: `
            <h3>Criar</h3>
            <p>O ato de criar é a essência e o coração da Cultura Maker. É o momento em que a imaginação e o planejamento se materializam através da filosofia do "Do it yourself" (Faça você mesmo) e da aprendizagem "mão na massa". Trata-se da ação de transformar ideias em resultados e soluções palpáveis para problemas do cotidiano.</p>
            <p>Dentro dos ambientes educacionais e corporativos, o ato de criar envolve as seguintes dimensões fundamentais:</p>
            <ul>
                <li><strong>De consumidores a produtores:</strong> A Cultura Maker incentiva fortemente que as pessoas, desde crianças até adultos, deixem de ser apenas consumidoras passivas (de tecnologia, produtos ou informações) e passem a ser produtoras e criadoras. O movimento defende que qualquer indivíduo tem a capacidade de construir, consertar, modificar e fabricar os mais diversos tipos de objetos com as próprias mãos.</li>
                <li><strong>O processo é mais importante que o produto:</strong> Quando um aluno ou profissional está criando algo, o foco não deve estar exclusivamente em obter um resultado final perfeito. O mais valioso é a construção do conhecimento ao longo do processo. Criar envolve testar hipóteses, cometer erros, refletir sobre as falhas e tentar novamente, desenvolvendo assim a resiliência e a capacidade de adaptação.</li>
                <li><strong>Aprendizagem prática (teoria na prática):</strong> Criar é a maneira de tirar a teoria do papel. Ao construir protótipos para solucionar problemas reais, os aprendizes superam a distância entre a teoria e a prática, desenvolvendo autonomia, pensamento crítico, curiosidade e autoconfiança.</li>
                <li><strong>Democratização das ferramentas:</strong> A criação maker não exige obrigatoriamente tecnologias caras. Ela pode acontecer em laboratórios (Fab Labs) equipados com alta tecnologia, como impressoras 3D, cortadoras a laser, programação e robótica, mas também pode utilizar marcenaria, costura, culinária e o reaproveitamento criativo de sucatas e materiais recicláveis.</li>
            </ul>
            <p>Em suma, "criar" na Cultura Maker é o exercício prático de dar vida à inovação, encorajando as pessoas a explorarem seu potencial inventivo e assumirem o protagonismo na busca por soluções para os desafios do mundo.</p>
        `
    },
    8: {
        resumo: `
            <h3>Testar</h3>
            <p>O ato de testar é uma etapa crucial na Cultura Maker, estando intimamente ligado à experimentação e à chamada "cultura do erro". Após planejar e criar um protótipo, colocá-lo à prova é o que permite validar as ideias, promover ajustes e impulsionar a inovação.</p>
            <p>No contexto do movimento maker, o ato de testar envolve as seguintes dinâmicas:</p>
            <ul>
                <li><strong>O erro como oportunidade de aprendizado:</strong> Na metodologia maker, errar ao testar um projeto não é visto como um fracasso, mas sim como uma etapa natural e valiosa do processo. O espaço maker funciona como um "laboratório de erros controlados", oferecendo um ambiente seguro onde as pessoas se sentem encorajadas a testar novas ideias sem o medo de consequências negativas.</li>
                <li><strong>Ciclo de tentativa, erro e ajuste:</strong> Testar algo significa entrar em um ciclo contínuo e iterativo. Se durante o teste um protótipo falha ou quebra, o aprendiz é incentivado a identificar o problema, refletir sobre as causas, voltar ao desenho original (planejamento), fazer as modificações necessárias e testar novamente até que a solução funcione.</li>
                <li><strong>Desenvolvimento de resiliência:</strong> A prática de testar repetidamente e ter que lidar com as falhas ajuda a desenvolver fortemente a resiliência e o "mindset de crescimento", que é a crença de que as habilidades são desenvolvidas com esforço e prática. O estudante aprende a persistir diante das dificuldades e a não desistir na primeira tentativa frustrada.</li>
                <li><strong>Prototipagem rápida e feedbacks:</strong> Ferramentas tecnológicas (como impressoras 3D, programação e robótica) permitem que as ideias sejam materializadas e testadas de forma muito ágil. Isso facilita a visualização rápida dos resultados práticos para que se possa colher feedbacks e aplicar melhorias contínuas à invenção.</li>
                <li><strong>Garantia de segurança e funcionalidade:</strong> Além da aprendizagem, testar um protótipo na prática é a forma de verificar se o projeto realmente cumpre o seu propósito e se é seguro para ser utilizado fora do ambiente de laboratório.</li>
            </ul>
            <p>Em resumo, testar na Cultura Maker é o exercício prático de colocar as ideias em atrito com a realidade, compreendendo que a falha faz parte do caminho e é a melhor ferramenta para se chegar a uma solução mais criativa, madura e eficiente.</p>
        `
    },
    9: {
        resumo: `
            <h3>Melhorar</h3>
            <p>O ato de melhorar (ou aprimorar) é a etapa que consolida a evolução de um projeto na Cultura Maker. Ele representa o passo natural que sucede a fase de testes, garantindo que a invenção seja ajustada e alcance o seu melhor potencial de funcionamento.</p>
            <p>Dentro do universo maker, a ação de melhorar se baseia nas seguintes dinâmicas:</p>
            <ul>
                <li><strong>Ciclos iterativos e aprimoramento contínuo:</strong> A criação maker não é um caminho linear. Se a testagem revela uma falha de projeto, a orientação é voltar ao modelo ou desenho anterior, refletir, fazer as alterações necessárias e recomeçar com um novo protótipo aprimorado.</li>
                <li><strong>O erro como ferramenta de refinamento:</strong> A melhoria só acontece porque o erro é abraçado como uma ferramenta fundamental de refinamento e inovação. Em relatos de atividades práticas em sala de aula, nota-se que quando um projeto falha ou quebra, os alunos desenvolvem a capacidade de voltar ao desenho, modificar as estratégias e testar novamente até que a ideia funcione.</li>
                <li><strong>Ajustes baseados em feedbacks:</strong> Metodologias integradas à Cultura Maker, como o Design Thinking, valorizam intensamente a experimentação contínua. Por meio dessa abordagem, os criadores aprendem a testar suas hipóteses na prática, colher feedbacks dos usuários e ajustar suas soluções de forma muito mais focada nas necessidades reais.</li>
                <li><strong>Agilidade na identificação de melhorias:</strong> O uso de ferramentas de prototipagem rápida (sejam elas de alta tecnologia, como impressão 3D, ou de baixa tecnologia) permite que os alunos materializem suas ideias de forma ágil, visualizando rapidamente os resultados e identificando com clareza exata quais pontos precisam de melhoria.</li>
                <li><strong>Melhoria colaborativa (open source):</strong> O ato de melhorar não é apenas um esforço individual. A Cultura Maker estimula que a fonte original ou o protótipo de um projeto fiquem abertos e disponíveis em rede, permitindo que outras pessoas acessem o trabalho e colaborem ativamente com novas melhorias e atualizações.</li>
            </ul>
            <p>Em suma, melhorar é o reflexo prático da resiliência e do pensamento crítico. É a habilidade de analisar um resultado, aprender com as suas limitações e aplicar modificações constantes para transformar uma ideia inicial em uma solução muito mais robusta e eficiente.</p>
        `
    },
    10: {
        resumo: `
            <h3>Compartilhar</h3>
            <p>O ato de compartilhar é uma das pedras angulares da Cultura Maker, estando intrinsecamente ligado ao pilar da colaboração. No próprio manifesto do movimento maker, compartilhar é listado como uma das ações e mentalidades fundamentais que orientam os criadores.</p>
            <p>Dentro do universo maker, o compartilhamento se manifesta em várias dimensões práticas:</p>
            <ul>
                <li><strong>Comunidade e redes (físicas e digitais):</strong> A essência dos makers é disponibilizar seus conhecimentos, processos e produtos para a comunidade em geral. Isso ocorre tanto em fóruns físicos quanto digitais, através de plataformas online, blogs e vídeos.</li>
                <li><strong>A filosofia do open source (código aberto):</strong> O compartilhamento garante que o protótipo, o código ou a ideia original fique aberto e acessível em rede para que outras pessoas possam utilizá-lo, reproduzi-lo e colaborar ativamente com melhorias. Essa norma cultural de compartilhar designs facilita a inovação rápida e a escalabilidade das invenções.</li>
                <li><strong>Aprendizado colaborativo (aprendizagem entre pares):</strong> No ambiente educacional, compartilhar ideias, falhas e acertos com os colegas ajuda a construir uma verdadeira comunidade de aprendizagem. Quando os alunos dividem o que sabem durante o processo de criação, eles têm a valiosa oportunidade de aprenderem com as habilidades e experiências dos seus pares, promovendo o desenvolvimento de competências socioemocionais como a empatia e a comunicação.</li>
                <li><strong>Uma ética de compartilhamento:</strong> O movimento maker celebra uma "ética no compartilhamento do conhecimento". A troca de saberes é tão vital que um dos critérios globais estabelecidos pelo MIT para a criação de makerspaces oficiais (os Fab Labs) é exatamente a participação ativa na rede internacional de compartilhamento de processos e conhecimentos.</li>
            </ul>
            <p>Em suma, compartilhar na Cultura Maker significa entender que a descoberta e o conhecimento não devem ser propriedades restritas ou individualistas, mas sim bens coletivos. É através dessa troca contínua que o trabalho em equipe se fortalece e as soluções inovadoras ganham o mundo.</p>
        `
    },
    11: {
        resumo: `
            <h3>Cultura Maker x Robótica</h3>
            <p>A Robótica e a Cultura Maker possuem uma relação íntima e profundamente complementar, onde a robótica atua como uma das principais ferramentas tecnológicas para materializar a filosofia do "faça você mesmo" e impulsionar a inovação.</p>
            <p>Essa integração se destaca em várias dimensões práticas e educacionais presentes nas fontes:</p>
            <ul>
                <li><strong>Laboratório de erros controlados:</strong> Dentro da aprendizagem maker, a robótica educacional e a programação funcionam como um ambiente seguro para a experimentação. Nesses cenários, os erros são esperados e vistos como etapas úteis e naturais do aprendizado, permitindo que os estudantes testem hipóteses e ajustem suas criações tecnológicas sem medo. Práticas educacionais de sucesso, como as desenvolvidas na Finlândia, demonstram que o uso da robótica aliada a essa cultura de aceitação do erro promove grande autonomia e criatividade entre os alunos desde cedo.</li>
                <li><strong>Interdisciplinaridade e resolução de problemas:</strong> A robótica permite tirar conceitos abstratos do papel de forma muito dinâmica. As atividades maker que utilizam a robótica conseguem integrar, em um único projeto, o ensino de lógica, geometria e física (como o cálculo de velocidade, distância, tempo e aceleração). Nos laboratórios escolares, os alunos utilizam os kits de robótica e microcontroladores (como o Arduino) para criar soluções e resolver problemas reais propostos em sala de aula. Além disso, a organização de competições de robótica ajuda a solidificar os conhecimentos da metodologia STEAM (ciência, tecnologia, engenharia, arte e matemática) de forma prática e engajadora.</li>
                <li><strong>De consumidores a criadores de tecnologia:</strong> A união dessas áreas transforma o protagonismo dos alunos. Projetos práticos, como o Fab Lab Kids Brasil, ilustram bem essa mudança ao permitir que as crianças fabriquem os seus próprios brinquedos e, em seguida, os dotem de inteligência através da programação. Isso garante que os alunos deixem de ser apenas consumidores passivos de eletrônicos e passem a ser produtores ativos de tecnologia.</li>
                <li><strong>Sustentabilidade e acessibilidade:</strong> A aplicação da robótica na Cultura Maker não exige, obrigatoriamente, recursos altamente custosos. O pilar maker da sustentabilidade é fortemente aplicado na robótica por meio do reaproveitamento de componentes e peças descartadas. Um exemplo notável nas fontes é o premiado projeto "Robótica com Sucata", que ganhou reconhecimento mundial ao ensinar tecnologia, lógica e programação para alunos utilizando sucatas e materiais recicláveis, trabalhando concomitantemente a empatia e a responsabilidade socioambiental.</li>
            </ul>
            <p>Em suma, a robótica eleva o potencial criativo da Cultura Maker, enquanto a Cultura Maker fornece à robótica um propósito investigativo, ensinando a resiliência diante das falhas tecnológicas e promovendo um trabalho muito mais colaborativo e sustentável.</p>
        `
    }
};

async function update() {
    try {
        await db.initDatabase();
        for (const [id, item] of Object.entries(dados)) {
            await new Promise((resolve, reject) => {
                db.run('UPDATE aulas SET resumo = ? WHERE id = ?',
                    [item.resumo.trim(), parseInt(id)], (erro) => {
                    if (erro) reject(erro);
                    else resolve();
                });
            });
            logger.info(` Aula ${id} updated (resumo).`);
        }
        console.log(' Summaries updated successfully!');
        process.exit(0);
    } catch (erro) {
        console.error(' Error updating summaries:', erro);
        process.exit(1);
    }
}

update();
