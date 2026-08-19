# Manual de Execução - TeacherMakers (Release V1)

Este manual contém as instruções completas para instalação, configuração e execução da versão congelada V1 do projeto **TeacherMakers**.

## 1. Requisitos de Ambiente

Para executar o sistema localmente, certifique-se de ter os seguintes requisitos instalados:
- **Node.js** (versão 18.x ou superior recomendada)
- **NPM** (Node Package Manager - normalmente instalado junto com o Node.js)
- **Git** (para clonar o repositório ou fazer checkout da versão correta)

## 2. Instalação e Configuração

### Passo 2.1: Obter a versão V1 Congelada
Certifique-se de estar na versão correta do projeto (Baseline V1). No terminal, execute:
```bash
git checkout Release-1.0
```

### Passo 2.2: Instalação das Dependências
O projeto é dividido em `Front` e `Back`, mas possui um orquestrador na raiz.
Na pasta raiz do projeto (`TeacherMakers/`), execute:
```bash
npm install
```
*(Este comando instalará todas as bibliotecas necessárias para rodar tanto o servidor frontend estático quanto o backend Node.js).*

### Passo 2.3: Configuração do Banco de Dados e Variáveis de Ambiente
O backend utiliza um banco de dados local SQLite (`Back/database.sqlite`). 
A inicialização e a carga inicial de dados (seeder) são feitas automaticamente através do comando:
```bash
npm run seed
```
*(Este comando criará as tabelas necessárias e inserirá os módulos, aulas, quizzes e práticas padrão do sistema).*

**Nota sobre Variáveis de Ambiente:**
O sistema possui configurações prontas para desenvolvimento local. Certifique-se de que o arquivo `Back/.env` possua os seguintes valores básicos (caso precise recriar):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=teachermakers_secret_key_2024
FRONTEND_URL=http://localhost:3000
DATABASE_URL=database.sqlite
```

## 3. Execução do Sistema

Para iniciar o projeto completo (Frontend e Backend simultaneamente), execute na pasta raiz:
```bash
npm start
```
- O **Frontend** estará acessível em: `http://localhost:3000`
- A **API Backend** estará rodando em: `http://localhost:5000` (A documentação Swagger estará em `http://localhost:5000/api-docs`)

## 4. Acesso ao Sistema e Credenciais de Teste

Abra o seu navegador e acesse: [http://localhost:3000](http://localhost:3000)

**Para acessar como professor/aluno (Testes):**
Como o banco de dados é inicializado vazio de usuários por questões de segurança, para testar a plataforma você deve realizar um cadastro rápido:
1. Na tela de Login, clique em **"Cadastre-se"**.
2. Preencha os campos com dados de teste (Ex: `Nome: Teste`, `Email: teste@escola.com`, `Senha: 123456`).
3. Após o cadastro, você será redirecionado para a plataforma principal (Dashboard).

## 5. Funcionalidades Principais (Escopo da V1)

Esta versão V1 contempla as seguintes funcionalidades funcionais:
- **Autenticação:** Cadastro e Login de usuários utilizando JWT e senha criptografada (bcrypt).
- **Trilha de Aprendizagem:** Dashboard exibindo o progresso percentual.
- **Aulas e Conteúdo:** Visualização de vídeo-aulas, leitura de resumos textuais.
- **Avaliações (Quizzes):** Questionários interativos com feedback instantâneo ao fim das aulas teóricas.
- **Práticas Pedagógicas:** Roteiros passo a passo para o professor replicar em sala de aula.
- **Documentação da API:** Mapeamento completo dos endpoints via Swagger.

## 6. Solução de Problemas Comuns (Troubleshooting)

- **Erro "Port already in use" (Porta em uso):** Caso a porta 3000 ou 5000 já estejam sendo usadas, feche outros terminais rodando processos Node.js ou altere a variável `PORT` no arquivo `.env`.
- **Erro de Banco de Dados ou Login Falhando:** O arquivo `database.sqlite` pode estar corrompido ou vazio. Pare a execução (`Ctrl+C`) e rode o comando `npm run reset-db` para recriar o banco do zero.
