# 📖 Documentação da API - TeacherMakers

Esta documentação descreve todos os endpoints disponíveis no Backend da plataforma TeacherMakers.

**Base URL:** `http://localhost:5000/api`

---

## Autenticação (`/auth`)

### 1. Registro de Usuário
Cria uma nova conta de professor.
- **Rota:** `POST /auth/register`
- **Body:**
```json
{
  "nome": "Seu Nome",
  "email": "email@teste.com",
  "senha": "sua_senha_segura",
  "nivel_ensino": "Fundamental I"
}
```

### 2. Login
Autentica o usuário e retorna o Token JWT.
- **Rota:** `POST /auth/login`
- **Body:** `{ "email": "...", "senha": "..." }`
- **Resposta de Sucesso:**
```json
{
  "sucesso": true,
  "dados": {
    "usuario": { "id": 1, "nome": "...", "email": "..." },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

### 3. Concluir Onboarding
Marca que o usuário já viu os slides de introdução.
- **Rota:** `PATCH /auth/onboarding`
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## Conteúdo (`/content`)
*Todas as rotas requerem o Header de Autenticação.*

### 4. Listar Módulos
Retorna todos os módulos com o percentual de progresso do usuário.
- **Rota:** `GET /content/modulos`

### 5. Listar Aulas de um Módulo
- **Rota:** `GET /content/modulos/:moduloId/aulas`

### 6. Detalhes de uma Aula + Quiz
Retorna vídeo, descrição e o quiz completo da aula.
- **Rota:** `GET /content/aulas/:id`

### 7. Listar Práticas de um Módulo
- **Rota:** `GET /content/modulos/:moduloId/praticas`

---

## Progresso e Atividades (`/progress`)
*Todas as rotas requerem o Header de Autenticação.*

### 8. Concluir Aula Teórica
Marca aula como assistida e recalcula o progresso do módulo.
- **Rota:** `POST /progress/aula/:aulaId/complete`

### 9. Submeter Resposta de Quiz
Valida se a opção está correta e salva a tentativa.
- **Rota:** `POST /progress/quiz/submit`
- **Body:** `{ "questaoId": 1, "opcaoId": 5 }`

### 10. Finalizar Prática
Salva a conclusão da prática, exigindo as evidências pedagógicas obrigatórias.
- **Rota:** `POST /progress/pratica/finish`
- **Format:** `multipart/form-data`
- **Campos (Form Data):**
  - `praticaId` (inteiro, obrigatório)
  - `diarioBordo` (texto, obrigatório)
  - `foto` (arquivo de imagem, obrigatório)

### 11. Emitir Certificado
Gera o certificado se todos os módulos estiverem 100%.
- **Rota:** `POST /progress/certificado/emitir`

---

##  Padronização de Respostas

A API segue o seguinte padrão de resposta:

**Sucesso (Status 200/201):**
```json
{
  "sucesso": true,
  "mensagem": "Mensagem opcional",
  "dados": { ... }
}
```

**Erro (Status 400/401/404/500):**
```json
{
  "sucesso": false,
  "erro": "Descrição do erro",
  "stack": "Enviado apenas em modo development"
}
```

## Rotas V2 adicionadas

### `POST /progress/pratica/finish`

Requer JWT e `multipart/form-data` com `praticaId`, `diarioBordo` (mínimo de 100 caracteres) e `foto`. Formatos aceitos: JPG, PNG e WEBP, com validação de extensão, MIME e assinatura do conteúdo. O limite padrão é 10 MiB (`UPLOAD_MAX_BYTES`). O backend retorna `protocolo`, `evidenciaId`, `dataEnvio`, `progressoModulo`, `proximoPasso` e `novasConquistas` somente após a gravação transacional.

### `GET /progress/conquistas`

Retorna as conquistas maker conhecidas do usuário autenticado com estado `desbloqueado` e `dataConquista`. A API não recebe concessões do navegador.

### `GET /diagnostic` e `POST /diagnostic/submit`

Requerem JWT. O banco é carregado somente de `DIAGNOSTIC_QUESTIONS_FILE`; caminhos relativos são resolvidos a partir da pasta `Back/`. O JSON precisa declarar `metadata.status`, `metadata.version` e dez questões exclusivas, cada uma com opções A, B, C e D. A rota GET envia `versaoConteudo`, enunciados e opções, nunca o gabarito. A rota POST aceita dez pares `{ "questionId": "q1", "optionId": "A" }`, corrige e persiste no backend. A versão fica registrada junto da tentativa, e uma mudança de versão durante a tentativa retorna 409.

Sem configuração, arquivo ausente ou JSON inválido, a API responde 503 com mensagem segura. Um banco aprovado (`metadata.status: "approved"`) pode ser carregado após validação. Um banco `draft` exige simultaneamente `NODE_ENV=development`, `DIAGNOSTIC_ALLOW_DRAFT_CONTENT=true` e o caminho explícito; o backend sempre bloqueia rascunhos em produção. O rascunho 0.1 atual é apenas para validação local e não deve ser configurado no Render. Veja `Back/docs/diagnostic-content-contract.md`.
### `PATCH /auth/onboarding`

O onboarding pode ser concluido sem tentativa diagnostica. O pre-teste registra uma linha de base e nao altera o progresso dos modulos nem condiciona o onboarding.

As rotas de conteúdo e conclusão também aplicam as travas de acesso do módulo no backend; acesso a módulo bloqueado retorna 403.
