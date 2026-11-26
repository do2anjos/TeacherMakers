# Protocolos e instrumentos de avaliação — TeacherMakers

Esta pasta reúne os protocolos, questionários e modelos de coleta usados na avaliação de qualidade do TeacherMakers.

## Contexto da sessão (25/11/2026)

1. `git pull` na branch `release/2.0-baseline-de-avaliacao`: fast-forward de `942e0c1` para `6689e4f`, com 33 arquivos alterados (banco diagnóstico oficial, migration 005, novos testes de integração, remoção de testes legados e ajustes de front-end).
2. Ao iniciar com `npm start`, o endpoint `GET /api/diagnostic` retornava **503 `DIAGNOSTIC_CONTENT_NOT_CONFIGURED`**. Causa: `DIAGNOSTIC_QUESTIONS_FILE` ausente no `Back/.env`. Após adicionar `DIAGNOSTIC_QUESTIONS_FILE=docs/diagnostic-questions.json` e reiniciar, o backend passou a logar `state: "loaded"`, `contentStatus: "approved"`, `questionCount: 10`, `version: "1.0"`.
3. Verificação da matriz consolidada: 14 PBs resolvidos, 3 parcialmente resolvidos (PB-04, PB-05, PB-07) e 1 pendente (PB-09). O PB-07 foi o selecionado para esta rodada.

## PB-07 — o que foi feito

### 1. Catálogo e critérios das conquistas

- **Problema encontrado:** o emblema `primeiro-circuito` casava apenas com a palavra `circuit` no título da prática. Nenhuma prática do conteúdo real (`db_dump.json`) contém "circuit", logo o emblema era **inalcançável**; apenas os fixtures de teste usavam "Circuito básico".
- **Correção:** catálogo centralizado em `Back/src/config/achievements.js`, com os quatro emblemas e seus critérios pedagógicos. O critério de `primeiro-circuito` passou a reconhecer também `eletronica` / `inseto vibratorio` (Prática 13: *Eletrônica – O Inseto Vibratório*).
- `Back/src/services/progressService.js` agora usa esse catálogo único para listar e concedir conquistas, eliminando a duplicação de definições.
- **Validação automática:** `Back/tests/integration/achievementsCatalog.test.js` verifica que toda conquista é alcançável com as práticas reais, além de códigos únicos e da regra dos quatro pilares do pensamento computacional.

### 2. Kit de reaplicação do UEQ-S (V2)

- **Baseline:** QP +1,19 (DP 0,99), QH +0,31 (DP 1,55, IC95 [−0,70; +1,32] — Neutra), QG +0,75, com N=9 (set/out de 2026).
- `Questionario_UEQ-S_V2.md` — os 8 pares bipolares, escala 1–7, transformação `nota − 4`, dimensões QP/QH/QG, critérios éticos e de encerramento.
- `Questionario_UEQ-S_V2_template.csv` — uma linha por participante (`P01`–`P08`), sem nomes ou dados identificáveis.
- `scripts/analysis/compare_ueqs_v2.py` — valida notas 1–7 e códigos únicos, calcula médias, desvios, IC95, benchmark e diferença em relação ao baseline, com teste de Welch quando `scipy` está disponível. O script não grava arquivos nem inventa observações.

## Como reproduzir

```powershell
# Testes do backend (inclui a validação do catálogo de conquistas)
cd Back
npm test -- --runInBand

# Análise do UEQ-S V2 (após preencher o template com respostas reais)
cd ..
python scripts/analysis/compare_ueqs_v2.py "analise/protocolos/Questionario_UEQ-S_V2_template.csv"
```

**Resultados desta rodada:** suíte Jest **60/60 testes aprovados** (antes: 55). Auto-verificação do script replicando o baseline: QP +1,19, QH +0,31, QG +0,75 e delta 0,00. O template vazio é recusado com erro.

## Situação do PB-07

A matriz (`analise/matrizes/Matriz_Consolidada_de_Problemas.md` e `.xlsx`) foi atualizada com a evidência, mas o status permanece **PARCIALMENTE RESOLVIDO**. Para chegar a **RESOLVIDO** falta coletar respostas V2 reais com **N ≥ 8** participantes e rodar o script de comparação, comparando a Qualidade Hedônica com o baseline (+0,31) e com a meta do plano de avaliação (QH > +0,80). O instrumento preparado não substitui a medição.

## Outros arquivos desta pasta

- `Protocolo_Pesquisa_Usabilidade_V2.md` e `Protocolo_Pesquisa_Usabilidade_V2_template.csv` — protocolo V2 (PB-09), preparado, sem sessões registradas.
- `Roteiro_Pre_teste_Diagnostico_V2_rascunho.md` — roteiro de rascunho do pré-teste diagnóstico (PB-08).
