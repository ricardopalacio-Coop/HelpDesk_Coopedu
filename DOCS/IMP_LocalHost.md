# 🏠 Guia de Implementação - Rodar Aplicação em Localhost

> **Objetivo:** Executar o Sistema Helpdesk Coopedu localmente sem interferir na aplicação web em produção.

---

## 📋 Visão Geral

O sistema utiliza:
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + tRPC
- **Banco de Dados:** MySQL (Drizzle ORM)
- **Autenticação:** Supabase Auth
- **Porta padrão:** 3000

---

## ✅ Checklist de Pré-requisitos

| Requisito | Versão Mínima | Verificar Comando |
|-----------|---------------|-------------------|
| Node.js | 18.x+ | `node --version` |
| pnpm | 8.x+ | `pnpm --version` |
| MySQL | 8.0+ | `mysql --version` |

### Instalar pnpm (se não tiver):
```bash
npm install -g pnpm
```

---

## 🔧 PLANO DE IMPLEMENTAÇÃO

### ETAPA 1: Configurar MySQL Local

#### 1.1 Criar o banco de dados
```sql
-- Conectar ao MySQL
mysql -u root -p

-- Criar banco e usuário
CREATE DATABASE helpdesk_coopedu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'helpdesk_user'@'localhost' IDENTIFIED BY 'SuaSenhaSegura123!';
GRANT ALL PRIVILEGES ON helpdesk_coopedu.* TO 'helpdesk_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### ETAPA 2: Criar Arquivo de Ambiente (.env)

#### 2.1 Criar arquivo `.env` na raiz do projeto:

```env
# ============================================
# CONFIGURAÇÃO LOCALHOST - HELPDESK COOPEDU
# ============================================

# ----------------
# BANCO DE DADOS
# ----------------
DATABASE_URL="mysql://helpdesk_user:SuaSenhaSegura123!@localhost:3306/helpdesk_coopedu"

# ----------------
# SERVIDOR
# ----------------
PORT=3000
NODE_ENV=development

# ----------------
# SEGURANÇA (JWT)
# ----------------
# Gere uma chave segura com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="sua_chave_jwt_com_no_minimo_32_caracteres_aqui"

# ----------------
# SUPABASE (Autenticação)
# ----------------
# Obtenha essas credenciais em: https://supabase.com/dashboard
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Backend Supabase (opcional para funções admin)
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_KEY="sua_service_role_key"

# ----------------
# APLICAÇÃO
# ----------------
VITE_APP_TITLE="Sistema Helpdesk Coopedu"
OWNER_OPEN_ID="admin"
OWNER_NAME="Administrador"
```

#### 2.2 Como obter credenciais do Supabase:

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings > API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` (opcional)

---

### ETAPA 3: Instalar Dependências

```bash
pnpm install
```

---

### ETAPA 4: Executar Migrações do Banco

```bash
pnpm db:push
```

Este comando:
- Gera as migrações do Drizzle
- Cria todas as tabelas no MySQL

---

### ETAPA 5: Iniciar o Servidor

#### Opção A: Comando direto
```bash
pnpm dev
```

#### Opção B: Script Windows
```cmd
INICIAR.bat
```

#### Opção C: Script Linux/macOS
```bash
chmod +x iniciar.sh
./iniciar.sh
```

---

## 🌐 Acessar a Aplicação

Após iniciar, acesse:

```
http://localhost:3000
```

---

## 📊 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Compila para produção |
| `pnpm start` | Inicia versão de produção |
| `pnpm db:push` | Aplica migrações do banco |
| `pnpm test` | Executa testes |
| `pnpm check` | Verifica tipos TypeScript |

---

## 🐛 Solução de Problemas

### Erro: "Supabase não configurado"
```
❌ ERRO CRÍTICO: Credenciais do Supabase não encontradas!
```
**Solução:** Verifique se o arquivo `.env` existe e contém:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Erro: "DATABASE_URL is required"
```
Error: DATABASE_URL is required to run drizzle commands
```
**Solução:** Crie o arquivo `.env` com a variável `DATABASE_URL`

### Erro: MySQL - Conexão recusada
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solução:** Inicie o serviço MySQL:
```bash
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql
```

### Erro: Porta 3000 em uso
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solução:** O sistema automaticamente tentará outra porta, ou altere no `.env`:
```env
PORT=3001
```

---

## 🔒 Notas de Segurança

⚠️ **IMPORTANTE:**

1. **NUNCA** comite o arquivo `.env` no Git
2. Use senhas fortes e diferentes para cada ambiente
3. O arquivo `.env` já está no `.gitignore`
4. Para produção, use variáveis de ambiente do sistema

---

## 📁 Estrutura Relevante

```
HelpDesk_Coopedu/
├── .env                    # ⚠️ CRIAR (variáveis de ambiente)
├── client/                 # Frontend React
│   └── src/
│       └── integrations/
│           └── supabase/   # Configuração Supabase
├── server/                 # Backend Express + tRPC
│   └── _core/
│       └── env.ts          # Leitura das variáveis
├── drizzle/                # Schema e migrações MySQL
├── INICIAR.bat             # Script Windows
├── iniciar.sh              # Script Linux/macOS
└── package.json            # Scripts npm/pnpm
```

---

## ✨ Resumo Rápido

```bash
# 1. Configurar MySQL
mysql -u root -p < setup-database.sql

# 2. Criar .env (copiar modelo acima)

# 3. Instalar dependências
pnpm install

# 4. Executar migrações
pnpm db:push

# 5. Iniciar
pnpm dev

# 6. Acessar
# http://localhost:3000
```

---

## 📞 Próximos Passos

Após conseguir rodar localmente:

- [ ] Testar login com Supabase
- [ ] Verificar conexão com MySQL
- [ ] Importar dados de teste (CSV)
- [ ] Explorar funcionalidades do sistema

---

**Última atualização:** Dezembro 2025

