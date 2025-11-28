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

## 🚀 Passo a Passo de Instalação

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

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Banco de Dados MySQL
DATABASE_URL="mysql://helpdesk_user:senha_segura_aqui@localhost:3306/helpdesk_coopedu"

# Servidor
PORT=3000
NODE_ENV=development

# JWT Secret (gere uma chave aleatória segura)
JWT_SECRET="sua_chave_secreta_jwt_aqui_minimo_32_caracteres"

# OAuth (para autenticação Manus - opcional em ambiente local)
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
VITE_APP_ID="seu_app_id"

# Informações do Proprietário
OWNER_OPEN_ID="admin"
OWNER_NAME="Administrador"

# APIs Manus (opcional - para funcionalidades avançadas)
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua_chave_api"
VITE_FRONTEND_FORGE_API_KEY="sua_chave_frontend"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# Configurações do App
VITE_APP_TITLE="Sistema Helpdesk Coopedu"
VITE_APP_LOGO="/logo.png"

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=""
VITE_ANALYTICS_WEBSITE_ID=""
```

**Importante:** 
- Substitua `senha_segura_aqui` pela mesma senha que você definiu no MySQL
- Gere um JWT_SECRET forte (pode usar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### 4. Instalar Dependências

```bash
pnpm install
```

### 5. Executar Migrações do Banco de Dados

```bash
pnpm db:push
```

Este comando criará todas as tabelas necessárias no banco de dados.

### 6. (Opcional) Popular Banco com Dados de Exemplo

Se desejar dados de exemplo para testar:

```bash
pnpm db:seed
```

### 7. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O sistema estará disponível em: **http://localhost:3000**

## 🔧 Scripts Disponíveis

```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Compila para produção
pnpm start        # Inicia servidor de produção
pnpm db:push      # Aplica migrações do banco de dados
pnpm db:studio    # Abre interface visual do banco de dados
pnpm test         # Executa testes
```

## 🎯 Primeiro Acesso

### Criar Usuário Administrador

Como o sistema usa autenticação Manus OAuth por padrão, para ambiente local você pode:

**Opção 1: Inserir usuário admin manualmente no banco**

```sql
USE helpdesk_coopedu;

INSERT INTO users (openId, name, email, role, loginMethod) 
VALUES ('admin', 'Administrador', 'admin@coopedu.com.br', 'admin', 'local');
```

**Opção 2: Modificar autenticação para modo local** (requer alterações no código)

### Acessar o Sistema

1. Abra o navegador em `http://localhost:3000`
2. Faça login com as credenciais configuradas
3. Acesse o menu lateral para navegar pelas funcionalidades

## 📁 Estrutura do Projeto

```
helpdesk-coopedu/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── components/ # Componentes reutilizáveis
│   │   └── lib/        # Utilitários e configurações
│   └── public/         # Arquivos estáticos
├── server/             # Backend Express + tRPC
│   ├── routers/        # Rotas tRPC
│   ├── db.ts           # Funções de banco de dados
│   └── _core/          # Núcleo do framework
├── drizzle/            # Schema e migrações do banco
│   └── schema.ts       # Definição das tabelas
└── .env                # Variáveis de ambiente
```

## 🐛 Solução de Problemas

### Erro de Conexão com MySQL

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solução:** Verifique se o MySQL está rodando:
```bash
sudo systemctl status mysql    # Linux
brew services list              # macOS
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

## 📞 Suporte

Para problemas ou dúvidas:
- Verifique os logs do servidor no terminal
- Consulte a documentação do projeto
- Entre em contato com a equipe de desenvolvimento

## 🔒 Segurança

**IMPORTANTE para ambiente de produção:**

1. ✅ Use senhas fortes para MySQL
2. ✅ Mantenha o JWT_SECRET secreto e complexo
3. ✅ Configure HTTPS
4. ✅ Ative firewall e restrinja acesso ao MySQL
5. ✅ Faça backups regulares do banco de dados
6. ✅ Mantenha Node.js e dependências atualizadas

## 📝 Licença

Sistema Helpdesk Coopedu - Uso interno da Coopedu
