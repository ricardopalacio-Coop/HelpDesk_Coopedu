# 📦 Guia de Instalação Local - Sistema Helpdesk Coopedu

Este guia fornece instruções passo a passo para instalar e executar o Sistema Helpdesk Coopedu em sua máquina local.

## 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js** versão 18.x ou superior
- **MySQL** versão 8.0 ou superior
- **pnpm** (gerenciador de pacotes)

### Verificar instalações

```bash
node --version   # Deve mostrar v18.x ou superior
mysql --version  # Deve mostrar 8.0 ou superior
pnpm --version   # Se não tiver, instale com: npm install -g pnpm
```

## 🚀 Instalação Rápida (Scripts Automatizados)

### Windows

```cmd
install.bat
start.bat
```

### Linux/macOS

```bash
chmod +x install.sh start.sh
./install.sh
./start.sh
```

Os scripts automatizados irão:
1. Instalar todas as dependências
2. Configurar o arquivo .env
3. Criar o banco de dados
4. Executar as migrações
5. Iniciar o servidor

## 🔧 Instalação Manual (Passo a Passo)

### 1. Extrair o Projeto

Extraia o arquivo ZIP do projeto em uma pasta de sua preferência:

```bash
unzip helpdesk-coopedu.zip
cd helpdesk-coopedu
```

### 2. Configurar Banco de Dados MySQL

Abra o MySQL e crie o banco de dados:

```bash
mysql -u root -p
```

No console do MySQL, execute:

```sql
CREATE DATABASE helpdesk_coopedu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'helpdesk_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON helpdesk_coopedu.* TO 'helpdesk_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Nota:** Substitua `senha_segura_aqui` por uma senha forte de sua escolha.

### 3. Configurar Variáveis de Ambiente

O arquivo `.env.local` já vem pré-configurado. Edite-o com suas configurações:

```bash
# Windows
notepad .env.local

# Linux/macOS
nano .env.local
```

Configurações principais:

```env
# Banco de Dados MySQL
DATABASE_URL="mysql://helpdesk_user:senha_segura_aqui@localhost:3306/helpdesk_coopedu"

# JWT Secret (já vem com um valor padrão, mas recomenda-se alterar)
JWT_SECRET="sua_chave_secreta_jwt_aqui_minimo_32_caracteres"
```

**Importante:** 
- Substitua `senha_segura_aqui` pela mesma senha que você definiu no MySQL
- Para produção, gere um JWT_SECRET forte: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Renomear arquivo de ambiente

```bash
# Windows
copy .env.local .env

# Linux/macOS
cp .env.local .env
```

### 5. Instalar Dependências

```bash
pnpm install
```

### 6. Executar Migrações do Banco de Dados

```bash
pnpm db:push
```

Este comando criará todas as tabelas necessárias no banco de dados.

### 7. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O sistema estará disponível em: **http://localhost:3000**

## 🎯 Funcionalidades Implementadas

### ✅ Módulos Funcionais

1. **Dashboard**
   - Visão geral de tickets (abertos, aguardando, resolvidos)
   - Estatísticas de cooperados e contratos
   - Lista de tickets recentes

2. **Cooperados**
   - Cadastro completo com validação de CPF
   - Endereço com busca por CEP
   - Dados bancários
   - Importação em massa via CSV
   - Exportação para Excel

3. **Contratos**
   - Gestão de contratos vinculados a cooperados
   - Status (ativo/inativo)
   - Valores e datas
   - Importação via CSV
   - Exportação para Excel

4. **Departamentos**
   - Cadastro de departamentos
   - Gestão de responsáveis

5. **WhatsApp**
   - Interface para integração futura

6. **Configurações**
   - Submenu expansível com 7 opções
   - Mensagens Automáticas (funcional)
   - Importações de CSV (funcional)
   - Usuários, Perfil, Empresa, Tipos de Atendimentos, APIs (em desenvolvimento)

### 🚧 Em Desenvolvimento

- **Tickets** - Sistema completo de gestão de atendimentos
- **Relatórios** - Dashboards e análises
- **Usuários** - Gestão de usuários do sistema
- **Perfil do Usuário** - Configurações pessoais
- **Empresa** - Dados da cooperativa
- **Tipos de Atendimentos** - Categorias e motivos
- **APIs** - Integrações externas

## 🔧 Scripts Disponíveis

```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Compila para produção
pnpm start        # Inicia servidor de produção
pnpm db:push      # Aplica migrações do banco de dados
pnpm db:studio    # Abre interface visual do banco de dados (Drizzle Studio)
pnpm test         # Executa testes
```

## 🎯 Primeiro Acesso

### Autenticação Local

O sistema usa autenticação Manus OAuth por padrão. Para ambiente local, o arquivo `.env.local` já vem configurado com credenciais de desenvolvimento que permitem acesso direto.

### Acessar o Sistema

1. Abra o navegador em `http://localhost:3000`
2. Faça login com a conta Manus configurada
3. Acesse o menu lateral para navegar pelas funcionalidades

### Dados de Teste

Para popular o banco com dados de exemplo:

1. Acesse **Configurações > Importações**
2. Baixe os modelos CSV
3. Preencha com dados de teste
4. Importe os arquivos

Ou use os exemplos incluídos na pasta `examples/` (se disponível).

## 📁 Estrutura do Projeto

```
helpdesk-coopedu/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── settings/     # Páginas do submenu Configurações
│   │   │   ├── Home.tsx      # Dashboard principal
│   │   │   ├── Cooperados.tsx
│   │   │   ├── Contratos.tsx
│   │   │   ├── Departamentos.tsx
│   │   │   └── WhatsApp.tsx
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── Layout.tsx    # Layout principal com menu
│   │   │   ├── Sidebar.tsx   # Menu lateral
│   │   │   └── ui/           # Componentes shadcn/ui
│   │   └── lib/              # Utilitários e configurações
│   └── public/               # Arquivos estáticos
├── server/                   # Backend Express + tRPC
│   ├── routers.ts            # Rotas tRPC
│   ├── db.ts                 # Funções de banco de dados
│   └── _core/                # Núcleo do framework
├── drizzle/                  # Schema e migrações do banco
│   └── schema.ts             # Definição das tabelas
├── shared/                   # Código compartilhado
│   ├── brasil.ts             # Estados e cidades do Brasil
│   └── bancos.ts             # Lista de bancos brasileiros
├── .env.local                # Variáveis de ambiente (template)
├── install.bat               # Script de instalação Windows
├── install.sh                # Script de instalação Linux/macOS
├── start.bat                 # Script de inicialização Windows
├── start.sh                  # Script de inicialização Linux/macOS
└── README_INSTALACAO_LOCAL.md # Este arquivo
```

## 🐛 Solução de Problemas

### Erro de Conexão com MySQL

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solução:** Verifique se o MySQL está rodando:
```bash
# Linux
sudo systemctl status mysql
sudo systemctl start mysql

# macOS
brew services list
brew services start mysql

# Windows
net start MySQL80
```

### Erro de Autenticação MySQL

```
Error: Access denied for user 'helpdesk_user'@'localhost'
```

**Solução:** Verifique se o usuário foi criado corretamente e se a senha no `.env` está correta.

### Porta 3000 já em uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:** Altere a porta no arquivo `.env`:
```env
PORT=3001
```

### Erro ao executar migrações

```
Error: Unknown database 'helpdesk_coopedu'
```

**Solução:** Certifique-se de que o banco de dados foi criado (passo 2).

### Erro "pnpm: command not found"

**Solução:** Instale o pnpm globalmente:
```bash
npm install -g pnpm
```

### Erro de permissão nos scripts (Linux/macOS)

```
Permission denied: ./install.sh
```

**Solução:** Dê permissão de execução:
```bash
chmod +x install.sh start.sh
```

### Erro ao importar CSV

**Problemas comuns:**
- Formato de data incorreto (use DD/MM/YYYY)
- CPF sem formatação ou com formatação (aceita ambos)
- Campos obrigatórios vazios
- Encoding do arquivo (use UTF-8)

**Solução:** Baixe o modelo CSV e siga o formato exato.

## 🔍 Verificação de Instalação

Para verificar se tudo está funcionando:

1. ✅ Servidor iniciou sem erros
2. ✅ Página abre em http://localhost:3000
3. ✅ Login funciona
4. ✅ Dashboard carrega com cards de estatísticas
5. ✅ Menu lateral aparece e é navegável
6. ✅ Páginas de Cooperados e Contratos carregam

## 📞 Suporte

Para problemas ou dúvidas:
- Verifique os logs do servidor no terminal
- Consulte a seção de Solução de Problemas acima
- Verifique se todas as dependências foram instaladas
- Entre em contato com a equipe de desenvolvimento

## 🔒 Segurança

**IMPORTANTE para ambiente de produção:**

1. ✅ Use senhas fortes para MySQL
2. ✅ Mantenha o JWT_SECRET secreto e complexo
3. ✅ Configure HTTPS
4. ✅ Ative firewall e restrinja acesso ao MySQL
5. ✅ Faça backups regulares do banco de dados
6. ✅ Mantenha Node.js e dependências atualizadas
7. ✅ Não exponha o arquivo .env
8. ✅ Use variáveis de ambiente do sistema operacional

## 🎨 Personalização

### Alterar Logo

Substitua o arquivo `client/public/logo.png` pela logo da sua cooperativa.

### Alterar Cores

Edite o arquivo `client/src/index.css` para ajustar as cores do tema:

```css
:root {
  --primary: 210 100% 50%;  /* Azul principal */
  --secondary: 210 40% 96%; /* Azul claro */
  /* ... outras cores ... */
}
```

### Alterar Título

Edite o arquivo `.env`:

```env
VITE_APP_TITLE="Seu Título Aqui"
```

## 📝 Changelog

### Versão Atual (Novembro 2024)

**Novas Funcionalidades:**
- ✅ Submenu expansível em Configurações (7 itens)
- ✅ Badges "DEV" para funcionalidades em desenvolvimento
- ✅ Layout consistente em todas as páginas
- ✅ Mensagens Automáticas funcionais
- ✅ Sistema de importação CSV aprimorado
- ✅ Exportação para Excel
- ✅ Validação de CPF e CEP
- ✅ Busca e filtros em tabelas
- ✅ Ordenação por colunas
- ✅ Paginação

**Melhorias:**
- Interface mais intuitiva e responsiva
- Feedback visual aprimorado (toasts, loading states)
- Validações de formulário robustas
- Tratamento de erros melhorado

## 📝 Licença

Sistema Helpdesk Coopedu - Uso interno da Coopedu

---

**Desenvolvido com ❤️ para Coopedu**
