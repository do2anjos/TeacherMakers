# Documento de Elicitação e Especificação de Requisitos do Sistema
**Projeto:** TeacherMakers – Plataforma de Formação em Cultura Maker, Pensamento Computacional e Robótica
**Data:** Maio de 2026

---

## Etapa 1 – Identificação das Funcionalidades do Sistema

As principais funcionalidades identificadas para atender o escopo da plataforma TeacherMakers são:
1. **Cadastro e Autenticação**: Permitir que educadores criem contas, façam login e gerenciem seus perfis.
2. **Onboarding (Integração)**: Apresentar a plataforma de forma guiada para o usuário no seu primeiro acesso.
3. **Trilha de Aprendizagem (Dashboard)**: Exibir os módulos do curso, rastreando o percentual de progresso de cada um.
4. **Aulas Teóricas**: Disponibilizar o consumo de vídeos e a leitura de resumos textuais das aulas.
5. **Avaliação por Quizzes**: Aplicar questionários interativos de múltipla escolha para validar a absorção do conhecimento teórico.
6. **Práticas Pedagógicas**: Fornecer roteiros passo a passo para atividades "mão na massa".
7. **Integração com Repositórios**: Disponibilizar acesso facilitado aos arquivos e materiais de apoio hospedados no Google Drive (separados por pilares como Decomposição, Abstração, Imaginar, etc.).
8. **Submissão de Evidências**: Permitir o upload obrigatório de Fotos da Atividade e textos reflexivos (Diário de Bordo) para a conclusão das práticas.
9. **Emissão de Certificado**: Gerar um certificado validável ao fim de toda a trilha pedagógica.

---

## Etapa 2 – Identificação dos Atores do Sistema

Os atores (entidades que interagem com o sistema) identificados são:

* **Professor / Cursista**: Ator principal. É o educador que utiliza o sistema para consumir o conteúdo, realizar as práticas, responder aos quizzes, fazer envio de arquivos e gerar o seu certificado.
* **Estudantes**: Ator secundário (Mundo Real). São os alunos do professor que recebem a aplicação prática do conhecimento. Eles ajudam o professor na validação da aplicação das dinâmicas sugeridas pela plataforma.
* **Administrador (Backend/Suporte)**: Ator secundário responsável pelo gerenciamento de conteúdo da plataforma (inserção de aulas, configuração de módulos e extração de dados do banco), atualmente gerido via scripts de seed.

---

## Etapa 3 – Elicitação de Requisitos Funcionais (RF)

Os Requisitos Funcionais descrevem *o que* o sistema deve fazer.

| ID | Descrição do Requisito | Prioridade |
|---|---|---|
| **RF01** | O sistema deve permitir o cadastro de novos usuários contendo obrigatoriamente Nome, E-mail, Nível de Ensino e Senha. | Alta |
| **RF02** | O sistema deve autenticar o usuário através da combinação de e-mail e senha. | Alta |
| **RF03** | O sistema deve exibir uma trilha de Onboarding introdutória para usuários recém-cadastrados no seu primeiro acesso. | Média |
| **RF04** | O sistema deve apresentar um painel principal (Dashboard) listando os módulos e o progresso percentual do usuário em cada um. | Alta |
| **RF05** | O sistema deve permitir o bloqueio estruturado de módulos e aulas, apenas liberando a etapa seguinte após a conclusão integral da atual. | Alta |
| **RF06** | O sistema deve fornecer uma sala de aula virtual com player de vídeo integrado e painel de resumo. | Alta |
| **RF07** | O sistema deve permitir que o usuário marque a etapa do vídeo e a etapa do resumo como "concluídas". | Alta |
| **RF08** | O sistema deve exibir um quiz interativo de fixação ao final das etapas teóricas de uma aula. | Alta |
| **RF09** | O sistema deve avaliar a resposta do usuário no quiz, exibindo feedback imediato (erro/acerto) e só permitindo o avanço mediante resposta correta. | Alta |
| **RF10** | O sistema deve exibir etapas passo a passo textuais nas Práticas Pedagógicas. | Alta |
| **RF11** | O sistema deve exibir de forma dinâmica um slide com links de acesso aos projetos do Google Drive referentes ao exato pilar em estudo (ex: Decomposição, Imaginar). | Média |
| **RF12** | O sistema deve exigir obrigatoriamente que o usuário preencha um "Diário de Bordo" (texto) para concluir uma prática. | Alta |
| **RF13** | O sistema deve exigir obrigatoriamente que o usuário realize o upload de uma "Foto da Atividade" (imagem) para concluir uma prática. | Alta |
| **RF14** | O sistema deve registrar de forma persistente todos os progressos do usuário (status, data de início e conclusão das aulas e práticas). | Alta |
| **RF15** | O sistema deve gerar um certificado digital de conclusão, contendo o nome do professor, a carga horária e um código único de verificação, após a conclusão total do curso. | Alta |

---

## Etapa 4 – Identificação de Requisitos Não Funcionais (RNF)

Os Requisitos Não Funcionais descrevem *como* o sistema deve operar, focando em qualidade, performance, segurança e usabilidade.

| ID | Categoria | Descrição do Requisito |
|---|---|---|
| **RNF01** | Arquitetura | O sistema deve seguir o modelo Cliente-Servidor (Frontend HTML/CSS/JS isolado do Backend Node.js) utilizando uma API RESTful para comunicação. |
| **RNF02** | Persistência | O sistema deve utilizar um banco de dados relacional (SQLite) com integridade referencial rigorosa (Foreign Keys). |
| **RNF03** | Segurança | O armazenamento da senha no banco de dados deve utilizar criptografia hash irreversível (ex: bcrypt). |
| **RNF04** | Segurança | A comunicação entre cliente e servidor em rotas protegidas deve utilizar validação via tokens de acesso (JWT – JSON Web Tokens). |
| **RNF05** | Usabilidade | A interface gráfica deve ser responsiva (Mobile-first ou adaptável), proporcionando leitura e cliques confortáveis tanto em smartphones quanto em desktops. |
| **RNF06** | Desempenho | O carregamento de dados em páginas dinâmicas (ex: Dashboard, Sala de Aula) não deve demorar mais de 3 segundos em conexões estáveis. |
| **RNF07** | Armazenamento | O sistema deve limitar o tamanho máximo para upload da "Foto da Atividade" e permitir somente a extensão segura de imagens (JPG, PNG). |
| **RNF08** | Navegação | As URLs e botões não devem conter menções a identificadores explícitos que quebrem a imersão do usuário na jornada de aprendizagem. |
