# Relatório Mestre de Avaliação da Qualidade do Software

## 1. Resumo Executivo
O presente relatório consolida o planejamento de avaliação de qualidade do software **TeacherMakers**, uma plataforma educacional focada na formação de professores em Cultura Maker, Pensamento Computacional e Robótica. O objetivo central deste plano é estruturar métodos sistemáticos para responder a dúvidas críticas sobre a real eficácia do sistema tanto em suas dimensões técnicas quanto pedagógicas.

## 2. Objetivo da Avaliação
Assegurar, por meio de evidências rigorosas, que o TeacherMakers cumpre sua finalidade educacional e apresenta níveis adequados de usabilidade, funcionalidade e acessibilidade para o seu público-alvo (educadores). Nenhuma avaliação neste plano foi selecionada arbitrariamente; todas derivam de riscos identificados na arquitetura, no fluxo do usuário ou nos objetivos educacionais do sistema.

## 3. Metodologia
A estruturação deste relatório obedece a uma cadeia lógica estrita:
Sistema → propósito → funcionalidades → usuários → tarefas → objetivos educacionais → riscos/atributos de qualidade → perguntas avaliáveis → métodos → instrumentos → evidências → análise → critérios de sucesso → conclusão.

---

## 4. Compreensão do Software

### 4.1 O que o sistema se propõe a fazer?
* **Problema que resolve:** A necessidade de capacitação estruturada e validada de professores em abordagens Maker e Pensamento Computacional.
* **Objetivo principal:** Capacitar professores através de trilhas formativas interativas e certificar essa aprendizagem.
* **Contexto de utilização:** Ambientes educacionais, de forma assíncrona, via navegadores web (mobile e desktop).
* **Público-alvo:** Professores e educadores (Cursistas).
* **Valor entregue:** Formação acessível, prática guiada ("mão na massa") e certificação validável.
* **Finalidade educacional:** Construir e consolidar conhecimentos teóricos e práticos de tecnologia aplicados à pedagogia.
* **Objetivos educacionais:** Validar absorção teórica via quizzes interativos; evidenciar aplicação prática por meio de envios fotográficos e diários de bordo.
* **Funcionalidades principais:** Cadastro, login, onboarding, dashboard de progresso, aulas teóricas (vídeo/resumo), quizzes, roteiros práticos com upload de evidências (foto/texto) e emissão de certificados.
* **Processamento e armazenamento:** Backend em Node.js com persistência em SQLite e upload de imagens via Multer.
* **Resultados esperados:** Professores capacitados e certificados.

### 4.2 O que o sistema efetivamente faz? (Baseline 1.0)
* **Cadastro e Autenticação:** Implementada (JWT, bcrypt).
* **Onboarding:** Implementada.
* **Trilha de Aprendizagem (Dashboard):** Implementada (Cálculo percentual de progresso visível).
* **Aulas Teóricas (Vídeo/Resumo):** Implementada.
* **Quizzes Interativos:** Implementada (Apenas avança com resposta correta).
* **Práticas Pedagógicas (Uploads):** Implementada (Validação estrita de arquivo de imagem e texto no backend).
* **Emissão de Certificado:** Implementada (Depende de 100% de conclusão).
* **Integração com Google Drive:** Parcialmente implementada/A validar integração em tempo real na interface.

---

## 5. O que o sistema faz × O que o usuário faz

| Dimensão | Pergunta | Resposta/Exemplo no TeacherMakers |
| :--- | :--- | :--- |
| **Sistema** | O que o software executa? | Exibe o vídeo, bloqueia módulos futuros, calcula progresso, processa respostas do quiz e faz upload de evidências. |
| **Usuário** | O que o usuário precisa fazer? | Assistir ao conteúdo, ler os resumos, refletir e responder aos quizzes e realizar a atividade física ("mão na massa") no mundo real, registrando evidências. |
| **Sistema** | Qual resposta o software fornece? | Feedback imediato sobre o acerto ou erro no quiz; notificação de sucesso ao enviar a prática. |
| **Usuário** | O que o usuário precisa compreender? | Que a prática não é apenas digital; a plataforma serve como roteiro, mas a execução ocorre fora dela (sala de aula/escola), e as fotos comprovam a ação. |
| **Sistema** | Qual resultado o software produz? | Um certificado digital validável gerado ao atingir 100% de progresso. |
| **Usuário** | Qual resultado o usuário pretende alcançar? | Finalizar a capacitação e obter o certificado para progressão de carreira ou aplicação em sala de aula. |
| **Dependência** | Em quais pontos o desempenho de um depende do outro? | O avanço sistêmico só ocorre mediante a produção intelectual correta (acertar o quiz) e empírica (fazer o upload do diário de bordo e foto). A usabilidade do software influencia diretamente a motivação do usuário em concluir o curso. |

---

## 6. Objetivos e Público-alvo
* **Público:** Professores e educadores, variando desde iniciantes em tecnologia até profissionais experientes.
* **Objetivos:** Facilitar o letramento digital e maker desses professores para que repliquem com seus estudantes.

## 7. Funcionalidades e Fluxos Reais
* **Fluxo Crítico (Prática Pedagógica):**
    * **Ator:** Professor
    * **Objetivo:** Concluir uma atividade prática ("mão na massa").
    * **Tarefas Iniciais:** Acessar o módulo de prática.
    * **Passos executados:** Acessa roteiro -> lê instruções textuais -> executa fora do sistema -> redige Diário de Bordo no sistema -> seleciona Foto da Atividade -> envia.
    * **Decisões:** Selecionar a foto adequada que comprova a prática.
    * **Entradas:** Texto (diário) e Imagem (foto).
    * **Informações que precisam ser compreendidas:** A necessidade do formato exigido e preenchimento completo.
    * **Resultados esperados:** Submissão aceita e liberação da próxima fase.
    * **Erros Possíveis:** Esquecer de anexar a foto, tentar pular o texto, formato inválido.
    * **Resposta do sistema:** Backend barra com 400 Bad Request se faltar arquivo ou texto.
    * **Resultado final:** Prática concluída e registrada.

## 8. Atributos de Qualidade Relevantes
Considerando a natureza da aplicação (educacional, assíncrona, com carga prática):
1. **Qualidade Funcional:** O bloqueio pedagógico funciona de verdade?
2. **Usabilidade / Learnability:** O fluxo de envio de evidências é compreensível para professores no primeiro acesso?
3. **Qualidade Educacional:** O conteúdo, as atividades e os feedbacks do software são coerentes com os objetivos?
4. **UX / Experiência:** Como os estudantes/professores percebem a experiência?
5. **Acessibilidade:** Existem barreiras que dificultam o uso via teclado?
6. **Aprendizagem:** Existem evidências de mudança no conhecimento dos estudantes/professores após o uso?

## 9. Perguntas de Avaliação
1. *Qualidade funcional:* As funcionalidades implementadas (travas pedagógicas) executam corretamente os requisitos previstos (impedem avanço sem evidências)?
2. *Usabilidade (Inspeção):* A interface apresenta problemas visuais ou de fluxo que confundem os professores inexperientes?
3. *Learnability:* Usuários utilizando o sistema pela primeira vez conseguem compreender como iniciar e realizar o upload da prática?
4. *UX / Experiência:* Como os estudantes percebem a experiência de utilização do software (clara e satisfatória)?
5. *Qualidade educacional:* O conteúdo, as atividades e os feedbacks do software são coerentes com os objetivos educacionais (estimulam a reflexão e não apenas tentativa-erro)?
6. *Acessibilidade:* Existem barreiras de acessibilidade (contraste, teclado, leitores) que podem dificultar ou impedir o uso do sistema?
7. *Aprendizagem:* Existem evidências de mudança no conhecimento ou desempenho dos estudantes após a utilização do software?

---

## 10. Plano Mestre de Avaliação

O plano abrange 7 avaliações para mitigar os riscos identificados:
1. Avaliação Técnica (Foco no Back-end e Regras Restritivas)
2. Inspeção (Heurísticas de Interface)
3. Avaliação com Usuários (Teste de Usabilidade Focado na Prática)
4. Avaliação da Percepção/Experiência (Escala SUS)
5. Avaliação Educacional (Análise Pedagógica)
6. Avaliação de Acessibilidade (Inspeção WCAG e Teclado)
7. Avaliação de Aprendizagem (Pré e Pós-teste)

*Justificativas para a escolha das avaliações 6 e 7:*
* **Acessibilidade:** Um sistema educacional online público ou institucional deve ser inclusivo. Professores com deficiências visuais ou motoras precisam navegar, responder quizzes e enviar fotos. Acessibilidade avalia isso diretamente e previne exclusão. Outra abordagem técnica padrão foca apenas no código e não na interação do usuário atípico.
* **Aprendizagem:** O sistema é uma plataforma de capacitação. Validar que ele funciona não basta; é preciso validar que ele ensina. Somente medindo se o conhecimento foi alterado podemos responder à real finalidade do software.

---

## 11. Matriz Mestra de Avaliação

| Pergunta | Atributo | Método | Instrumento | Participantes | Evidência | Análise | Critério de Sucesso | Justificativa |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Travas impedem avanço indevido? | Qualidade Funcional | Avaliação Técnica | Scripts (Postman) | N/A | Código HTTP | Validação dos retornos esperados | 100% de recusa em faltas (400) | Testes técnicos confirmam se a API blinda o sistema contra acessos diretos. |
| Interface apresenta falhas? | Usabilidade | Inspeção | 10 Heurísticas de Nielsen | 3 Avaliadores | Violações de heurísticas | Estatística descritiva (severidade) | Ausência de falhas críticas (4) | Mapeia falhas estruturais antes do teste com usuário real. |
| Usuários iniciais conseguem subir foto? | Learnability | Teste de Usabilidade | Roteiro de tarefas | 5 a 8 Usuários | Taxa de sucesso | Análise quantitativa | Mínimo de 80% de sucesso não assistido | O comportamento observado é a única forma de provar o uso prático. |
| Qual a experiência e satisfação? | UX/Experiência | Avaliação de Experiência | Questionário SUS | Todos do teste | Escore de 0 a 100 | Cálculo padronizado do SUS | Escore superior a 72 | Ferramenta validada que transforma subjetividade em métrica numérica. |
| Feedback ajuda na aprendizagem? | Qualidade Educacional | Inspeção Pedagógica | Checklist de Alinhamento | 2 Pedagogos | Conteúdo do feedback analisado | Análise qualitativa | 100% de coerência formativa | Analisar o código não mede o impacto da frase no aprendizado. |
| Há barreiras de teclado/leitor? | Acessibilidade | Inspeção Acessibilidade | Lighthouse/Teclado | N/A | Violações da WCAG | Classificação das barreiras | Escore > 90, sem bloqueio de foco | Garante uso inclusivo; um teste comum não foca em uso por teclado. |
| Há mudança de conhecimento? | Aprendizagem | Experimento | Pré/Pós-teste Teórico | 15+ Professores | Notas dos testes pareados | Teste T de Student | Melhoria com p < 0.05 | Apenas um teste pareado isola a evolução de aprendizado da plataforma. |

---

## 12. Estrutura das Avaliações

### 12.1 Learnability — Facilidade de Aprendizagem

* **Pergunta:** O professor cursista consegue entender, logo no primeiro contato com a plataforma TeacherMakers, para que ela serve ?

* **Atributos:**
  * Clareza da finalidade do sistema;
  * Facilidade para entender as principais funcionalidades (dashboard, quizzes, envio de práticas);
  * Facilidade de aprendizado inicial sem tutoriais externos;
  * Clareza dos menus, rótulos de botões e termos utilizados;
  * Necessidade de ajuda externa para começar a usar o sistema.

* **Método:** Avaliação com usuários e observação da compreensão inicial. O professor acessa o sistema pela primeira vez e tenta entender sozinho o que é a plataforma, qual é a sequência de atividades e como avançar nas trilhas.

* **Justificativa:** A plataforma é usada de forma assíncrona e sem professor ao vivo. Se o cursista não conseguir entender o sistema no primeiro acesso, ele vai desistir antes mesmo de começar. Verificar a clareza inicial é fundamental para garantir que o sistema comunique bem sua proposta.

* **Instrumento:** Questionário inicial de compreensão e roteiro de tarefas de exploração livre (ex: "Sem instruções, descubra o que você precisa fazer para avançar no curso").

* **Participantes:** Professores que tenham pouco ou nenhum conhecimento prévio sobre a plataforma TeacherMakers.

* **Evidência:** Respostas ao questionário inicial (percentual de acertos sobre o objetivo do sistema), tempo necessário para compreender a primeira ação e falas registradas durante a tentativa livre.

* **Tipo de Análise:** Análise mista (quantitativa para o tempo/acertos e qualitativa descritiva para o comportamento verbalizado).

---

### 12.2 Teste de Usabilidade

* **Pergunta:** O professor cursista consegue realizar as principais tarefas da plataforma — especialmente o envio de foto e diário de bordo — de forma eficiente e sem dificuldades graves?

* **Atributos:**
  * Taxa de conclusão das tarefas;
  * Tempo para realizá-las;
  * Quantidade de erros cometidos;
  * Dificuldades encontradas no fluxo de envio;
  * Necessidade de auxílio durante o teste;
  * Eficiência geral na execução das tarefas críticas.

* **Método:** Teste de usabilidade baseado em tarefas. O avaliador apresenta a tarefa ao professor, observa em silêncio e registra cliques, hesitações, erros e tempo. O participante é orientado a "pensar em voz alta" durante o processo.

* **Justificativa:** O coração do curso é a atividade "mão na massa", que exige o envio simultâneo de foto e texto. Se o professor não conseguir concluir essa tarefa sozinho, a proposta formativa da plataforma falha na prática. Observar o comportamento real é a única forma de medir isso com precisão.

* **Instrumento:** Roteiro de tarefas (ex: "Acesse o módulo 1 e envie a foto e o diário de bordo da sua atividade"), checklist de observação e registro de erros e tempo.

* **Participantes:** 5 a 8 professores representativos do público-alvo que nunca utilizaram a plataforma — quantidade suficiente para revelar até 85% dos problemas de usabilidade restantes.

* **Evidência:** Taxa de conclusão com e sem ajuda, tempo na tarefa (em segundos), quantidade de cliques errados e apontamentos de barreira no checklist.

* **Tipo de Análise:** Análise mista: estatística descritiva (médias de tempo e taxa de sucesso) cruzada com análise qualitativa das dificuldades observadas.

---

### 12.3 Experiência do Usuário (UX)

* **Pergunta:** O que os professores cursistas acham da experiência proporcionada pela plataforma TeacherMakers durante e após sua utilização?

* **Atributos:**
  * Satisfação geral com a plataforma;
  * Percepção de facilidade de uso (Qualidade Pragmática);
  * Estímulo, engajamento e estética (Qualidade Hedônica);
  * Clareza das informações e feedbacks do sistema;
  * Confiança durante a navegação;
  * Percepção de utilidade para a formação;
  * Intenção de continuar utilizando e de recomendar para colegas.

* **Método:** Avaliação subjetiva da experiência imediatamente após a utilização do sistema, com a memória do teste ainda fresca, para capturar a percepção real do momento sem racionalizações posteriores.

* **Justificativa:** Um sistema pode funcionar tecnicamente mas ser cansativo ou desinteressante. O UEQ-S é ideal porque, além de medir a usabilidade (lado prático), ele mede o quanto o sistema é agradável e estimulante (lado emocional). Transformar essa percepção subjetiva em números permite descobrir se a plataforma engaja os professores ou apenas cumpre tabela.

* **Instrumento:** Questionário UEQ-S (User Experience Questionnaire - Short Version), composto por 8 pares de adjetivos opostos em uma escala de 7 pontos (ex: "confuso" vs "claro", "chato" vs "empolgante").

* **Participantes:** Os mesmos 5 a 8 professores que participaram do teste de usabilidade.

* **Evidência:** Notas de -3 a +3 atribuídas pelo professor a cada um dos 8 pares de adjetivos do questionário.

* **Tipo de Análise:** Análise quantitativa utilizando a ferramenta de cálculo oficial do UEQ-S, que gera os escores médios de Qualidade Pragmática, Qualidade Hedônica e Qualidade Global (onde valores > 0.8 são considerados bons).

---

### 12.4 Avaliação Técnica

* **Pergunta:** A plataforma TeacherMakers está de acordo com os requisitos funcionais e não funcionais definidos no projeto, especialmente as regras que bloqueiam o avanço indevido sem envio de evidências?

* **Atributos:**
  * Atendimento aos requisitos funcionais (bloqueio de avanço sem foto/diário);
  * Atendimento aos requisitos não funcionais (segurança, confiabilidade, desempenho);
  * Funcionamento correto das validações do backend;
  * Consistência dos dados armazenados;
  * Segurança contra submissões fraudulentas;
  * Compatibilidade com os requisitos definidos no projeto.

* **Método:** Inspeção técnica e verificação dos requisitos via testes de caixa preta. Enviar requisições diretas ao servidor tentando burlar as regras (sem foto, sem texto, com dados inválidos) e registrar as respostas obtidas.

* **Justificativa:** O certificado emitido pela plataforma só tem valor se as evidências de aprendizado forem reais. Se o sistema permitir avanço sem envio de foto e diário, a credibilidade do curso inteiro é comprometida. Testar diretamente o servidor é o único método que garante que a segurança existe além da interface visual.

* **Instrumento:** Checklist de requisitos e roteiro de testes técnicos via Postman (ferramenta que envia requisições diretas à API, simulando tentativas de fraude sem passar pelas telas do sistema).

* **Participantes:** Avaliadores técnicos / desenvolvedores da equipe.

* **Evidência:** Códigos de resposta do servidor (ex: HTTP 400 Bad Request ao invés de HTTP 200 OK) documentados via logs quando uma submissão inválida é tentada.

* **Tipo de Análise:** Análise binária (Passou / Falhou) focada estritamente na conformidade dos testes com a regra de negócios.

---

### 12.5 Inspeção Visual

* **Pergunta:** A interface da plataforma TeacherMakers apresenta elementos visuais claros e consistentes que orientam o professor durante toda a jornada do curso?

* **Atributos:**
  * Hierarquia visual das informações;
  * Organização dos elementos nas telas;
  * Consistência visual entre os módulos;
  * Legibilidade de textos e instruções;
  * Clareza dos botões de ação e mensagens de feedback;
  * Feedback visual após ações (envio de arquivo, conclusão de quiz);
  * Facilidade de identificar o que fazer em cada tela.

* **Método:** Percurso Cognitivo (Cognitive Walkthrough). Os avaliadores percorrem as principais jornadas da plataforma (onboarding, aula, quiz, envio de prática) fazendo quatro perguntas para cada passo: o usuário sabe o que fazer? Consegue ver como fazer? Entende o que aconteceu? Recebe feedback adequado?

* **Justificativa:** Verificar, sob a perspectiva da interação, se a interface fornece informações suficientes para que o professor entenda o que pode fazer, identifique as ações disponíveis e perceba os resultados de cada clique — especialmente em fluxos complexos como o upload de evidências, que é o ponto mais crítico do sistema.

* **Instrumento:** Roteiro de Percurso Cognitivo e checklist de inspeção visual aplicados nas telas principais: login, dashboard, módulo de aula, quiz e envio de prática.

* **Participantes:** 2 a 3 avaliadores com conhecimento em interface, interação humano-computador ou usabilidade.

* **Evidência:** Lista detalhada de problemas visuais ou falhas de interação identificados no fluxo, com capturas de tela (prints) apontando o local exato do erro.

* **Tipo de Análise:** Análise qualitativa descritiva baseada na resposta às quatro perguntas fundamentais do Percurso Cognitivo para cada passo.

---

### 12.6 Avaliação Educacional

* **Pergunta:** O professor cursista compreende minimamente o conteúdo educacional apresentado pela plataforma (Cultura Maker e Pensamento Computacional) e consegue identificar os conceitos básicos trabalhados?

* **Atributos:**
  * Compreensão do conteúdo apresentado nas aulas;
  * Conhecimento prévio do participante (linha de base);
  * Assimilação das informações após o uso;
  * Capacidade de interpretar o conteúdo e os feedbacks dos quizzes;
  * Identificação de conceitos básicos de Cultura Maker;
  * Diferença de desempenho entre quem já conhece e quem não conhece o conteúdo.

* **Método:** Aplicação de questionário diagnóstico antes de iniciar o curso e questionário de compreensão após a utilização do sistema. A diferença entre as notas revela o quanto a plataforma contribuiu para o aprendizado.

* **Justificativa:** Verificar se a plataforma cumpre sua finalidade educacional e identificar o nível de conhecimento prévio dos participantes, permitindo diferenciar dificuldades causadas pelo sistema de dificuldades relacionadas ao conteúdo em si. Um sistema pode ser fácil de usar mas não ensinar nada — esse teste avalia justamente esse ponto.

* **Instrumento:** Questionário diagnóstico (pré-teste) e questionário de compreensão/aprendizagem (pós-teste), ambos com as mesmas questões sobre Cultura Maker e Pensamento Computacional.

* **Participantes:** professores pertencentes ao público educacional definido para o sistema, preferencialmente iniciantes no tema para evitar o "efeito teto" nas notas iniciais.

* **Evidência:** Duas notas exatas de 0 a 10 para cada participante (a nota tirada no primeiro dia e a nota tirada após a conclusão).

* **Tipo de Análise:** Análise quantitativa inferencial, utilizando teste estatístico (Teste T de Student pareado) para comprovar matematicamente que a melhora nas notas não foi por acaso (p < 0,05).

---

### 12.7 Avaliação de Desempenho (Performance)

* **Pergunta:** A plataforma TeacherMakers carrega rapidamente e apresenta um tempo de resposta satisfatório, evitando a frustração e o abandono por parte do professor?

* **Atributos:**
  * Tempo de carregamento da página inicial;
  * Tempo de resposta das interações básicas;
  * Desempenho em dispositivos móveis e desktops.

* **Método:** Avaliação automatizada de desempenho. Utiliza-se uma ferramenta de mercado para simular o acesso à plataforma e medir o tempo exato de carregamento e execução dos recursos.

* **Justificativa:** A lentidão é uma das principais causas de rejeição em sistemas educacionais. Optou-se por essa avaliação porque ela é 100% automatizada e não exige recrutamento de usuários nem inspeção manual trabalhosa. Basta inserir a URL na ferramenta para obter o diagnóstico completo instantaneamente, sendo extremamente fácil e rápida de aplicar, adequando-se perfeitamente ao tempo restrito do projeto.

* **Instrumento:** Ferramentas automatizadas e gratuitas de medição de performance (ex: Google Lighthouse, PageSpeed Insights ou GTmetrix).

* **Participantes:** Nenhum (avaliação totalmente automatizada por software).

* **Evidência:** Relatório exportado pela ferramenta contendo a pontuação de desempenho (nota de 0 a 100) e os tempos de carregamento (em segundos).

* **Tipo de Análise:** Análise puramente quantitativa, baseada nas métricas exatas de tempo e pontuação geradas automaticamente pelo software.

---

## 13. Plano de Coleta e Análise

* Avaliação técnica, heurística, de desempenho e educacional serão feitas pelos pesquisadores sem envolver os usuários finais e analisarão os resultados de acordo com os manuais e relatórios gerados de cada método.
* As avaliações com usuários (Usabilidade, Percepção, Aprendizagem) serão conduzidas com os professores e analisarão **Dados quantitativos** (taxa de sucesso, tempo, escore SUS, pontuação de conhecimento) usando estatística, e **Dados qualitativos** (entrevistas breves, observações, falas) para entender a origem dos números.
* *Nota: Avaliação planejada — resultados ainda não coletados. Os números, depoimentos e participantes não foram fabricados.*

## 14. Triangulação

Para garantir profundidade, a avaliação triangulará os resultados da Usabilidade.
Se o *Teste com Usuários* mostrar que 40% não conseguiram subir a foto (comportamento observado), iremos olhar para a *Inspeção* para ver se a interface violou alguma heurística naquele botão (problema de interface), e olharemos para a *Avaliação da Percepção* (SUS) para confirmar se essa dificuldade reduziu drasticamente o nível de satisfação daquele indivíduo (percepção).
Essa convergência nos dirá exatamente "o que", "por que" e "como consertar".

## 15. Rastreabilidade

O processo de raciocínio é plenamente rastreável:
**Requisito de envio prático (RF12/13)** -> **Pergunta:** *Usuários conseguem mandar foto?* -> **Avaliação:** *Usabilidade* -> **Instrumento:** *Roteiro de Tarefa* -> **Evidência (esperada):** *Tempo e taxa de sucesso* -> **Análise:** *Estatística* -> **Conclusão:** *Se < 80%, reformular a tela.*

## 16. Limitações
A maior limitação deste plano reside na avaliação em ambiente controlado (usabilidade), que difere do uso real nas escolas (conexão instável, barulho). Além disso, não foi possível verificar com as evidências disponíveis se a integração com repositórios externos está ocorrendo da forma fluida relatada.

## 17. Recomendações Priorizadas (Conforme Levantamento Inicial)
Apesar dos dados das pessoas não estarem coletados, do ponto de vista do software levantado:
1. **Crítica:** A API de backend deve ser robusta o suficiente na rota `/progress/pratica/finish` (verificado via Avaliação Técnica) antes do envio para qualquer professor.
2. **Alta:** O conteúdo pedagógico precisa ser totalmente revisado (Avaliação Educacional) antes da emissão de qualquer certificado, sob pena de perda de credibilidade do sistema.
3. **Média:** Ajustes de acessibilidade por teclado identificados previamente.
4. **Baixa:** Refinamento estético caso o SUS caia abaixo de 72.

## 18. Conclusão
* **O que o sistema faz:** Bloqueia avanços indevidos e entrega conteúdo.
* **O que o usuário precisa fazer:** Interpretar o texto, atuar no mundo físico, fotografar e validar o seu retorno no sistema.
* **Principais riscos de qualidade:** Gargalo na submissão e deficiências de aprendizado teórico/prático real.
* **Perguntas respondidas:** Como faremos para avaliar sem suposições? Com esse plano mestre aprovado.
* **Ainda dependem de coleta:** Avaliação planejada; resultados das 7 frentes (métricas de usuários e de testadores) ainda dependem de coleta de dados em campo para as conclusões definitivas de uso.
