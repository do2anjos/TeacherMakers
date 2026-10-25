# Caderno de Evidências de Qualidade de Software
## Dossiê Consolidado de Avaliação — Plataforma TeacherMakers

**Sistema Avaliado:** TeacherMakers — Plataforma Web de Formação Docente em Cultura Maker e Pensamento Computacional  
**Versão Homologada / Build:** v1.0 / Deploy em Produção (Ambiente Render)  
**Data da Emissão:** Outubro de 2026  
**Natureza do Documento:** Relatório Técnico-Científico e Caderno Oficial de Evidências de Qualidade  
**Documentos Vinculados:**
* [Relatório Mestre de Avaliação da Qualidade](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Relatorio_Mestre%20_Avaliacao_Qualidade.md)
* [Matriz de Avaliação](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Matriz_de_Avaliacao.xlsx)
* [Fichas de Avaliação](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Fichas_de_Avaliacao.docx)
* [Protocolo de Avaliações](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/protocolo%20de%20avaliações.docx)
* [Análises Realizadas](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Analises_Realizadas.md)
* [Respostas às Perguntas de Avaliação](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Respostas_as_Perguntas_de_Avaliacao.md)
* [Triangulação de Resultados](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Triangulacao_de_Resultados.md)
* [Matriz Consolidada de Problemas](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Matriz_Consolidada_de_Problemas.md) e [Planilha XLSX](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Matriz_Consolidada_de_Problemas.xlsx)

---

## 1. Sumário Executivo

O presente **Caderno de Evidências de Qualidade** consolida a totalidade dos dados empíricos, auditorias de código, inspeções de interface e testes com usuários realizados no software educacional **TeacherMakers**. O objetivo central deste dossiê é comprovar, mediante registros auditáveis e metodologia científica rastreável, em que medida a plataforma atende aos seus requisitos de qualidade funcional, usabilidade, acessibilidade, desempenho técnico e eficácia pedagógica.

### Resumo dos Principais Indicadores e Veredictos

| Dimensão de Qualidade | Instrumento / Método | Amostra Real | Indicador Central Obtido | Veredicto Técnico |
| :--- | :--- | :---: | :--- | :---: |
| **Qualidade Funcional** | Testes de Caixa Preta / API | 2 avaliadores | 100% de bloqueio em submissões anômalas (HTTP 400/403) | ⚠️ **Aprovado com Ressalva** (Transação no BD) |
| **Learnability** | Questionário de 1º Acesso | 3 professores | 100% de autonomia; 100% acerto da finalidade | 🟢 **Aprovado Plenamente** |
| **Usabilidade Crítica** | Tarefa de Envio de Prática | 2 professores | 100% de taxa de conclusão sem ajuda | 🟢 **Aprovado na Operação** |
| **Experiência (UX)** | Escala UEQ-S | 9 respondentes | QP = $+1,19$ (Excelente); QH = $+0,31$ (Neutra) | 🟢 **Aprovado na Pragmática** |
| **Inspeção Visual** | Percurso Cognitivo | 2 avaliadores | CTA evidente; falha de layout em tablets | 🟡 **Aprovado com Ressalvas** |
| **Desempenho Técnico** | Google Lighthouse (Mobile) | 1 auditoria | Performance = 84/100; LCP = 2,0s; FCP = 0,5s | 🟢 **Aprovado em Performance** |
| **Acessibilidade** | Inspeção WCAG / Lighthouse | 1 auditoria | Score de Acessibilidade = 50/100 | 🔴 **Reprovado (Prioridade P2)** |
| **Aprendizagem** | Pós-teste Teórico-Maker | 1 participante | Nota 9,0 / 10,0 (90% de aproveitamento) | ⚠️ **Evidência Qualitativa Positiva** |

**Decisão de Homologação (Release Candidate):**  
A plataforma TeacherMakers é classificada como **APROVADA SOB CONDICIONANTES TÉCNICAS**. A liberação para cursos abertos ao público depende da correção imediata de **dois itens de alta criticidade**:
1. Implementação de transações atômicas no backend (prevenindo registros parciais no banco de dados em caso de falha de upload);
2. Correção de contraste e marcações de acessibilidade para conformidade com a WCAG 2.1 AA.

---

## 2. Enquadramento Metodológico e Rastreabilidade

A estruturação das evidências deste dossiê atende à cadeia de custódia e rastreabilidade estrita definida no Plano Mestre:
$$\text{Requisito de Sistema} \longrightarrow \text{Risco Mapeado} \longrightarrow \text{Pergunta Avaliável} \longrightarrow \text{Instrumento Validado} \longrightarrow \text{Evidência Bruta} \longrightarrow \text{Análise} \longrightarrow \text{Decisão}$$

```
 [Requisitos do TeacherMakers]
 (Aulas + Quizzes + Envio de Foto/Relato Maker + Certificado)
               │
               ▼
 [Riscos de Qualidade Mapeados]
 (Fraude de envio, abandono por frustração, incompreensão da prática, falha pedagógica)
               │
               ▼
 [7 Perguntas Centrais de Avaliação] ──► [Matriz de Avaliação (XLSX)]
               │
               ▼
 [Protocolos de Avaliação (DOCX)] ─────► [Fichas de Coleta em Campo]
               │
               ▼
 [Coleta de Dados Reais] ──────────────► [7 Planilhas de Respostas (.xlsx)]
               │
               ▼
 [Caderno de Evidências (MD)] ─────────► [Triangulação & Matriz de Problemas]
```

---

## 3. Inventário Completo das Evidências Coletadas

Todas as planilhas de respostas brutas encontram-se armazenadas no diretório raiz do repositório, com carimbo de data/hora original registrado pelos respondentes e avaliadores:

| # | Arquivo de Dados Brutos | Linhas / Colunas | Sujeitos / Avaliadores | Período de Coleta |
| :-: | :--- | :---: | :---: | :---: |
| **E1** | `Checklist de Avaliação Técnica e Segurança da API... (respostas).xlsx` | 3 linhas / 11 colunas | `lm` (Ambiente Render) e `Diedson Kenned` (v1.0) | 20/10/2026 |
| **E2** | `Ficha de Inspeção Visual e Percurso Cognitivo... (respostas).xlsx` | 3 linhas / 14 colunas | `lm` e `Matheus Dos Anjos` | 20/10/2026 |
| **E3** | `Avaliação de Primeiro Acesso e Aprendizagem Inicial... (respostas).xlsx` | 4 linhas / 13 colunas | Participantes `AC23`, `p01` e `DK29` | 19 e 20/10/2026 |
| **E4** | `Ficha de Teste de Usabilidade — Tarefa Crítica... (respostas).xlsx` | 3 linhas / 11 colunas | Participantes `lm` (Desktop) e `DK29` (Tablet) | 20/10/2026 |
| **E5** | `Questionário de Experiência do Usuário (UEQ-S) (respostas).xlsx` | 10 linhas / 10 colunas | 9 educadores (Alessandra, Éric, Diedson, Fátima, Victor, Laissa, Kaik, Jean, P1) | Set e Out/2026 |
| **E6** | `Registro de Auditoria de Desempenho (Performance)... (respostas).xlsx` | 2 linhas / 13 colunas | Auditor Técnico `Diedson Kenned` | 20/10/2026 |
| **E7** | `Avaliação de Conhecimento em Cultura Maker... (respostas).xlsx` | 2 linhas / 14 colunas | Participante `lm` (Pós-teste formativo) | 20/10/2026 |

---

## 4. Caderno de Evidências por Dimensão de Avaliação

---

### 4.1 Evidência 1: Avaliação Técnica e Blindagem da API

* **Objetivo:** Comprovar se o backend impede o avanço indevido e a emissão de certificados sem a submissão de evidências reais.
* **Instrumento:** Roteiro de testes de injeção direta via cliente HTTP (Postman/cURL) simulando bypass da interface.

#### Registro Tabular das Evidências Técnicas

| Cenário de Teste Executado | Entrada Injetada na API | Resposta HTTP Obtida | Comportamento do Servidor | Status |
| :--- | :--- | :---: | :--- | :---: |
| **Cenário 1:** Submissão sem imagem | `POST /pratica/finish` com payload contendo apenas texto | **HTTP 400 Bad Request** | Rejeitou a operação exigindo multipart de imagem | **PASSOU** |
| **Cenário 2:** Diário de bordo em branco | `POST /pratica/finish` com foto válida e texto vazio | **HTTP 400 Bad Request** | Rejeitou informando obrigatoriedade do relato | **PASSOU** |
| **Cenário 3:** Upload de arquivo não suportado | Upload de script executável (`.exe` / `.sh`) | **HTTP 400 / 415** | Validou MIME type e barrou extensão maliciosa | **PASSOU** |
| **Cenário 4:** Requisição desautenticada | Injeção sem header `Authorization` ou token falso | **HTTP 401 / 403** | Bloqueou na camada de middleware JWT | **PASSOU** |
| **Cenário 5:** Pular pré-requisitos | Tentativa de concluir módulo 3 com módulos 1 e 2 pendentes | **HTTP 400 / 403** | Validou dependências pedagógicas e barrou | **PASSOU** |

#### Registro de Falha de Persistência no Banco (Evidência Diedson Kenned — v1.0)
* **Apontamento Técnico:** Após o envio de uma requisição com erro proposital de validação no upload da imagem, a tabela de diário de bordo registrou um registro órfão com o texto submetido, antes que o erro do arquivo abortasse o processo.
* **Evidência Registrada:** *"Não, o banco gravou registros parciais após requisições com falha."*
* **Parecer Técnico da v1.0:** `REPROVADO — Existem vulnerabilidades funcionais que necessitam de correção transacional.`

---

### 4.2 Evidência 2: Inspeção Visual e Percurso Cognitivo

* **Objetivo:** Avaliar a interface do Dashboard sob a ótica da clareza das metas e feedback ao professor.
* **Especialistas Responsáveis:** `lm` e `Matheus Dos Anjos`.

#### Registro das Respostas ao Percurso Cognitivo

```
Jornada Analisada: Dashboard Principal e Trilha de Módulos
┌─────────────────────────────────────────────────────────────┬───────────────────────────┐
│ Pergunta Cognitiva                                          │ Avaliação dos Peritos     │
├─────────────────────────────────────────────────────────────┼───────────────────────────┤
│ 1. O usuário sabe o que fazer na tela?                      │ PARCIALMENTE (Concorrência visual de estímulos) │
│ 2. O usuário consegue ver como fazer?                       │ SIM (Botão de ação com excelente destaque)     │
│ 3. O usuário entende que a ação leva ao objetivo final?     │ PARCIALMENTE a SIM (Termos técnicos pontuais)   │
│ 4. O usuário recebe feedback adequado após agir?            │ PARCIALMENTE a SIM (Feedback sutil no toast)   │
└─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

#### Notas das Propriedades da Interface (Escala 1 a 5)
* **Hierarquia Visual:** Média $3,5$ (Regular para Bom);
* **Legibilidade e Contraste:** Média $4,0$ (Bom);
* **Consistência de Estilo:** Média $3,5$ (Regular para Bom);
* **Clareza das Mensagens e Instruções:** Média $2,5$ (Deficiente / Alerta).
* **Evidência Específica de Falha:** Matheus Dos Anjos registrou: *"Em tablets as telas ficam bastante incoerentes."*

---

### 4.3 Evidência 3: Facilidade de Aprendizagem (Learnability)

* **Objetivo:** Verificar se educadores novatos compreendem a proposta formativa sem intervenção externa.
* **Participantes:** Educadores `AC23` (1º contato estrito), `p01` e `DK29`.

#### Resumo das Evidências de Learnability

| Indicador | Evidência Bruta Registrada | Taxa de Sucesso |
| :--- | :--- | :---: |
| **Compreensão da Finalidade** | 3 de 3 selecionaram: *"Oferecer formação continuada para professores em Cultura Maker e Pensamento Computacional por meio de trilhas e práticas mão na massa."* | **100%** |
| **Identificação de Recursos** | 3 de 3 identificaram: *"Aulas teóricas e práticas, Quizzes e avaliações de fixação."* | **100%** |
| **Autonomia no 1º Acesso** | 3 de 3 declararam: *"Não, consegui navegar e descobrir os próximos passos sozinho(a)."* | **100%** |
| **Tempo de Apreensão** | `AC23`: $< 1\text{ min}$; `p01`: $1\text{ a }3\text{ min}$; `DK29`: $1\text{ a }3\text{ min}$ | **100% rápida** |
| **Pontuação Média de Facilidade** | Menus claros ($4,33/5$), Local de início evidente ($4,67/5$) | **Elevada** |

---

### 4.4 Evidência 4: Teste de Usabilidade da Tarefa Crítica

* **Objetivo:** Medir a eficácia, eficiência e satisfação no envio simultâneo de fotografia e diário de bordo.
* **Cenário:** O cursista acessa o Módulo 1, lê o roteiro prático, redige o texto comprobatório, seleciona o arquivo de imagem e conclui a submissão.

#### Registro Comparativo das Sessões

| Métrica Coletada | Sessão 1 (`lm` — Desktop) | Sessão 2 (`DK29` — Tablet) | Consolidado |
| :--- | :---: | :---: | :---: |
| **Dispositivo Empregado** | Notebook Windows / Mouse | Tablet Android / Touch | Multidispositivo |
| **Taxa de Sucesso** | Concluiu 100% sem ajuda | Concluiu 100% sem ajuda | **100% de Sucesso** |
| **Tempo Total da Tarefa** | $01:00\text{ min}$ | $30:10\text{ min}$ | Média: $15\text{ min }35\text{ s}$ |
| **Erros Operacionais** | 0 erros | 2 erros de toque | Média: $1,0$ erro |
| **Desvios de Navegação** | 0 desvios (caminho ótimo) | 1 a 2 cliques fora | Pequena exploração |
| **Facilidade Percebida (1-5)**| Nota 5,0 (Muito Fácil) | Nota 5,0 (Muito Fácil) | **Média 5,0 / 5,0** |
| **Dificuldades Registradas** | Dificuldade em achar Módulo 1; não notou confirmação final | Dificuldade em achar Módulo 1; campo de diário confuso no tablet | 3 gargalos de UI |
| **Incidente de Estado** | N/A | *"Módulo introdutório já constava como concluído no 1º login"* | Bug de inicialização |

---

### 4.5 Evidência 5: Experiência do Usuário (UEQ-S)

* **Amostra:** $N = 9$ educadores.
* **Escala:** 8 itens semânticos bipolares, transformados de 1–7 para o intervalo centrado de $-3$ a $+3$.

#### Matriz de Dados Brutos e Transformados do UEQ-S

```
Participantes e Valores Centrados (-3 a +3):
[P1] Anônimo:           [+1,  0, +1, +1, +1, +2,  0, +1] -> QP: +0,75 | QH: +1,00 | Geral: +0,88
[P2] Alessandra Corrêa: [+2, +3, +2, +1, +1, +3, +2, -3] -> QP: +2,00 | QH: +0,75 | Geral: +1,38
[P3] Éric Viana:        [+2, +2, +3, +1,  0, +1, -1, +1] -> QP: +2,00 | QH: +0,25 | Geral: +1,12
[P4] Diedson Kenned:    [+2, +1, +2, +2, +1, +1, +1, +2] -> QP: +1,75 | QH: +1,25 | Geral: +1,50
[P5] Fátima:            [+2, +3, +1, +3, +2, +1, +1, +1] -> QP: +2,25 | QH: +1,25 | Geral: +1,75
[P6] Victor Cesar:      [+2, +2, +2, +2, +2, +3, +2, +1] -> QP: +2,00 | QH: +2,00 | Geral: +2,00
[P7] Laissa Martins:    [-2, +2, -2, +2, -3, -3, -3, -2] -> QP:  0,00 | QH: -2,75 | Geral: -1,38
[P8] Kaik Dos Santos:   [-1, +1, +1, -1, -1,  0, +2, +2] -> QP:  0,00 | QH: +0,75 | Geral: +0,38
[P9] Jean Miguel:       [ 0, +2, -1, -1, -3, -2, -1, -1] -> QP:  0,00 | QH: -1,75 | Geral: -0,88
```

#### Indicadores Consolidados do UEQ-S
* **Qualidade Pragmática (QP):** Média **$+1,19$** ($\text{DP} = 0,99$) $\Longrightarrow$ **Positiva / Excelente** ($> 0,80$ no benchmark).
* **Qualidade Hedônica (QH):** Média **$+0,31$** ($\text{DP} = 1,55$) $\Longrightarrow$ **Neutra** (Faixa entre $-0,80$ e $+0,80$).
* **Qualidade Geral (QG):** Média **$+0,75$** ($\text{DP} = 1,17$) $\Longrightarrow$ **Neutra / Limítrofe com Positiva**.

---

### 4.6 Evidência 6: Desempenho e Acessibilidade (Lighthouse)

* **Auditor Responsável:** Diedson Kenned.
* **URL / Tela Inspecionada:** Tela de Conteúdo da Aula (Vídeo/Texto).
* **Perfil:** Emulação Mobile (Celular 4G simulado via Google Chrome DevTools).

#### Métricas Auditadas

| Métrica Técnica Auditada | Valor Obtido | Limiar de Referência Google | Parecer Técnico |
| :--- | :---: | :---: | :---: |
| **Pontuação Geral de Performance** | **84 / 100** | $\ge 90$ (Ideal) / $50-89$ (Alerta) | **Adequado / Fluido** |
| **First Contentful Paint (FCP)** | **0,5 s** | $\le 1,8\text{ s}$ | **Excelente** |
| **Largest Contentful Paint (LCP)** | **2,0 s** | $\le 2,5\text{ s}$ | **Bom** |
| **Total Blocking Time (TBT)** | **50 ms** | $\le 200\text{ ms}$ | **Excelente** |
| **Cumulative Layout Shift (CLS)** | **0,04** | $\le 0,10$ | **Excelente** |
| **Pontuação de Acessibilidade** | **50 / 100** | $\ge 90$ (Conformidade WCAG) | 🔴 **Crítico (Reprovado)** |

---

### 4.7 Evidência 7: Avaliação Educacional (Pós-teste de Conhecimento)

* **Participante:** `lm` (Educador cursista).
* **Momento:** Pós-teste (após percorrer as aulas e atividades práticas do TeacherMakers).
* **Nota Obtida:** **$9,0 / 10,0$** ($90\%$ de acerto global).

#### Análise Conceitual das Questões Respondidas
1. **Conceito de Cultura Maker (Q1):** O participante selecionou incorretamente a opção de apostila tradicional (**Erro conceitual**);
2. **Pedagogia do Erro (Q2):** Compreendeu o erro como iteração e reflexão (**Acerto**);
3. **Decomposição (Q3):** Identificou a quebra do problema em subpartes (**Acerto**);
4. **Reconhecimento de Padrões (Q4):** Reconheceu a aplicação de analogias funcionais (**Acerto**);
5. **Abstração (Q5):** Filtrou detalhes irrelevantes para a solução imediata (**Acerto**);
6. **Algoritmos (Q6):** Definiu como passos ordenados e finitos (**Acerto**);
7. **Computação Desplugada (Q7):** Afirmou a viabilidade sem telas ou internet (**Acerto**);
8. **Diário de Bordo (Q8):** Reconheceu o papel na metacognição docente (**Acerto**);
9. **Materiais na Escola Pública (Q9):** Validou o uso de sucata e baixo custo (**Acerto**);
10. **Papel do Educador (Q10):** Enquadrou o docente como mediador e facilitador (**Acerto**).

---

## 5. Respostas às 7 Perguntas Centrais de Avaliação

As respostas detalhadas e fundamentadas encontram-se no documento [Respostas_as_Perguntas_de_Avaliacao.md](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Respostas_as_Perguntas_de_Avaliacao.md). A tabela abaixo consolida a decisão técnica oficial:

| # | Pergunta Central de Qualidade | Veredicto Oficial | Fundamentação Sumária |
| :-: | :--- | :---: | :--- |
| **P1** | As travas pedagógicas impedem avanço indevido sem evidências? | ⚠️ **Parcialmente Atendido** | A API barra 100% das fraudes com HTTP 400/403, mas o banco gravou dados parciais em falha na v1.0. |
| **P2** | A interface apresenta falhas visuais que confundem os educadores? | 🟡 **Atendido com Ressalvas** | Botão de ação evidente, mas há concorrência visual no dashboard e layout quebrado em tablets. |
| **P3** | Usuários de 1º acesso entendem como iniciar e submeter práticas? | 🟢 **Totalmente Atendido** | 100% de autonomia e taxa de acerto de 100% na missão do software no primeiro contato. |
| **P4** | Qual a experiência percebida pelos educadores (UEQ-S)? | 🟢 **Aprovado na Pragmática** | Qualidade Pragmática excelente ($+1,19$); Qualidade Hedônica neutra ($+0,31$, falta de dinamismo maker). |
| **P5** | Conteúdo e feedbacks estimulam a reflexão pedagógica? | 🟢 **Aprovado no Conteúdo** | Alinhamento total aos pilares da BNCC Computação; necessidade de feedbacks de envio mais evidentes. |
| **P6** | Há barreiras de acessibilidade ou lentidão no sistema? | 🔴 **Reprovado em Acessibilidade** | Carregamento ultrarrápido ($84/100$, FCP $0,5\text{s}$), porém escore crítico de acessibilidade ($50/100$). |
| **P7** | Há evidências de mudança no conhecimento dos professores? | ⚠️ **Inconclusivo Formalmente** | O cursista atingiu nota 9,0/10, mas a ausência de pré-teste pareado inviabilizou o Teste T de Student. |

---

## 6. Triangulação Metodológica dos Resultados

A triangulação analítica detalhada em [Triangulacao_de_Resultados.md](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Triangulacao_de_Resultados.md) cruzou as três fontes empíricas (Usabilidade $\times$ Inspeção IHC $\times$ Escala UEQ-S), revelando três convergências fundamentais:

1. **Convergência da Localização do Início da Trilha:**  
   No teste prático, os professores hesitaram para achar o Módulo 1. A inspeção confirmou que os cards possuem pesos visuais idênticos no dashboard. No UEQ-S, isso gerou dispersão e solicitação de tutorial.  
   *Solução:* Destacar com badge "Comece por Aqui" e esmaecer os módulos bloqueados.
2. **Convergência da Confirmação do Envio Prático:**  
   O cursista submeteu a atividade com sucesso mas não percebeu a confirmação. A inspeção apontou que o toast desaparece muito rápido. No UEQ-S, o item *Obstrutivo vs. Apoiador* sofreu alta dispersão ($\text{DP}=1,54$).  
   *Solução:* Substituir a notificação passageira por um Modal Centralizado de Sucesso.
3. **Convergência da Experiência em Tablets:**  
   A sessão em tablet durou 30 minutos (contra 1 minuto no desktop) e gerou 2 erros. A inspeção registrou que o layout fica incoerente em tablets. No UEQ-S, a dimensão hedônica caiu para $+0,31$.  
   *Solução:* Media queries dedicadas para viewports entre $768\text{px}$ e $1024\text{px}$.

---

## 7. Matriz Consolidada de Problemas e Recomendações

A íntegra da matriz encontra-se em [Matriz_Consolidada_de_Problemas.md](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Matriz_Consolidada_de_Problemas.md) e na planilha [Matriz_Consolidada_de_Problemas.xlsx](file:///c:/Users/Do2anjos/Desktop/T.I/TeacherMakers/Matriz_Consolidada_de_Problemas.xlsx). Abaixo, apresenta-se o plano de ação priorizado:

| ID | Problema Identificado | Dimensão | Severidade | Ação de Correção Recomendada | Prioridade |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **PB-01** | Escrita parcial no banco após requisições com falha | API / Back-end | 🔴 **Crítica** | Implementar transações atômicas com `ROLLBACK` total em falhas de validação multipart. | **P1 (Imediata)** |
| **PB-02** | Escore crítico de acessibilidade (Score 50/100) | Acessibilidade | 🟡 **Alta** | Calibrar contraste para 4.5:1, adicionar atributos `aria-label` e anéis de foco `:focus-visible`. | **P2 (Curto Prazo)** |
| **PB-03** | Quebra de layout e ergonomia deficiente em tablets | Interface / Front | 🟡 **Alta** | Criar media queries para $768\text{px}-1024\text{px}$, inputs com 100% width e botões $\ge 48\text{px}$. | **P2 (Curto Prazo)** |
| **PB-04** | Competição visual e busca confusa pelo Módulo 1 | Usabilidade / UI | 🟢 **Média** | Destacar Módulo 1 com badge "Comece por Aqui"; esmaecer módulos bloqueados. | **P3 (Médio Prazo)** |
| **PB-05** | Feedback de confirmação da prática sutil e passageiro | Usabilidade / UI | 🟢 **Média** | Substituir toast por Modal de Confirmação com botão explícito de avanço. | **P3 (Médio Prazo)** |
| **PB-06** | Módulo introdutório marcado como concluído no 1º login | Banco / Negócio | 🟢 **Média** | Corrigir script de seed/criação de conta para inicializar módulos com status coerente. | **P3 (Médio Prazo)** |
| **PB-07** | Percepção estética convencional / tradicional (QH $+0,31$) | UX / Identidade | ⚪ **Baixa** | Incorporar microinterações, identidade visual maker e gamificação (conquistas). | **P4 (Evolutivo)** |
| **PB-08** | Ausência de pareamento no pré-teste de aprendizagem | Metodologia | ⚪ **Baixa** | Tornar obrigatório o preenchimento do formulário diagnóstico antes da liberação do Módulo 1. | **P4 (Metodológico)**|

---

## 8. Parecer Conclusivo de Qualidade de Software

### Veredicto Final de Homologação:
**APROVADO SOB CONDICIONANTES TÉCNICAS (RELEASE CANDIDATE 1.1)**

O software **TeacherMakers** demonstrou alta maturidade pedagógica, excelente tempo de resposta e grande facilidade de uso para educadores em seu primeiro contato. A lógica de exigir evidências reais (fotos e diários de bordo) para certificação foi validada empiricamente na prática e na API.

Para a liberação definitiva em larga escala (versão 1.1 em produção), condiciona-se:
1. **Aplicação do patch de banco de dados (PB-01):** Garantir atomicidade nas rotas de envio prático;
2. **Aplicação do patch de acessibilidade e responsividade (PB-02 e PB-03):** Adequação para visualização em tablets e contraste para conformidade legal com a WCAG 2.1 AA.

---

## 9. Referências Bibliográficas

1. **ALMEIDA, K. K. S. et al.** Currículo e Cidadania: Preparando Estudantes para o Século XXI. *Missioneira*, v. 27, n. 8, p. 309–320, 2025.
2. **BRASIL. Ministério da Educação.** *Base Nacional Comum Curricular (BNCC): Componente de Computação*. Brasília: MEC, 2018.
3. **DENZIN, N. K.** The sociological methods: A sourcebook. 5. ed. New York: Aldine Transaction, 2012.
4. **LAUGWITZ, B.; HELD, T.; SCHREPP, M.** Construction and evaluation of a user experience questionnaire. In: *Symposium of the Austrian HCI and Usability Engineering Group*. Berlin: Springer, 2008. p. 63–76.
5. **NIELSEN, J.** *Usability Engineering*. Boston: Academic Press, 1993.
6. **PAPERT, S.** *Mindstorms: Children, computers, and powerful ideas*. New York: Basic Books, 2020.
7. **RESNICK, M.** *Lifelong Kindergarten: Cultivating creativity through projects, passion, peers, and play*. Cambridge: MIT Press, 2017.
8. **SHUTE, V. J.; SUN, C.; ASBELL-CLARKE, J.** Demystifying computational thinking. *Educational Research Review*, v. 22, p. 142–158, 2017.
9. **WING, J. M.** Computational thinking. *Communications of the ACM*, v. 49, n. 3, p. 33–35, 2006.
10. **W3C.** *Web Content Accessibility Guidelines (WCAG) 2.1*. World Wide Web Consortium, 2018. Disponível em: <https://www.w3.org/TR/WCAG21/>.
