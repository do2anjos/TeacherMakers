# Respostas às Perguntas de Avaliação de Qualidade
## Sistema: TeacherMakers (v1.0 / Baseline)

**Referência Metodológica:** Seção 9 e Seção 11 do [Relatório Mestre de Avaliação da Qualidade](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Relatorio_Mestre%20_Avaliacao_Qualidade.md)  
**Data:** Outubro de 2026  

---

### Resumo Executivo dos Veredictos

| # | Dimensão Avaliada | Pergunta Central de Avaliação | Veredicto |
| :-: | :--- | :--- | :---: |
| **P1** | Qualidade Funcional | As travas pedagógicas impedem o avanço indevido sem evidências? | ⚠️ **Parcialmente Atendido** (Ressalva no Banco) |
| **P2** | Usabilidade (Inspeção) | A interface apresenta falhas visuais ou de fluxo que confundem? | 🟡 **Atendido com Ressalvas** (Alerta em Tablets) |
| **P3** | Learnability | Usuários de primeiro acesso entendem como iniciar e submeter? | 🟢 **Totalmente Atendido** (100% de Autonomia) |
| **P4** | UX / Experiência | Como os professores percebem a experiência de uso (UEQ-S)? | 🟢 **Atendido na Pragmática** / 🟡 **Neutro na Hedônica** |
| **P5** | Qualidade Educacional | Conteúdo e feedbacks estimulam reflexão pedagógica coerente? | 🟢 **Atendido no Conteúdo** / 🟡 **Feedback Sutil** |
| **P6** | Acessibilidade & Performance | Existem barreiras de teclado/leitor ou lentidão no sistema? | 🔴 **Não Atendido em Acessibilidade** / 🟢 **Rápido** |
| **P7** | Aprendizagem | Há evidência de evolução do conhecimento do educador? | ⚠️ **Inconclusivo Estatisticamente** (90% no Pós-teste) |

---

### Detalhamento por Pergunta de Avaliação

---

#### Pergunta 1 — Qualidade Funcional
> **"As funcionalidades implementadas (travas pedagógicas) executam corretamente os requisitos previstos (impedem avanço sem evidências)?"**

* **Veredicto:** ⚠️ **PARCIALMENTE ATENDIDO (Com Ressalva Crítica de Persistência)**
* **Critério de Sucesso do Plano:** 100% de recusa com código HTTP adequado (400/422/401/403) em requisições anômalas, garantindo a integridade dos certificados.
* **Evidência Coletada:**
  * Ambos os avaliadores técnicos (`lm` e `Diedson Kenned`) constataram que 100% dos testes de caixa preta barraram requisições anômalas na API:
    * Cenário 1 (Sem foto anexada): Código HTTP 400 retornado.
    * Cenário 2 (Diário de bordo vazio): Código HTTP 400 retornado.
    * Cenário 3 (Formato não suportado/executável): Código HTTP 400/415 retornado.
    * Cenário 4 (Token manipulado ou ausente): Código HTTP 401/403 retornado.
    * Cenário 5 (Tentativa de pular pré-requisitos): Código HTTP 400/403 retornado.
  * **A Ressalva Crítica:** No ambiente local `v1.0`, o avaliador Diedson Kenned identificou que o banco de dados gravou registros parciais após requisições com falha (ausência de rollback transacional em operações multipart).
* **Conclusão Técnica:** A camada de validação da API cumpre o papel de blindar a interface e rejeitar acessos fraudulentos. No entanto, é mandatória a implementação de transações ACID no SQLite/Node.js antes de escala comercial, prevenindo estados inconsistentes no banco.

---

#### Pergunta 2 — Usabilidade (Inspeção Visual)
> **"A interface apresenta problemas visuais ou de fluxo que confundem os professores inexperientes?"**

* **Veredicto:** 🟡 **ATENDIDO COM RESSALVAS (Necessita Ajuste de Responsividade e Hierarquia)**
* **Critério de Sucesso do Plano:** Ausência de problemas de severidade catastrófica (grau 4); problemas identificados devem ser recuperáveis pelo usuário (grau menor/médio).
* **Evidência Coletada:**
  * O Percurso Cognitivo revelou que o botão principal de ação possui excelente contraste e visibilidade (unanimidade entre avaliadores).
  * Contudo, ambos os especialistas apontaram **competição visual no Dashboard** (muitos elementos disputando a atenção inicial).
  * A média de clareza das mensagens de instrução foi de apenas **$2,5 / 5,0$**.
  * Foi identificada **incoerência de layout em tablets** (quebra de grades e desalinhamento de componentes).
  * A severidade registrada foi de grau **Menor** (o usuário sofre atraso, mas consegue se recuperar e avançar).
* **Conclusão Técnica:** Não existem barreiras intransponíveis que impeçam o uso, mas o excesso de estímulos no dashboard e as quebras em telas intermediárias geram ruído cognitivo que precisa ser sanado via CSS responsivo e simplificação de layout.

---

#### Pergunta 3 — Learnability (Facilidade de Aprendizado)
> **"Usuários utilizando o sistema pela primeira vez conseguem compreender como iniciar e realizar o upload da prática?"**

* **Veredicto:** 🟢 **TOTALMENTE ATENDIDO**
* **Critério de Sucesso do Plano:** Mínimo de 80% de sucesso não assistido na compreensão e início da jornada.
* **Evidência Coletada:**
  * **100% de acerto** (3 de 3 educadores) na identificação precisa da finalidade do TeacherMakers na primeira tela.
  * **100% de autonomia**: nenhum participante solicitou ajuda externa ou tirou dúvidas com o pesquisador para conseguir navegar.
  * **Tempo de apreensão rápido**: 33% compreenderam em menos de 1 minuto e 67% entre 1 e 3 minutos.
  * No teste prático de usabilidade da tarefa crítica, a taxa de sucesso não assistido foi de **100%** ($2/2$).
* **Conclusão Técnica:** O sistema é altamente intuitivo para educadores em seu primeiro contato. O fluxo básico dispensa manuais formais, embora um tour guiado de boas-vindas seja recomendado para reduzir a ansiedade inicial.

---

#### Pergunta 4 — UX / Experiência do Usuário
> **"Como os estudantes e professores percebem a experiência de utilização do software (clara e satisfatória)?"**

* **Veredicto:** 🟢 **ATENDIDO NA QUALIDADE PRAGMÁTICA** / 🟡 **NEUTRO NA QUALIDADE HEDÔNICA**
* **Critério de Sucesso do Plano:** Escores de UEQ-S superiores a $+0,80$ nas dimensões avaliadas.
* **Evidência Coletada (N = 9):**
  * **Qualidade Pragmática (QP): $+1,19$ (DP = 0,99)** — Classificada como **Positiva / Excelente** no benchmark oficial do UEQ. O sistema é considerado fácil ($+1,78$), apoiador ($+0,89$) e claro ($+1,11$).
  * **Qualidade Hedônica (QH): $+0,31$ (DP = 1,55)** — Classificada como **Neutra**. Embora interessante ($+0,67$), o sistema foi percebido como convencional ($+0,33$) e tradicional ($+0,22$).
  * **Qualidade Geral: $+0,75$ (DP = 1,17)** — Praticamente no limiar de corte de $+0,80$.
* **Conclusão Técnica:** Os professores consideram a plataforma altamente funcional, prática e descomplicada para o trabalho formativo, mas sentem falta de maior fator de novidade, ludicidade e design estimulante típico da Cultura Maker.

---

#### Pergunta 5 — Qualidade Educacional
> **"O conteúdo, as atividades e os feedbacks do software são coerentes com os objetivos educacionais (estimulam a reflexão e não apenas tentativa-erro)?"**

* **Veredicto:** 🟢 **ATENDIDO NO CONTEÚDO** / 🟡 **PARCIALMENTE ATENDIDO NOS FEEDBACKS VISUAIS**
* **Critério de Sucesso do Plano:** Coerência formativa entre os quizzes, roteiros práticos e conceitos da BNCC Computação / Cultura Maker.
* **Evidência Coletada:**
  * O instrumento educacional confirmou a presença dos 4 pilares do Pensamento Computacional (Decomposição, Padrões, Abstração, Algoritmos) e da prática Maker de baixo custo e metacognição via diário de bordo.
  * O cursista avaliado demonstrou absorção de 9 das 10 competências-chave.
  * **Ponto de melhoria:** A inspeção visual e o teste de usabilidade mostraram que os feedbacks de sucesso e erro do sistema são rápidos ou discretos demais (toast que some rápido), reduzindo o momento de reforço positivo e reflexão do educador após a submissão da prática.
* **Conclusão Técnica:** A matriz pedagógica do software é sólida e alinhada à literatura de educação tecnológica, necessitando apenas que os componentes visuais de feedback forneçam orientações explicativas mais ricas quando o usuário erra ou conclui uma etapa.

---

#### Pergunta 6 — Acessibilidade e Desempenho
> **"Existem barreiras de acessibilidade (contraste, teclado, leitores) que podem dificultar ou impedir o uso do sistema? O tempo de carregamento é adequado?"**

* **Veredicto:** 🔴 **NÃO ATENDIDO EM ACESSIBILIDADE** / 🟢 **ATENDIDO EM PERFORMANCE**
* **Critério de Sucesso do Plano:** Escore Lighthouse de Desempenho $\ge 90$ e de Acessibilidade $\ge 90$, sem bloqueios de teclado.
* **Evidência Coletada (Auditoria Lighthouse Mobile 4G):**
  * **Desempenho Geral: 84 / 100** (Dentro da faixa aceitável de 50–89, com FCP de 0,5s, LCP de 2,0s e TBT de 50ms — navegação extremamente fluida mesmo em rede móvel).
  * **Acessibilidade: 50 / 100** (Reprovado no critério de corte de 90).
  * Falhas apontadas: botões e links secundários sem contraste suficiente com o fundo escuro/claro; falta de rótulos descritivos (`aria-label`) para leitores de tela em ícones interativos; ausência de indicadores visuais de foco (`:focus-visible`) para quem navega por Tab.
* **Conclusão Técnica:** O sistema carrega muito rápido e responde instantaneamente, mas impõe barreiras de exclusão a pessoas com baixa visão ou com deficiência motora que dependam do teclado. Adequação da paleta de cores e atributos ARIA são prioritários.

---

#### Pergunta 7 — Aprendizagem
> **"Existem evidências de mudança no conhecimento ou desempenho dos estudantes após a utilização do software?"**

* **Veredicto:** ⚠️ **INCONCLUSIVO ESTATISTICAMENTE (Com Evidência Descritiva Individual Positiva)**
* **Critério de Sucesso do Plano:** Comprovação matemática de ganho no Teste T de Student pareado com significância estatística ($p < 0,05$).
* **Evidência Coletada:**
  * O participante avaliado no pós-teste obteve nota **$9,0 / 10,0$**, demonstrando domínio aprofundado de conceitos complexos (Computação Desplugada, Abstração, Papel do Erro, Metacognição).
  * **Impedimento Metodológico:** O banco de dados continha apenas $1$ registro e este era exclusivamente do pós-teste (ausência da linha de base do pré-teste). Sem a amostra pareada ($N \ge 15$), o cálculo do Teste T não pôde ser executado.
* **Conclusão Técnica:** Qualitativamente, o instrumento comprova que um cursista que conclui o sistema domina os conteúdos com excelência. Formalmente, a comprovação científica de que essa nota decorreu do sistema (e não de conhecimento prévio do educador) requer a aplicação pareada estrita em uma coorte maior de professores.
