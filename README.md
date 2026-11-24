# 🚀 TeacherMakers

> **Plataforma de Formação em Cultura Maker, Pensamento Computacional e Robótica para Educadores.**

O **TeacherMakers** é um ambiente de aprendizagem projetado para capacitar professores e educadores através de trilhas formativas interativas, combinando fundamentação teórica (aulas em vídeo e resumos), quizzes de fixação, práticas pedagógicas "mão na massa" com submissão de evidências e emissão de certificados digitais.

---

## 📌 Release 1.0 - Baseline de Avaliação

Esta versão marca o **Ponto Zero (Baseline)** do projeto, consolidando a arquitetura inicial funcional para referência e comparação de métricas futuras de qualidade, usabilidade e desempenho.

- **Tag Git:** `Release-1.0`
- **Branch de Baseline:** `main`
- **Branch de Desenvolvimento:** `develop`

---

## 🛠️ Tecnologias Utilizadas

### **Front-end**
- **Linguagens:** HTML5 semântico, CSS3 moderno (design responsivo, suporte a tema claro/escuro) e JavaScript Vanilla.
- **Servidor Estático:** `live-server` / `serve` (Porta `3000`).

### **Back-end**
- **Runtime & Framework:** Node.js com Express 5.
- **Banco de Dados:** SQLite (com integridade referencial e Foreign Keys ativas).
- **Segurança & Autenticação:** JWT (JSON Web Tokens), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`.
- **Upload de Arquivos:** `multer` (para envio de evidências fotográficas das práticas).
- **Documentação de API:** Swagger UI (`/api-docs`) via `swagger-ui-express` e `swagger-jsdoc`.
- **Logs:** `winston`.

---

## 📂 Estrutura do Repositório

```text
TeacherMakers/
├── .github/
│   └── workflows/             # CI (testes backend)
├── analise/                   # Materiais de análise e qualidade (organizados por finalidade)
│   ├── dados/                 # Bases de respostas coletadas (.xlsx)
│   ├── instrumentos/          # Fichas e instrumentos de avaliação
│   ├── protocolos/            # Protocolos e roteiros de pesquisa/usabilidade
│   ├── matrizes/              # Matrizes de avaliação e problemas
│   ├── relatorios/            # Relatórios e triangulação de resultados
│   ├── evidencias/            # Cadernos/evidências consolidadas
│   └── entregaveis/           # Pacotes/artefatos de entrega (ex.: ZIP)
├── Back/                      # Backend (API REST Node.js/Express)
│   ├── docs/                  # Documentação específica do backend (contratos, drafts)
│   ├── src/
│   │   ├── config/            # Banco, logger, storage, swagger
│   │   ├── controllers/       # Controladores HTTP
│   │   ├── middlewares/       # Auth, tratamento de erros, etc.
│   │   ├── migrations/        # Migrations de schema/evolução
│   │   ├── models/            # Camada de persistência
│   │   ├── routes/            # Definição de rotas
│   │   ├── services/          # Regras de negócio
│   │   └── utils/             # Utilitários de runtime/manutenção (seed, uploads, helpers)
│   ├── tests/
│   │   ├── integration/       # Testes automatizados de integração (Jest/Supertest)
│   │   ├── manual/            # Scripts de teste/validação manual
│   │   └── legacy/            # Scripts de teste legados preservados
│   ├── jest.config.js
│   ├── nodemon.json
│   └── package.json
├── Docs/                      # Documentação geral do sistema e arquitetura
│   ├── Alterações/            # Histórico/visão geral de implementações
│   ├── API_Documentation.md
│   ├── Elicitacao_Requisitos.md
│   ├── Diagrama_Atividades.puml
│   ├── Diagrama_Casos_De_Uso.puml
│   ├── Diagrama_Componentes.puml
│   └── MER_TeacherMakers.puml
├── Dossie_Avaliacao_Qualidade/ # Dossiê formal, evidências e auditorias de qualidade
├── Front/                     # Frontend (Web Client)
│   ├── public/
│   │   ├── img/               # Recursos visuais
│   │   ├── script/            # Scripts da interface
│   │   ├── style.css
│   │   └── *.html             # Páginas da aplicação
│   └── package.json
├── scripts/                   # Scripts operacionais e de apoio
│   ├── analysis/              # Análises e processamento de dados/matrizes
│   ├── dossier/               # Geração/consolidação de dossiês e entregáveis
│   └── start-local.js         # Orquestrador de execução local (frontend + backend)
├── .gitignore
├── package.json               # Orquestrador de scripts na raiz
├── package-lock.json
└── render.yaml                # Configuração de deploy (Render)
```

**Governança de documentação (visão geral):**
- `Docs/`: documentação técnica/arquitetural e requisitos do sistema.
- `Back/docs/`: documentação específica do backend (ex.: contratos e conteúdos diagnósticos em draft).
- `analise/`: insumos, dados, instrumentos, protocolos, matrizes, relatórios e evidências de análise/qualidade.
- `Dossie_Avaliacao_Qualidade/`: dossiê formal e registros de auditoria/avaliação (preservado conforme política do repositório).

**Testes e scripts:**
- Testes automatizados backend: `Back/tests/integration/` (Jest/Supertest, configurado por `Back/jest.config.js`).
- Scripts manuais/legados de teste: `Back/tests/manual/` e `Back/tests/legacy/` (preservados para uso controlado).
- Scripts operacionais e de apoio: `scripts/` (`start-local.js`, `analysis/`, `dossier/`). Alguns scripts de análise/dossiê podem exigir ajuste de entradas/ambiente conforme os dados disponíveis em `analise/`.

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- `npm` instalado

### 2. Instalação das Dependências

Instale as dependências na raiz e nos submódulos:
```bash
# Na raiz do projeto:
npm install

# No backend:
cd Back && npm install && cd ..

# No frontend:
cd Front && npm install && cd ..
```

### 3. Inicialização e Seed do Banco de Dados
Para criar as tabelas e popular o banco SQLite com a trilha e conteúdos iniciais:
```bash
npm run seed
```

### 4. Variáveis de Ambiente (.env)
O sistema possui configurações prontas para desenvolvimento local. Certifique-se de que o arquivo `Back/.env` possua os seguintes valores básicos (caso precise recriar):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=teachermakers_secret_key_2024
FRONTEND_URL=http://localhost:3000
DATABASE_URL=database.sqlite
```

### 5. Executando a Aplicação

Para iniciar o Frontend e o Backend simultaneamente:
```bash
npm start
```

Ou execute separadamente:
- **Backend (API na porta 5000):**
  ```bash
  npm run back
  ```
- **Frontend (Web na porta 3000):**
  ```bash
  npm run front
  ```

---

## 🔑 Acesso ao Sistema e Credenciais de Teste

Abra o seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

**Para acessar como professor/aluno (Testes):**
Como o banco de dados é inicializado vazio de usuários por questões de segurança, para testar a plataforma você deve realizar um cadastro rápido:
1. Na tela de Login, clique em **"Cadastre-se"**.
2. Preencha os campos com dados de teste (Ex: `Nome: Teste`, `Email: teste@escola.com`, `Senha: 123456`).
3. Após o cadastro, você será redirecionado para a plataforma principal (Dashboard).

---

## 📖 Documentação da API

Com o backend em execução, acesse a documentação interativa do Swagger em:
👉 `http://localhost:5000/api-docs`

---

## 🛠️ Solução de Problemas Comuns (Troubleshooting)

- **Erro "Port already in use" (Porta em uso):** Caso a porta 3000 ou 5000 já estejam sendo usadas, feche outros terminais rodando processos Node.js ou altere a variável `PORT` no arquivo `.env`.
- **Erro de Banco de Dados ou Login Falhando:** O arquivo `database.sqlite` pode estar corrompido ou vazio. Pare a execução (`Ctrl+C`) e rode o comando `npm run reset-db` para recriar o banco do zero.

---

## 👥 Autores e Créditos

Desenvolvido no contexto de capacitação e formação em Pensamento Computacional e Cultura Maker.
- **Autor / Mantenedor:** Matheus ([@do2anjos](https://github.com/do2anjos)) - UEA (Universidade do Estado do Amazonas)
