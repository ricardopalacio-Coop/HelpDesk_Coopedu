# 📦 Helpdesk Coopedu - Instalação Local

Sistema de atendimento Helpdesk com controle de tickets, integração WhatsApp e gestão de cooperados.

## 📋 Pré-requisitos

Antes de instalar, certifique-se de ter:

1. **Node.js 18+** instalado
   - Download: https://nodejs.org/
   - Verifique: `node --version`

2. **MySQL 8.0+** instalado e rodando
   - Download: https://dev.mysql.com/downloads/mysql/
   - Ou use XAMPP/WAMP que já inclui MySQL

3. **Banco de dados criado**
   ```sql
   CREATE DATABASE helpdesk_coopedu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## 🚀 Instalação

### Windows

1. Execute o instalador:
   ```
   install.bat
   ```

2. Configure o arquivo `.env.local` com suas credenciais MySQL:
   ```
   DATABASE_URL=mysql://root:sua_senha@localhost:3306/helpdesk_coopedu
   ```

3. Inicie o servidor:
   ```
   start.bat
   ```

### Linux / macOS

1. Dê permissão de execução aos scripts:
   ```bash
   chmod +x install.sh start.sh
   ```

2. Execute o instalador:
   ```bash
   ./install.sh
   ```

3. Configure o arquivo `.env.local` com suas credenciais MySQL:
   ```
   DATABASE_URL=mysql://root:sua_senha@localhost:3306/helpdesk_coopedu
   ```

4. Inicie o servidor:
   ```bash
   ./start.sh
   ```

## 🌐 Acessando o Sistema

Após iniciar, acesse:
- **URL**: http://localhost:3001
- **Porta**: 3001

## 🔐 Login Inicial

O sistema utiliza autenticação OAuth da Manus. No modo local, você precisará:

1. Criar um usuário administrador manualmente no banco de dados, OU
2. Configurar OAuth com suas próprias credenciais

### Criando Usuário Admin Manualmente

Execute no MySQL:

```sql
USE helpdesk_coopedu;

-- Inserir usuário
INSERT INTO users (openId, name, email, role, createdAt, updatedAt, lastSignedIn)
VALUES ('admin-local', 'Administrador', 'admin@coopedu.com.br', 'admin', NOW(), NOW(), NOW());

-- Obter o ID do usuário criado
SELECT id FROM users WHERE openId = 'admin-local';

-- Inserir perfil (substitua USER_ID pelo ID retornado acima)
INSERT INTO profiles (userId, fullName, isActive, createdAt, updatedAt)
VALUES (USER_ID, 'Administrador do Sistema', 1, NOW(), NOW());
```

## 📁 Estrutura do Projeto

```
helpdesk-coopedu/
├── client/              # Frontend (React + Vite)
├── server/              # Backend (Express + tRPC)
├── drizzle/             # Schema e migrations do banco
├── .env.local           # Configurações locais (CONFIGURE ESTE ARQUIVO)
├── install.bat/sh       # Script de instalação
├── start.bat/sh         # Script para iniciar servidor
└── README_INSTALACAO.md # Este arquivo
```

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Executar migrations
pnpm db:push

# Popular dados iniciais
pnpm exec tsx drizzle/seed.mjs

# Iniciar servidor de desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar em produção
pnpm start
```

## ⚙️ Configuração Avançada

### Alterar Porta

Edite o arquivo `.env.local`:
```
PORT=3001
```

### Configurar WhatsApp

1. Acesse: http://localhost:3001/configuracoes
2. Clique em "Integrar WhatsApp"
3. Escaneie o QR Code com seu WhatsApp

### Importar Dados

1. Acesse: http://localhost:3001/configuracoes
2. Use os importadores CSV para:
   - Cooperados
   - Contratos
3. Baixe os modelos CSV de exemplo

## 🐛 Solução de Problemas

### Erro: "Cannot connect to database"

- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env.local`
- Teste a conexão: `mysql -u root -p`

### Erro: "Port 3001 already in use"

- Altere a porta no `.env.local`
- Ou pare o processo usando a porta: `netstat -ano | findstr :3001` (Windows)

### Erro: "pnpm not found"

- Instale globalmente: `npm install -g pnpm`

### Chromium não encontrado (WhatsApp)

- O puppeteer será instalado automaticamente
- Se falhar, instale manualmente: `pnpm add puppeteer`

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@coopedu.com.br
- Documentação: https://docs.coopedu.com.br

## 📝 Licença

© 2024 Coopedu - Todos os direitos reservados
