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
├── Back/                      # Servidor backend (API REST)
│   ├── src/
│   │   ├── config/            # Conexão com banco de dados, Swagger e Logger
│   │   ├── controllers/       # Controladores de rotas (Auth, Content, Progress)
│   │   ├── middlewares/       # Autenticação JWT, tratamento de erros, uploads
│   │   ├── models/            # Camada de persistência (User, Content, Progress)
│   │   ├── routes/            # Definição das rotas da API
│   │   ├── services/          # Regras de negócio da plataforma
│   │   └── utils/             # Scripts utilitários e Seeder do banco
│   └── package.json
├── Front/                     # Interface do usuário (Web Client)
│   ├── public/
│   │   ├── script/            # Scripts de autenticação, dashboard, aulas, práticas e tema
│   │   ├── style.css          # Estilização global e componentes
│   │   ├── Login.html         # Página de login
│   │   ├── Cadastro.html      # Página de registro
│   │   ├── home.html          # Dashboard da trilha de aprendizagem
│   │   ├── aula.html          # Sala de aula (vídeo, resumo, quiz)
│   │   ├── praticas.html      # Roteiros práticos e envio de evidências
│   │   └── certificado.html   # Emissão e validação de certificados
│   └── package.json
├── Docs/                      # Especificações e Engenharia de Software
│   ├── API_Documentation.md   # Especificação detalhada dos endpoints
│   ├── Elicitacao_Requisitos.md # Requisitos Funcionais (RF) e Não Funcionais (RNF)
│   ├── Diagrama_Atividades.puml   # Diagrama PlantUML de Atividades
│   ├── Diagrama_Casos_De_Uso.puml # Diagrama PlantUML de Casos de Uso
│   ├── Diagrama_Componentes.puml  # Diagrama PlantUML de Componentes
│   └── MER_TeacherMakers.puml     # Modelo Entidade-Relacionamento
├── package.json               # Orquestrador de scripts na raiz
└── render.yaml                # Configuração para deploy
```

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
