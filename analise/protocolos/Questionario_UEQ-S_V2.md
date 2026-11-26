# Questionário UEQ-S — reaplicação V2 (PB-07)

**Status:** instrumento preparado para aplicação; **nenhuma resposta V2 foi coletada**.
**Amostra-alvo:** N ≥ 8 professores (preferencialmente os mesmos códigos `P01`–`P08` do protocolo de usabilidade V2).
**Objetivo:** verificar se a Qualidade Hedônica (QH) deixou a faixa "Neutra" do baseline (+0,31; DP 1,55; N=9) e alcançou o critério do plano de avaliação (QH > +0,80).

## Ética e registro

- Aplicar somente após consentimento informado; registrar `consentimento_registrado` como `sim`.
- Usar códigos anônimos `P01` a `P08`. **Não** registrar nomes, e-mails, senhas, tokens, rostos ou dados de alunos/turmas.
- Registrar a versão/build do produto avaliado e a categoria do dispositivo (sem serial).
- A chave que associa código a participante permanece separada, com acesso restrito ao responsável pela pesquisa.
- Não inventar, completar ou substituir respostas ausentes. Linhas vazias ou inválidas são recusadas pelo script de análise.

## Instrumento

Aplicar o UEQ-S (versão reduzida, 8 pares de adjetivos opostos) em escala semântica bipolar de **7 pontos (1 a 7)**. A transformação para a escala centrada em zero é `valor_transformado = nota_bruta - 4`, resultando em −3 (extremamente negativo) a +3 (extremamente positivo).

| Item | Polo negativo | Polo positivo | Dimensão | Coluna no CSV |
| :---: | :--- | :--- | :--- | :--- |
| 1 | Obstrutivo | Apoiador | Pragmática | `item_1_obstrutivo_apoiador` |
| 2 | Complicado | Fácil | Pragmática | `item_2_complicado_facil` |
| 3 | Ineficiente | Eficiente | Pragmática | `item_3_ineficiente_eficiente` |
| 4 | Confuso | Claro | Pragmática | `item_4_confuso_claro` |
| 5 | Chato | Empolgante | Hedônica | `item_5_chato_empolgante` |
| 6 | Desinteressante | Interessante | Hedônica | `item_6_desinteressante_interessante` |
| 7 | Convencional | Inovador | Hedônica | `item_7_convencional_inovador` |
| 8 | Tradicional | Criativo | Hedônica | `item_8_tradicional_criativo` |

- **Qualidade Pragmática (QP):** média dos itens 1–4.
- **Qualidade Hedônica (QH):** média dos itens 5–8 — dimensão diretamente ligada ao PB-07.
- **Qualidade Geral (QG):** média dos 8 itens.
- Benchmark UEQ: `> +0,80` positiva; `−0,80` a `+0,80` neutra; `< −0,80` negativa.

## Aplicação

1. O participante completa o fluxo crítico da V2 (entrar, localizar o módulo disponível, aula, quiz e prática com foto).
2. Aplicar os 8 itens acima, sem sugerir respostas e sem comentar o baseline.
3. Preencher **uma linha por participante** em `Questionario_UEQ-S_V2_template.csv`, mantendo o cabeçalho.
4. Conferir que todas as notas estão entre 1 e 7 e que o código do participante é único.
5. Rodar a análise:

```powershell
python scripts/analysis/compare_ueqs_v2.py "analise/protocolos/Questionario_UEQ-S_V2_template.csv"
```

O script imprime médias, desvios, intervalos de confiança de 95% (mesmo critério do baseline: `média ± 1,96 × DP/√n`), classificação por benchmark e a diferença em relação ao baseline (QP +1,19; QH +0,31; QG +0,75). Quando `scipy` está disponível, também informa o p-valor do teste de Welch; a ausência de significância não invalida a descrição, mas deve ser registrada como limitação amostral.

## Critério de encerramento do PB-07

O PB-07 só passa a **RESOLVIDO** quando houver: (a) respostas V2 reais com N informado, (b) QH calculado e comparado ao baseline, e (c) o catálogo/critérios das conquistas validados contra o conteúdo real (ver `Back/tests/integration/achievementsCatalog.test.js`). Se a coleta não ocorrer, manter **PARCIALMENTE RESOLVIDO** e registrar a limitação — o instrumento preparado não comprova medição.
