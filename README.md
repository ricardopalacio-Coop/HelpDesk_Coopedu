# 🎫 Sistema Helpdesk Coopedu

Sistema completo de gestão de atendimentos e tickets desenvolvido para a **Coopedu - Excelência em Educação**. O sistema oferece controle centralizado de tickets, gestão de cooperados e contratos, integração com WhatsApp e ferramentas administrativas para otimizar o atendimento aos cooperados.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-Propriet%C3%A1rio-blue)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **Sistema Helpdesk Coopedu** foi desenvolvido para centralizar e otimizar o atendimento aos cooperados da Coopedu. O sistema permite o gerenciamento completo de tickets de atendimento, cadastro de cooperados e contratos, organização por departamentos e integração futura com WhatsApp para atendimento automatizado.

### Objetivos Principais

O sistema foi projetado para atender às necessidades específicas de uma cooperativa educacional, oferecendo controle granular sobre atendimentos, histórico completo de interações e relatórios detalhados de performance. A arquitetura modular permite expansão futura com novos módulos e integrações.

### Contexto de Uso

Destinado ao uso interno da Coopedu, o sistema atende diferentes perfis de usuários, desde atendentes que registram e acompanham tickets até gestores que analisam métricas e relatórios de performance. A interface intuitiva e responsiva permite acesso tanto de desktops quanto de dispositivos móveis.

---

## ✨ Funcionalidades

### Módulos Implementados

#### 🏠 Dashboard
O dashboard oferece uma visão geral do sistema com métricas em tempo real sobre o status dos atendimentos. São exibidos cards com informações sobre tickets abertos, aguardando resposta, resolvidos e total de registros. Também apresenta estatísticas sobre cooperados cadastrados e contratos ativos, além de uma lista dos tickets mais recentes para acompanhamento rápido.

#### 👥 Gestão de Cooperados
O módulo de cooperados permite o cadastro completo com validação automática de CPF, busca de endereço por CEP integrada aos Correios e registro de dados bancários. O sistema oferece funcionalidades de importação em massa via arquivos CSV com validação de dados, exportação para Excel, busca e filtros avançados por nome, CPF, cargo e status, além de ordenação por colunas e paginação para grandes volumes de dados.

#### 📄 Gestão de Contratos
A gestão de contratos possibilita o vínculo de contratos a cooperados cadastrados, controle de status (ativo/inativo), registro de valores e datas de vigência. O módulo também oferece importação via CSV, exportação para Excel e filtros por cooperado, status e período.

#### 🏢 Departamentos
O módulo de departamentos permite o cadastro de departamentos organizacionais, definição de responsáveis e descrição das atribuições. Futuramente, será possível configurar o remanejamento automático de tickets entre departamentos.

#### 💬 WhatsApp
A interface de integração com WhatsApp está preparada para conexão futura com a API oficial do WhatsApp Business. O sistema permitirá o recebimento automático de mensagens como tickets, envio de notificações e respostas automáticas configuráveis.

#### ⚙️ Configurações
O submenu de configurações oferece acesso centralizado a diversas funcionalidades administrativas. As **Mensagens Automáticas** permitem criar respostas rápidas para agilizar o atendimento, enquanto o módulo de **Importações** possibilita a carga em massa de cooperados e contratos via CSV com validação e relatório de erros. Os módulos de Usuários, Perfil do Usuário, Empresa, Tipos de Atendimentos e APIs estão marcados como "Em Desenvolvimento" e serão implementados nas próximas versões.

### Funcionalidades em Desenvolvimento

#### 🎫 Sistema de Tickets
O sistema completo de tickets está em desenvolvimento e incluirá criação e atribuição de tickets, controle de status e prioridades, histórico completo de ações, sistema de comentários e anotações, remanejamento entre departamentos, integração com WhatsApp para criação automática e notificações por email e push.

#### 📊 Relatórios e Análises
O módulo de relatórios oferecerá dashboards interativos com gráficos, métricas de tempo médio de atendimento, análise por departamento e cooperado, filtros por período e tipo de atendimento, além de exportação em PDF e Excel.

#### 👤 Gestão de Usuários
A gestão de usuários permitirá o cadastro de usuários do sistema, controle de permissões e perfis de acesso (admin/usuário), histórico de ações e auditoria, além de autenticação segura com JWT.

---

## 🛠️ Tecnologias Utilizadas

### Frontend

O frontend foi desenvolvido com **React 19** utilizando TypeScript para garantir type-safety e melhor experiência de desenvolvimento. O **Tailwind CSS 4** foi escolhido para estilização com design system consistente, enquanto a biblioteca **shadcn/ui** fornece componentes UI modernos e acessíveis. O **Wouter** gerencia o roteamento de forma leve e eficiente, e o **tRPC** oferece comunicação type-safe com o backend sem necessidade de definir contratos manualmente.

### Backend

O backend utiliza **Node.js 22** com **Express 4** como servidor HTTP e **tRPC 11** para criar APIs type-safe. O **Drizzle ORM** gerencia o banco de dados com migrations automáticas, enquanto o **SuperJSON** permite serialização de tipos complexos (Date, Map, Set). A autenticação é feita via **JWT** com suporte a OAuth do Manus.

### Banco de Dados

O sistema utiliza **MySQL 8.0+** como banco de dados relacional, com schema gerenciado pelo Drizzle ORM. O banco armazena informações de cooperados, contratos, departamentos, tickets, usuários e configurações do sistema.

### Ferramentas de Desenvolvimento

O projeto utiliza **Vite** como bundler para desenvolvimento rápido com HMR (Hot Module Replacement), **TypeScript** para type-safety em todo o código, **pnpm** como gerenciador de pacotes rápido e eficiente, **Vitest** para testes unitários e de integração, e **ESLint + Prettier** para manter a qualidade e consistência do código.

### Integrações

O sistema está preparado para integração com a **API oficial do WhatsApp Business** para atendimento automatizado, **ViaCEP** para busca automática de endereços, **Manus OAuth** para autenticação segura, e **Manus Forge APIs** para funcionalidades avançadas (LLM, storage, notificações).

---

## 🏗️ Arquitetura do Sistema

### Padrão Arquitetural

O sistema segue uma arquitetura **cliente-servidor** com separação clara entre frontend e backend. O frontend React consome APIs tRPC do backend, que por sua vez acessa o banco de dados MySQL através do Drizzle ORM. A comunicação entre camadas é type-safe graças ao TypeScript e tRPC.

### Fluxo de Dados

As requisições do usuário são capturadas pelo frontend React, que invoca procedures tRPC através de hooks (`useQuery` e `useMutation`). O backend processa as requisições, valida dados, executa lógica de negócio e acessa o banco de dados via Drizzle ORM. As respostas são serializadas com SuperJSON (mantendo tipos como Date) e retornadas ao frontend com type-safety completo.

### Camadas do Sistema

A **camada de apresentação** (Frontend React) é responsável pela interface do usuário, validação de formulários e gerenciamento de estado local. A **camada de aplicação** (Backend tRPC) implementa a lógica de negócio, validação de dados e orquestração de operações. A **camada de dados** (Drizzle ORM + MySQL) gerencia persistência, integridade referencial e consultas otimizadas.

### Segurança

O sistema implementa autenticação JWT com refresh tokens, validação de entrada em todas as APIs, proteção contra SQL injection via ORM, controle de acesso baseado em roles (admin/user) e sanitização de dados antes de exibição.

---

## 📦 Instalação

### Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter instalado em sua máquina o **Node.js** versão 18.x ou superior, **MySQL** versão 8.0 ou superior e **pnpm** como gerenciador de pacotes. Para verificar as instalações, execute os comandos `node --version`, `mysql --version` e `pnpm --version` no terminal.

### Instalação Rápida (Scripts Automatizados)

Para **Windows**, execute os arquivos `install.bat` e `start.bat` na raiz do projeto. Para **Linux/macOS**, dê permissão de execução com `chmod +x install.sh start.sh` e execute `./install.sh` seguido de `./start.sh`. Os scripts automatizados instalarão todas as dependências, configurarão o arquivo .env, criarão o banco de dados, executarão as migrações e iniciarão o servidor.

### Instalação Manual

Clone o repositório com `git clone https://github.com/ricardopalacio-Coop/HelpDesk_Coopedu.git` e entre no diretório com `cd HelpDesk_Coopedu`. Instale as dependências executando `pnpm install`. Configure o banco de dados MySQL criando o database com os comandos SQL fornecidos no arquivo `setup-database.sql`. Copie o arquivo `.env.local` para `.env` e configure as variáveis de ambiente, especialmente a `DATABASE_URL` e `JWT_SECRET`. Execute as migrações do banco com `pnpm db:push` e inicie o servidor de desenvolvimento com `pnpm dev`. O sistema estará disponível em http://localhost:3000.

---

## 🚀 Uso

### Primeiro Acesso

Ao acessar o sistema pela primeira vez em http://localhost:3000, você será redirecionado para a tela de login. O sistema utiliza autenticação Manus OAuth por padrão. Para ambiente local, o arquivo `.env.local` já vem configurado com credenciais de desenvolvimento.

### Navegação

O menu lateral oferece acesso rápido a todos os módulos do sistema. O **Dashboard** exibe a visão geral com métricas e estatísticas. Em **Cooperados**, você pode cadastrar e gerenciar cooperados. O módulo de **Contratos** permite vincular contratos aos cooperados. **Departamentos** organiza a estrutura organizacional. **WhatsApp** prepara a integração futura. O submenu **Configurações** oferece acesso a mensagens automáticas, importações e outras configurações administrativas.

### Importação de Dados

Para importar cooperados ou contratos em massa, acesse **Configurações > Importações**, baixe o modelo CSV correspondente, preencha o arquivo seguindo o formato exato (atenção para datas em DD/MM/YYYY e CPF sem formatação) e faça o upload do arquivo. O sistema validará os dados e exibirá um relatório com sucessos e erros.

### Exportação de Dados

Nas páginas de Cooperados e Contratos, clique no botão "Exportar Excel" para baixar todos os registros em formato XLSX. A exportação inclui todos os campos cadastrados e respeita os filtros aplicados.

---

## 📁 Estrutura do Projeto

```
helpdesk-coopedu/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── settings/       # Submenu Configurações
│   │   │   ├── Home.tsx        # Dashboard principal
│   │   │   ├── Cooperados.tsx  # Gestão de cooperados
│   │   │   ├── Contratos.tsx   # Gestão de contratos
│   │   │   ├── Departamentos.tsx
│   │   │   ├── WhatsApp.tsx
│   │   │   ├── TicketsPlaceholder.tsx
│   │   │   └── RelatoriosPlaceholder.tsx
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── Layout.tsx      # Layout principal
│   │   │   ├── Sidebar.tsx     # Menu lateral
│   │   │   └── ui/             # Componentes shadcn/ui
│   │   ├── lib/
│   │   │   └── trpc.ts         # Cliente tRPC
│   │   ├── App.tsx             # Rotas principais
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Estilos globais
│   └── public/                 # Arquivos estáticos
├── server/                     # Backend Express + tRPC
│   ├── _core/                  # Framework core
│   │   ├── context.ts          # Contexto tRPC
│   │   ├── trpc.ts             # Configuração tRPC
│   │   ├── oauth.ts            # Autenticação OAuth
│   │   ├── llm.ts              # Integração LLM
│   │   ├── notification.ts     # Sistema de notificações
│   │   └── ...
│   ├── routers/                # Rotas tRPC organizadas
│   │   ├── cooperados.ts       # Procedures de cooperados
│   │   ├── contracts.ts        # Procedures de contratos
│   │   ├── departments.ts      # Procedures de departamentos
│   │   ├── tickets.ts          # Procedures de tickets
│   │   ├── whatsapp.ts         # Procedures WhatsApp
│   │   ├── import.ts           # Procedures de importação
│   │   └── quickMessages.ts    # Mensagens automáticas
│   ├── routers.ts              # Router principal
│   ├── db.ts                   # Funções de banco de dados
│   └── storage.ts              # Integração S3
├── drizzle/                    # Schema e migrações
│   └── schema.ts               # Definição das tabelas
├── shared/                     # Código compartilhado
│   ├── brasil.ts               # Estados e cidades
│   ├── bancos.ts               # Lista de bancos
│   └── types.ts                # Tipos compartilhados
├── .env.local                  # Template de variáveis
├── install.bat / install.sh    # Scripts de instalação
├── start.bat / start.sh        # Scripts de inicialização
├── package.json                # Dependências do projeto
├── drizzle.config.ts           # Configuração Drizzle ORM
├── vite.config.ts              # Configuração Vite
├── tsconfig.json               # Configuração TypeScript
└── README.md                   # Este arquivo
```

---

## 🗺️ Roadmap

### Versão Atual (v0.9)

A versão atual implementa o dashboard com métricas em tempo real, gestão completa de cooperados e contratos, cadastro de departamentos, interface de integração WhatsApp, mensagens automáticas funcionais, sistema de importação CSV com validação, exportação para Excel e layout responsivo com menu lateral.

### Próximas Versões

A **v1.0** (prevista para Q1 2025) implementará o sistema completo de tickets com status e prioridades, remanejamento entre departamentos e histórico de ações. A **v1.1** (Q2 2025) trará relatórios e dashboards interativos, gráficos de performance e análises por período. A **v1.2** (Q2 2025) incluirá gestão de usuários com controle de permissões e auditoria de ações. A **v2.0** (Q3 2025) finalmente integrará a API oficial do WhatsApp Business com recebimento automático de mensagens e respostas automáticas.

---

## 🤝 Contribuindo

Este é um projeto proprietário da Coopedu. Contribuições são aceitas apenas de membros autorizados da equipe de desenvolvimento. Para contribuir, crie uma branch a partir de `main` com nomenclatura `feature/nome-da-funcionalidade` ou `fix/descricao-do-bug`. Faça commits seguindo o padrão Conventional Commits (`feat:`, `fix:`, `docs:`, etc.). Abra um Pull Request para a branch `main` com descrição detalhada das alterações. Aguarde a revisão de código antes do merge.

### Padrões de Código

Utilize TypeScript em todo o código, siga as configurações do ESLint e Prettier, escreva testes para novas funcionalidades e documente funções complexas com JSDoc.

---

## 📄 Licença

Este projeto é **propriedade exclusiva da Coopedu - Excelência em Educação**. Todos os direitos reservados. O código fonte não pode ser copiado, modificado ou distribuído sem autorização expressa da Coopedu.

---

## 📞 Contato

**Coopedu - Excelência em Educação**  
**Desenvolvedor:** Ricardo Palacio  
**GitHub:** [@ricardopalacio-Coop](https://github.com/ricardopalacio-Coop)

---

## 🙏 Agradecimentos

Desenvolvido com dedicação para otimizar o atendimento aos cooperados da Coopedu. Agradecimentos especiais à equipe de desenvolvimento e aos usuários que contribuíram com feedback valioso durante o desenvolvimento.

---

**Desenvolvido com ❤️ para Coopedu**
