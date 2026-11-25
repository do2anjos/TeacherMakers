# 📋 Governança e Proveniência das Matrizes de Avaliação

Este diretório (`analise/matrizes/`) é a **fonte canônica oficial e viva de trabalho** para todas as matrizes de avaliação de qualidade e acompanhamento de problemas do projeto **TeacherMakers**.

---

## 1. Princípio da Fonte Canônica vs. Snapshots Históricos

Para garantir a rastreabilidade da evolução do software sem perda de integridade histórica nem risco de divergência:

1. **Fonte Canônica de Trabalho (`analise/matrizes/`):**
   - É a **única pasta onde novas atualizações, reavaliações e correções de problemas devem ser gravadas**.
   - Os arquivos de trabalho ativos são:
     - `Matriz_Consolidada_de_Problemas.xlsx` (planilha viva com painel de acompanhamento, detalhamento de problemas consolidados, histórico v1.0 e legenda);
     - `Matriz_Consolidada_de_Problemas.md` (versão documental espelho da matriz consolidada);
     - `Matriz_de_Avaliacao.xlsx` (matriz de planejamento, critérios e instrumentos da avaliação).

2. **Snapshots Históricos Imutáveis (`Dossie_Avaliacao_Qualidade/` e `analise/entregaveis/`):**
   - As cópias armazenadas em pastas de dossiê representam **fotografias históricas imutáveis** (ex.: Baseline V1.0 / entregáveis formais emitidos em outubro de 2026).
   - **Não devem ser modificadas**, garantindo a integridade e auditabilidade dos relatórios formais gerados na época.

---

## 2. Inventário e Proveniência das Versões

| Arquivo | Localização | Natureza | Versão | Data de Referência | SHA-256 |
|---|---|---|:---:|:---:|---|
| `Matriz_Consolidada_de_Problemas.xlsx` | `analise/matrizes/` | **Canônica (Viva)** | 2.0 | 24/11/2026 | `DE0E9AD7744AD7CFB823DF3BF0CF6E296D753BCC922AA123553448A93D40FEB6` |
| `Matriz_Consolidada_de_Problemas.md` | `analise/matrizes/` | **Canônica (Viva)** | 2.0 | 24/11/2026 | *Texto Markdown espelho da planilha canônica* |
| `Matriz_Consolidada_de_Problemas.xlsx` | `Dossie_Avaliacao_Qualidade/04_EVIDENCIAS_E_PROBLEMAS/` | Snapshot Histórico | 1.0 | 20/10/2026 | `A282E52DD80CA6C02D723101CF15AA1BF174D62D1824DE5810AAFE8E1B8EB6A4` |
| `Matriz_de_Avaliacao.xlsx` | `analise/matrizes/` | **Canônica (Viva)** | 1.0 | 20/10/2026 | `6B3212A90CDC922BCBEA7DCF927765F5C21801CC553718A370630DF26061A717` |
| `Matriz_de_Avaliacao.xlsx` | `Dossie_Avaliacao_Qualidade/02_PLANEJAMENTO_E_CRITERIOS/` | Snapshot Histórico | 1.0 | 20/10/2026 | `6B3212A90CDC922BCBEA7DCF927765F5C21801CC553718A370630DF26061A717` |

---

## 3. Regra de Edição e Automação

- Qualquer script de geração ou análise (em `scripts/analysis/` ou `scripts/dossier/`) deve ler e gravar estritamente a partir de `analise/matrizes/`.
- Scripts de consolidação de dossiê (`scripts/dossier/`) devem operar em modo de cópia a partir desta pasta canônica, nunca sobrescrevendo a versão de trabalho sem confirmação explícita.
