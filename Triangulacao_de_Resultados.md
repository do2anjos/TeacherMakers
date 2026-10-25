# Triangulação de Resultados
## Dossiê de Avaliação da Qualidade do Software TeacherMakers

**Metodologia de Convergência:** Triangulação Metodológica Multimétodo (Denzin, 2012)  
**Fontes Cruzadas:**
1. **Comportamento Observado:** Teste de Usabilidade da Tarefa Crítica (Métricas objetivas de tempo, taxa de sucesso, cliques e erros observados);
2. **Causa na Interface:** Inspeção Visual e Percurso Cognitivo (Análise heurística conduzida por especialistas em IHC);
3. **Percepção Subjetiva:** Questionário de Experiência do Usuário — UEQ-S (Métricas padronizadas de Qualidade Pragmática e Qualidade Hedônica).

---

## 1. Fundamentação da Abordagem de Triangulação

A avaliação de qualidade de software não pode depender exclusivamente de relatos subjetivos (que podem sofrer viés de cortesia) nem de varreduras automatizadas isoladas (que não capturam o estresse cognitivo do usuário real). 

A triangulação adotada no TeacherMakers estrutura o raciocínio investigativo em quatro eixos:
$$\text{O que aconteceu? (Comportamento)} \iff \text{Por que aconteceu? (Interface)} \iff \text{Como foi sentido? (Percepção)} \Longrightarrow \text{Como consertar? (Engenharia)}$$

```
          [ Teste de Usabilidade ]
          (Comportamento Observado)
                     ▲
                    / \
                   /   \
                  /     \
                 /  Foco \
                /  Comum  \
               ▼           ▼
   [ Inspeção Visual ] ◄───► [ Avaliação UEQ-S ]
  (Causa na Interface)      (Percepção do Usuário)
```

---

## 2. Ponto Focal 1: Acesso Inicial e Localização do Módulo 1

### 2.1 O que aconteceu no Teste de Usabilidade? (Comportamento)
* **Observação:** Ambos os participantes (`lm` em desktop e `DK29` em tablet) registraram explicitamente no checklist de dificuldades: *"Dificuldade para localizar onde estava o Módulo 1"*.
* **Ação do usuário:** Embora ambos tenham concluído a tarefa sem pedir auxílio, o participante `DK29` realizou cliques exploratórios fora do caminho ótimo para identificar o início da jornada.

### 2.2 Por que aconteceu na Interface? (Inspeção Especializada)
* **Inspeção Cognitiva (Avaliador 1 e 2):** Na Pergunta 1 do Percurso Cognitivo (*"O usuário sabe o que fazer?"*), ambos os especialistas responderam: **PARCIALMENTE — Existem muitos estímulos visuais competindo pela atenção no Dashboard**.
* **Diagnóstico de UI:** Os cards de módulos possuem pesos visuais idênticos, de modo que o Módulo 1 (ponto de partida obrigatório) não se destaca visualmente dos módulos seguintes ou de widgets informativos secundários. A clareza das instruções recebeu nota $2,5 / 5,0$.

### 2.3 Como foi sentido na Percepção? (UEQ-S)
* **Impacto em UX:** Apesar da hesitação inicial, o item *Confuso vs. Claro* do UEQ-S manteve média positiva ($+1,11$), e a Qualidade Pragmática permaneceu alta ($+1,19$). 
* **Interpretação:** A dificuldade não foi suficiente para frustrar o usuário a ponto de gerar rejeição, mas gerou um momento de atrito cognitivo desnecessário no primeiro minuto de uso.

### 2.4 Síntese de Triangulação e Recomendação
| Dimensão | Achado Triangulado |
| :--- | :--- |
| **Comportamento** | Hesitação e cliques exploratórios para achar o início da trilha formativa. |
| **Causa de UI** | Concorrência de estímulos visuais no Dashboard; ausência de destaque hierárquico no card ativo/inicial. |
| **Percepção** | Tolerado pelo usuário, mas contribuiu para nota hedônica neutra e desejo de tutorial inicial. |
| **Como Consertar** | Aplicar **Guia Visual de Início Rápido**: esmaecer ou bloquear visualmente módulos futuros com ícone de cadeado e aplicar pulso/borda de destaque no módulo inicial ativo ("Comece por aqui"). |

---

## 3. Ponto Focal 2: Envio da Foto, Diário de Bordo e Confirmação de Sucesso

### 3.1 O que aconteceu no Teste de Usabilidade? (Comportamento)
* **Observação:** O participante `lm` submeteu a atividade com sucesso e sem erros, mas declarou: *"Não percebeu a mensagem de confirmação/sucesso final"*. Ele permaneceu aguardando na tela sem certeza de que o envio havia sido computado.
* O participante `DK29` relatou: *"Campo do diário de bordo pouco visível ou confuso de digitar"* e cometeu 2 erros operacionais durante a interação.

### 3.2 Por que aconteceu na Interface? (Inspeção Especializada)
* **Inspeção Cognitiva:** Na Pergunta 4 (*"O usuário recebe feedback adequado após agir?"*), o especialista `lm` pontuou: **PARCIALMENTE — Há feedback, mas é sutil demais ou desaparece rápido**.
* **Diagnóstico de UI:** O componente de notificação (provavelmente um toast temporário de 2 a 3 segundos) é renderizado no canto superior/inferior da tela sem retenção de foco, passando despercebido pelo educador que está focado no botão de envio.

### 3.3 Como foi sentido na Percepção? (UEQ-S)
* **Impacto em UX:** A incerteza quanto à persistência da submissão afeta diretamente a confiança do cursista. No UEQ-S, o item *Obstrutivo vs. Apoiador* teve média de $+0,89$, mas com um dos maiores desvios padrões da pesquisa ($\text{DP} = 1,54$). Participantes que sentiram insegurança atribuíram notas baixas nesse item.

### 3.4 Síntese de Triangulação e Recomendação
| Dimensão | Achado Triangulado |
| :--- | :--- |
| **Comportamento** | Usuário submete o trabalho físico/digital mas fica em dúvida se o sistema realmente gravou. |
| **Causa de UI** | Notificação toast de curta duração, fora do campo de visão direto, sem transição explícita de tela. |
| **Percepção** | Sensação de desamparo e necessidade de verificação duplicada. |
| **Como Consertar** | Substituir o toast fugaz por um **Modal de Sucesso Persistente**: exibir caixa de diálogo de confirmação com ícone verde de sucesso, botão explícito de "Continuar para o Próximo Módulo" e atualização imediata da barra de progresso para 100% no módulo. |

---

## 4. Ponto Focal 3: Responsividade e Ergonomia em Dispositivos Intermediários (Tablets)

### 4.1 O que aconteceu no Teste de Usabilidade? (Comportamento)
* **Disparidade de Tempos:** Enquanto o teste em desktop durou apenas **1 minuto**, o teste no tablet durou **30 minutos e 10 segundos** (tempo dilatado pela redação em tela de toque e dificuldades de visualização da área de texto).
* O participante `DK29` (tablet) cometeu **2 erros de toque** e apontou que o campo do diário de bordo era desconfortável.

### 4.2 Por que aconteceu na Interface? (Inspeção Especializada)
* **Inspeção Visual:** O especialista Matheus Dos Anjos identificou e registrou como problema formal: *"Em tablets as telas ficam bastante incoerentes"*.
* **Diagnóstico de UI:** Os breakpoints de CSS foram projetados para desktop padrão ($\ge 1200\text{px}$) e celulares ($\le 480\text{px}$), deixando a faixa de tablets ($768\text{px} - 1024\text{px}$) em um estado híbrido onde colunas se comprimem e áreas de input perdem padding e altura adequados.

### 4.3 Como foi sentido na Percepção? (UEQ-S)
* **Impacto em UX:** Participantes com experiências de tela truncadas atribuíram notas muito inferiores na dimensão hedônica (ex: Laissa Martins com $-2,75$ e Jean Miguel com $-1,75$). A Qualidade Hedônica global do sistema foi penalizada para $+0,31$ (neutra).

### 4.4 Síntese de Triangulação e Recomendação
| Dimensão | Achado Triangulado |
| :--- | :--- |
| **Comportamento** | Tempo de execução 30 vezes maior e 2 erros operacionais em tablet. |
| **Causa de UI** | Falha de viewport e quebra de grid responsivo na faixa de 768px a 1024px. |
| **Percepção** | Queda abrupta no prazer e na empolgação de uso (Qualidade Hedônica neutra/baixa). |
| **Como Consertar** | Refatorar os Media Queries em `front/src/styles`: definir layout específico para tablet com campos de texto expandidos (100% width), botões de toque com altura mínima de $48\text{px}$ e espaçamento entre cards otimizado para toque. |

---

## 5. Matriz de Síntese da Triangulação

| Eixo Investigado | Evidência Comportamental (Usabilidade) | Evidência Estrutural (Inspeção IHC) | Evidência Psicométrica (UEQ-S) | Conclusão Diagnóstica |
| :--- | :--- | :--- | :--- | :--- |
| **Início da Trilha** | Hesitação na busca do Módulo 1 | Competição de estímulos visuais no Dashboard | QP alta ($+1,19$), mas demanda por tutorial | O sistema é intuitivo, mas a tela inicial carece de guia visual unificado de início. |
| **Submissão da Prática** | Não percebeu mensagem de confirmação | Feedback do sistema é sutil e passageiro | Dispersão alta em "Obstrutivo vs Apoiador" ($\text{DP}=1,54$) | A validação funciona, mas o feedback não transmite segurança ao educador. |
| **Uso em Tablet** | 2 erros e lentidão na digitação do diário | Telas incoerentes em viewport de tablet | Hedônica rebaixada ($+0,31$) e notas negativas | O software necessita de homologação e refinamento de CSS responsivo para telas móveis/tablets. |
| **Integridade da Formação** | Usuário enviou foto e texto com seriedade | API bloqueou 100% das fraudes de envio | Usuários acham o sistema eficiente ($+1,00$) | O fluxo pedagógico "mão na massa" é viável e validado pela experiência real do usuário. |
