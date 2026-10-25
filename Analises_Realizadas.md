# Relatório Técnico: Análises Realizadas
## Dossiê de Avaliação da Qualidade do Software TeacherMakers

**Sistema Avaliado:** TeacherMakers — Plataforma de Formação Docente em Cultura Maker e Pensamento Computacional  
**Versões Avaliadas:** v1.0 / Ambiente de Produção (Render)  
**Data da Consolidação:** Outubro de 2026  
**Responsável Técnico:** Equipe de Qualidade e Avaliação de Software  

---

## 1. Introdução e Escopo Analítico

Este documento consolida o processamento quantitativo e qualitativo de todos os dados empíricos coletados durante o ciclo de avaliação do TeacherMakers. As análises aqui apresentadas fundamentam-se estritamente nas respostas coletadas através dos instrumentos validados e preenchidos nas planilhas de auditoria:
1. Questionário de Experiência do Usuário (UEQ-S) ($N = 9$);
2. Avaliação de Primeiro Acesso e Aprendizagem Inicial — Learnability ($N = 3$);
3. Ficha de Teste de Usabilidade da Tarefa Crítica ($N = 2$);
4. Checklist de Avaliação Técnica e Segurança da API ($N = 2$);
5. Ficha de Inspeção Visual e Percurso Cognitivo ($N = 2$);
6. Auditoria de Desempenho e Conformidade Técnica — Lighthouse ($N = 1$);
7. Avaliação de Conhecimento — Pré/Pós-teste Educacional ($N = 1$).

---

## 2. Análise da Avaliação de Experiência do Usuário (UEQ-S)

### 2.1 Metodologia e Pré-processamento
O questionário UEQ-S (User Experience Questionnaire - Versão Reduzida) foi respondido por 9 participantes. O instrumento é estruturado em uma escala semântica bipolar de 7 pontos (1 a 7). Conforme o manual estatístico oficial do UEQ:
* Os valores brutos de 1 a 7 são transformados para a escala centrada em zero de **$-3$ (extremamente negativo) a $+3$ (extremamente positivo)** através da subtração da constante 4 ($Valor_{transformado} = Valor_{bruto} - 4$).
* A escala subdivide-se em duas dimensões principais de 4 itens cada:
  * **Qualidade Pragmática (QP):** Avalia a utilidade, facilidade de uso e eficiência (Itens 1 a 4: *Obstrutivo–Apoiador, Complicado–Fácil, Ineficiente–Eficiente, Confuso–Claro*).
  * **Qualidade Hedônica (QH):** Avalia o apelo estético, estimulação, novidade e criatividade (Itens 5 a 8: *Chato–Empolgante, Desinteressante–Interessante, Convencional–Inovador, Tradicional–Criativo*).
* A **Qualidade Geral (QG)** corresponde à média aritmética global dos 8 itens.

### 2.2 Resultados Individuais Transformados

| Participante | QP (Itens 1-4) | QH (Itens 5-8) | Pontuação Geral (UEQ-S) | Classificação do Participante |
| :--- | :---: | :---: | :---: | :--- |
| **Anônimo (P1)** | $+0,75$ | $+1,00$ | $+0,88$ | Positivo |
| **Alessandra Corrêa** | $+2,00$ | $+0,75$ | $+1,38$ | Muito Positivo |
| **Éric Viana** | $+2,00$ | $+0,25$ | $+1,12$ | Muito Positivo |
| **Diedson Kenned G. Mota** | $+1,75$ | $+1,25$ | $+1,50$ | Muito Positivo |
| **Fátima** | $+2,25$ | $+1,25$ | $+1,75$ | Muito Positivo |
| **Victor Cesar S. Monteiro** | $+2,00$ | $+2,00$ | $+2,00$ | Excelente |
| **Laissa Martins** | $+0,00$ | $-2,75$ | $-1,38$ | Crítico / Negativo |
| **Kaik Dos Santos Caldas** | $+0,00$ | $+0,75$ | $+0,38$ | Neutro |
| **Jean Miguel** | $+0,00$ | $-1,75$ | $-0,88$ | Neutro-Negativo |

### 2.3 Estatística Descritiva por Item

| Item | Par de Adjetivos Bipolar | Dimensão | Média ($-3$ a $+3$) | Desvio Padrão (DP) | Interpretação |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | Obstrutivo $\leftrightarrow$ Apoiador | Pragmática | **$+0,89$** | $1,54$ | Positivo |
| **2** | Complicado $\leftrightarrow$ Fácil | Pragmática | **$+1,78$** | $0,97$ | Excelente (Menor dispersão) |
| **3** | Ineficiente $\leftrightarrow$ Eficiente | Pragmática | **$+1,00$** | $1,58$ | Positivo |
| **4** | Confuso $\leftrightarrow$ Claro | Pragmática | **$+1,11$** | $1,36$ | Positivo |
| **5** | Chato $\leftrightarrow$ Empolgante | Hedônica | **$0,00$** | $1,94$ | Neutro |
| **6** | Desinteressante $\leftrightarrow$ Interessante | Hedônica | **$+0,67$** | $2,06$ | Neutro-Positivo (Alta dispersão) |
| **7** | Convencional $\leftrightarrow$ Inovador | Hedônica | **$+0,33$** | $1,73$ | Neutro |
| **8** | Tradicional $\leftrightarrow$ Criativo | Hedônica | **$+0,22$** | $1,79$ | Neutro |

### 2.4 Consolidação das Escalas e Interpretação

| Escala UEQ-S | Média Amostral | Desvio Padrão | Intervalo de Confiança (95%) | Benchmark Oficial UEQ |
| :--- | :---: | :---: | :---: | :--- |
| **Qualidade Pragmática** | **$+1,19$** | $0,99$ | $[+0,54; +1,84]$ | **Positivo / Bom** ($> 0,80$) |
| **Qualidade Hedônica** | **$+0,31$** | $1,55$ | $[-0,70; +1,32]$ | **Neutra** ($-0,80 \le \bar{x} \le +0,80$) |
| **Qualidade Geral** | **$+0,75$** | $1,17$ | $[-0,01; +1,51]$ | **Neutra / Limítrofe com Positivo** |

### 2.5 Discussão dos Resultados de UX
1. **Ponto Forte (Facilidade e Clareza):** O item com maior média foi *Complicado vs. Fácil* ($+1,78$, $\text{DP} = 0,97$), evidenciando que a plataforma não impõe fricção técnica excessiva na operação básica. A Qualidade Pragmática consolidada ($+1,19$) superou o limiar de excelência do benchmark ($0,80$).
2. **Ponto Crítico (Engajamento e Estímulo Visual):** A Qualidade Hedônica média ($+0,31$) revela que, embora o sistema seja fácil de usar, ele não é percebido como notavelmente empolgante, inovador ou criativo. Houve uma polarização acentuada: participantes como Victor Cesar avaliaram com nota máxima ($+2,00$), enquanto Laissa Martins e Jean Miguel registraram notas muito baixas ($-2,75$ e $-1,75$). Esse distanciamento aponta para perfis de usuários que demandam maior ludicidade, identidade visual maker mais rica e elementos de gamificação.

---

## 3. Análise da Facilidade de Aprendizagem (Learnability)

### 3.1 Participantes e Perfil
* Amostra: $N = 3$ educadores (códigos: `AC23`, `p01`, `DK29`).
* Experiência prévia: 1 usuário em primeiro acesso estrito (`AC23`) e 2 com familiaridade mínima (`p01` e `DK29`).

### 3.2 Indicadores Quantitativos e Taxas

| Indicador Avaliado | Critério de Sucesso | Resultado Obtido | Status |
| :--- | :---: | :---: | :---: |
| **Compreensão da Finalidade do Sistema** | $\ge 80\%$ | **100%** (3/3 identificaram capacitação continuada em Cultura Maker) | **Atingido** |
| **Identificação de Funcionalidades-Chave** | $\ge 80\%$ | **100%** (3/3 reconheceram módulos teóricos, práticos e quizzes) | **Atingido** |
| **Autonomia de Navegação Inicial** | $\ge 80\%$ | **100%** (3/3 navegaram sem auxílio do avaliador) | **Atingido** |
| **Tempo para Compreensão da Primeira Ação** | $\le 3\text{ min}$ | **100%** (1 em $< 1\text{ min}$; 2 entre $1$ e $3\text{ min}$) | **Atingido** |

### 3.3 Análise das Afirmações em Escala Likert (1 a 5)

| Afirmação de Learnability | Média | Mediana | Interpretação |
| :--- | :---: | :---: | :--- |
| *Menus, botões e termos claros e intuitivos* | $4,33$ | $4,0$ | Concordância elevada |
| *Evidência de onde clicar para iniciar/avançar* | $4,67$ | $5,0$ | Ponto focal de ação muito claro |
| *Organização visual ajudou a entender a sequência* | $4,00$ | $4,0$ | Estruturação lógica do dashboard bem percebida |
| *Necessidade de tutorial ou manual externo* | $3,00$ | $4,0$ | **Alerta:** Dois participantes afirmaram que um tutorial ajudaria |

### 3.4 Síntese de Learnability
A learnability atendeu com folga aos critérios de corte: nenhum professor necessitou de intervenção do avaliador para dar o primeiro passo, e a finalidade formativa foi apreendida imediatamente. Entretanto, a nota média $3,00$ na questão de necessidade de tutorial indica que um breve vídeo explicativo ou onboarding guiado no primeiro login reduziria a sensação de insegurança inicial reportada por 2 participantes.

---

## 4. Análise do Teste de Usabilidade da Tarefa Crítica

### 4.1 Cenário da Tarefa
A tarefa crítica consistiu na execução completa do fluxo de certificação prática:
$$\text{Localizar Módulo 1} \longrightarrow \text{Acessar Roteiro Prático} \longrightarrow \text{Redigir Diário de Bordo} \longrightarrow \text{Anexar Foto Comprobatória} \longrightarrow \text{Submeter}$$

### 4.2 Indicadores de Desempenho por Participante

| Participante | Dispositivo | Conclusão | Tempo | Erros | Desvios de Rota | Facilidade Percebida (1-5) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **lm** | Desktop / Notebook | Sucesso sem ajuda | $01:00\text{ min}$ | 0 erros | Nenhum desvio | $5,0$ (Muito Fácil) |
| **DK29** | Tablet | Sucesso sem ajuda | $30:10\text{ min}$ | 2 erros | 1 a 2 cliques fora | $5,0$ (Muito Fácil) |

### 4.3 Métricas Consolidadas
* **Taxa de Conclusão sem Ajuda:** $100\%$ ($2/2$ participantes).
* **Taxa de Erros:** Média de $1,0$ erro por sessão ($0$ em desktop; $2$ em tablet).
* **Tempo Médio de Execução:** $15\text{ min }35\text{ s}$ (Altamente influenciado pelo tempo de redação/fotografia no tablet).
* **Classificação de Facilidade:** $5,0 / 5,0$ (Média unânime de satisfação direta com a execução).

### 4.4 Dificuldades e Barreiras Mapeadas
1. **Dificuldade de Localização do Módulo 1:** Ambos os participantes relataram hesitação ao procurar onde começava a trilha na tela inicial.
2. **Invisibilidade do Feedback de Sucesso:** O participante `lm` completou o envio, mas não percebeu claramente a notificação de confirmação (toast/mensagem desapareceu rápido demais).
3. **Ergonomia do Diário de Bordo no Tablet:** O participante `DK29` apontou que o campo de texto era pouco visível e desconfortável para digitação no teclado virtual do tablet.
4. **Anomalia de Estado (Bug de Progresso):** No participante `DK29`, o módulo introdutório constava incorretamente como já concluído no primeiro login do usuário, gerando estranheza.

---

## 5. Análise da Avaliação Técnica e Segurança da API

### 5.1 Protocolo de Testes
Dois avaliadores técnicos (`lm` no ambiente Render e `Diedson Kenned` na compilação `v1.0`) executaram testes de injeção de requisições diretas via cliente HTTP (Postman/cURL) contra a rota de submissão de práticas (`/progress/pratica/finish` e rotas correlatas).

### 5.2 Resultados por Cenário de Teste

| Cenário | Descrição do Teste | Código HTTP Retornado | Status |
| :---: | :--- | :---: | :---: |
| **C1** | Tentativa de avanço sem anexo de foto | 400 Bad Request / 422 Unprocessable Entity | **PASSOU (100%)** |
| **C2** | Tentativa de envio com Diário de Bordo vazio ou espaços | 400 Bad Request / 422 informando texto obrigatório | **PASSOU (100%)** |
| **C3** | Upload de arquivo malicioso / não suportado (`.exe`, `.sh`) | 400 / 415 Unsupported Media Type | **PASSOU (100%)** |
| **C4** | Requisição sem token ou com JWT forjado | 401 Unauthorized / 403 Forbidden | **PASSOU (100%)** |
| **C5** | Avanço forçado pulando pré-requisitos pedagógicos | 400 / 403 Bloqueio de pré-requisito | **PASSOU (100%)** |

### 5.3 Divergência Crítica: Consistência Transacional do Banco de Dados
Embora todas as requisições anômalas tenham sido bloqueadas com códigos HTTP adequados na camada de controle, houve uma divergência substancial quanto ao estado final da base de dados:
* **Avaliador 1 (Ambiente Render):** Reportou consistência total (banco íntegro, sem registros órfãos).
* **Avaliador 2 (Ambiente Local/v1.0):** Constatou que requisições que falharam parcialmente geraram **registros parciais no banco de dados** (escrita incompleta sem rollback transacional).
* **Veredicto:** A avaliação foi classificada como **REPROVADA na v1.0** devido à ausência de transações atômicas (`BEGIN TRANSACTION / COMMIT / ROLLBACK`) nas rotas de submissão multipart.

---

## 6. Análise de Inspeção Visual e Percurso Cognitivo

### 6.1 Método e Escopo
A inspeção foi conduzida por dois avaliadores especialistas em IHC (`lm` e `Matheus Dos Anjos`), focando na tela central do sistema: **Tela 2 — Dashboard Principal / Trilha dos Módulos**.

### 6.2 Respostas às Quatro Perguntas do Percurso Cognitivo

| Pergunta Cognitiva | Avaliador 1 (lm) | Avaliador 2 (Matheus) | Veredicto Consolidado |
| :--- | :--- | :--- | :--- |
| **1. O usuário sabe o que fazer?** | PARCIALMENTE — Muitos estímulos competem pela atenção. | PARCIALMENTE — Concorrência visual de elementos. | **Atenção:** Dashboard sobrecarregado visualmente. |
| **2. O usuário vê como fazer?** | SIM — Botão de ação com excelente destaque. | SIM — Botão de ação com excelente destaque. | **Aprovado:** Call-to-action evidente. |
| **3. Entende que a ação leva ao objetivo?** | PARCIALMENTE — Texto ambíguo / ícone pouco intuitivo. | SIM — Rótulo claro e direto. | **Atenção:** Iconografia e termos podem gerar dúvidas. |
| **4. Recebe feedback adequado após agir?** | PARCIALMENTE — Feedback sutil ou passageiro. | SIM — Mensagem evidente. | **Atenção:** Duração dos toasts/notificações. |

### 6.3 Avaliação das Dimensões Estéticas e Estruturais (Escala 1 a 5)

| Dimensão Visual | Avaliador 1 | Avaliador 2 | Média | Classificação |
| :--- | :---: | :---: | :---: | :---: |
| **Hierarquia Visual** (tamanhos e blocos) | 3 (Regular) | 4 (Bom) | **$3,5$** | Regular-Bom |
| **Legibilidade e Contraste** | 3 (Regular) | 5 (Excelente) | **$4,0$** | Bom |
| **Consistência de Estilo** | 3 (Regular) | 4 (Bom) | **$3,5$** | Regular-Bom |
| **Clareza das Mensagens e Instruções** | 2 (Ruim) | 3 (Regular) | **$2,5$** | **Deficiente (Alerta)** |

### 6.4 Problemas Identificados
* **Quebra de Layout em Tablets:** O avaliador Matheus documentou que em telas intermediárias (tablets) as grades e cards de módulos perdem a coerência espacial, sobrepondo-se ou desalinhando botões (Severidade: Menor/Média).
* **Textos de Orientação Concisos Demais:** A clareza das mensagens obteve a menor média ($2,5$), apontando que faltam textos explicativos curtos abaixo dos títulos dos módulos.

---

## 7. Análise de Desempenho e Acessibilidade (Lighthouse)

### 7.1 Dados da Coleta
* Auditor: Diedson Kenned.
* Ferramenta: Google Chrome DevTools / Lighthouse v11.
* Tela: Tela de Conteúdo da Aula (Vídeo/Texto).
* Condição: Emulação Mobile (Conexão 4G simulada).

### 7.2 Métricas de Performance

| Métrica Lighthouse | Valor Coletado | Limiar Aceitável (Google) | Status |
| :--- | :---: | :---: | :---: |
| **Pontuação Geral de Desempenho** | **84 / 100** | $\ge 90$ (Excelente) / $50-89$ (Alerta) | **Em Alerta / Adequado** |
| **First Contentful Paint (FCP)** | **0,5 s** | $\le 1,8\text{ s}$ | **Excelente** |
| **Largest Contentful Paint (LCP)** | **2,0 s** | $\le 2,5\text{ s}$ | **Bom** |
| **Total Blocking Time (TBT)** | **50 ms** | $\le 200\text{ ms}$ | **Excelente** |
| **Cumulative Layout Shift (CLS)** | **0,04** | $\le 0,10$ | **Excelente** |

### 7.3 Métrica de Acessibilidade
* **Pontuação de Acessibilidade:** **$50 / 100$** (Classificação: **Crítica / Reprovada**).
* **Diagnóstico:** O carregamento e rendering são ágeis ($84/100$), mas a conformidade com diretrizes da WCAG 2.1 é deficiente. O escore de $50$ decorre de contraste inadequado de elementos secundários, ausência de atributos `aria-label` e suporte parcial a navegação estrita por teclado.

---

## 8. Análise da Avaliação Educacional (Pré/Pós-teste)

### 8.1 Resultados Coletados
* Participante: `lm`.
* Momento: Pós-teste (após percorrer o sistema).
* **Nota Obtida:** **$9,0 / 10,0$** ($90\%$ de aproveitamento).

### 8.2 Discriminação por Questão

| Questão | Eixo Temático | Resposta do Participante | Avaliação |
| :---: | :--- | :--- | :---: |
| **Q1** | Cultura Maker — Conceito | *"Uma metodologia centrada na transmissão teórica de conteúdos por meio de apostilas..."* | **INCORRETA** (Concepção tradicional) |
| **Q2** | Cultura Maker — Papel do Erro | Iteração, prototipagem e reflexão | **CORRETA** |
| **Q3** | Pensamento Computacional — Decomposição | Dividir problema em partes menores | **CORRETA** |
| **Q4** | Pensamento Computacional — Padrões | Reconhecimento de semelhanças e reaproveitamento | **CORRETA** |
| **Q5** | Pensamento Computacional — Abstração | Filtrar elementos irrelevantes | **CORRETA** |
| **Q6** | Pensamento Computacional — Algoritmos | Sequência lógica finita e ordenada | **CORRETA** |
| **Q7** | Computação Desplugada | Viabilidade sem telas/computadores | **CORRETA** |
| **Q8** | Diário de Bordo | Estímulo à metacognição e documentação | **CORRETA** |
| **Q9** | Recursos na Escola Pública | Projetos relevantes com sucata e baixo custo | **CORRETA** |
| **Q10** | Papel do Educador | Mediador, facilitador e estimulador da autonomia | **CORRETA** |

### 8.3 Limitação Metodológica Formal
O Plano Mestre previa a aplicação pareada (Pré-teste antes do curso $\times$ Pós-teste após o curso) com cálculo do Teste T de Student para amostras pareadas ($p < 0,05$). Como a base possui apenas $1$ resposta e esta é exclusiva do pós-teste, **o cálculo inferencial paramétrico é matematicamente impossível**. A evidência permanece no nível descritivo-qualitativo, demonstrando que o cursista assimilou $90\%$ dos conceitos estruturais, apresentando lacuna apenas na distinção conceitual inicial entre educação tradicional e Cultura Maker.
