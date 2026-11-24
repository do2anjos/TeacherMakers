# Contrato de conteúdo do pré-teste diagnóstico

O backend aceita um único banco de questões indicado por `DIAGNOSTIC_QUESTIONS_FILE`. Ele não procura arquivos automaticamente. Caminhos relativos são resolvidos a partir da raiz do backend (`Back/`), mesmo quando o comando de inicialização é executado na raiz do projeto.

## Formato

```json
{
  "metadata": {
    "status": "approved",
    "version": "1.0",
    "title": "Pré-teste diagnóstico TeacherMakers"
  },
  "questions": [
    {
      "id": "q1",
      "prompt": "Enunciado aprovado",
      "options": [
        { "id": "A", "label": "Alternativa A" },
        { "id": "B", "label": "Alternativa B" },
        { "id": "C", "label": "Alternativa C" },
        { "id": "D", "label": "Alternativa D" }
      ],
      "correctOptionId": "A"
    }
  ]
}
```

O arquivo deve ser JSON legível e conter metadata com `status` (`approved` ou `draft`) e `version`, além de exatamente dez questões. Cada questão precisa de ID e enunciado exclusivos, quatro opções identificadas exatamente por A, B, C e D, rótulos não vazios e uma chave que corresponda a uma dessas opções.

`GET /api/diagnostic` devolve apenas `id`, `prompt` e `options`; a chave nunca é enviada ao frontend. O backend associa a tentativa à versão do banco e rejeita a retomada ou submissão se a versão mudar no meio da tentativa.

## Conteúdo aprovado

O banco aprovado exige `metadata.status: "approved"`. O responsável pedagógico deve aprovar enunciados, opções, gabarito, versão e data antes de disponibilizar o arquivo no ambiente.

## Rascunho local

O arquivo `diagnostic-questions.draft.json` é a versão 0.1 não aprovada. Para carregá-lo, todas as condições abaixo são obrigatórias:

- `NODE_ENV=development`;
- `DIAGNOSTIC_ALLOW_DRAFT_CONTENT=true`;
- `DIAGNOSTIC_QUESTIONS_FILE` definido para esse arquivo;
- metadata indicando `status: "draft"`;
- validação integral do JSON.

Sem qualquer uma dessas condições, o backend recusa o carregamento. O rascunho é sempre recusado em produção, mesmo que as variáveis de autorização estejam definidas. Não adicione essas variáveis ao `render.yaml` ou às configurações do Render.

### PowerShell, sessão local temporária

Execute a partir da raiz do repositório:

```powershell
$env:NODE_ENV = "development"
$env:DIAGNOSTIC_ALLOW_DRAFT_CONTENT = "true"
$env:DIAGNOSTIC_QUESTIONS_FILE = (Resolve-Path 'Back\docs\diagnostic-questions.draft.json').Path
npm start
```

As variáveis existem apenas nessa sessão do PowerShell e são herdadas pelo backend iniciado por `scripts/start-local.js`. Para retornar ao modo sem rascunho, encerre `npm start` e remova-as antes de reiniciar:

```powershell
Remove-Item Env:DIAGNOSTIC_ALLOW_DRAFT_CONTENT -ErrorAction SilentlyContinue
Remove-Item Env:DIAGNOSTIC_QUESTIONS_FILE -ErrorAction SilentlyContinue
npm start
```

Respostas de teste são gravadas no SQLite apontado pela configuração local. Use uma conta e um banco de desenvolvimento controlados; não execute a sessão de teste sobre dados de usuários reais. Não configure o arquivo de rascunho no Render.

## Respostas de erro

Quando o banco está ausente ou inválido, a API responde HTTP 503 com mensagem de configuração compreensível e sem caminho local, stack trace ou detalhes internos. O log do servidor mantém o código técnico para diagnóstico.

## Persistência

As tentativas e respostas ficam em `diagnosticos` e `respostas_diagnostico`, relacionadas ao usuário autenticado. A coluna `versao_conteudo` registra a versão do banco usado na tentativa. As migrations `002` e `003` preservam e completam os registros legados; a migration `004_repair_diagnostic_attempt_constraints` permite pontuação nula durante uma tentativa em andamento e remove a conclusão automática, preservando tentativas e respostas existentes.


The diagnostic pre-test records a baseline independently. Its availability or completion does not gate onboarding or change lesson progress.

Migration 003 adds the missing status and start-time columns to legacy diagnostic tables, infers status from the completion timestamp, and preserves existing rows.
