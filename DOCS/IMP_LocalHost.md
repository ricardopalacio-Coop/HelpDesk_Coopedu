# 🏠 Plano de Implementação - Localhost → Produção

> **Estratégia:** Testar tudo localmente PRIMEIRO, depois subir para web.

---

## 📊 Visão Geral do Plano

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE IMPLEMENTAÇÃO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   FASE 1: LOCALHOST          FASE 2: PRODUÇÃO                  │
│   ─────────────────          ─────────────────                  │
│                                                                 │
│   [1] Setup MySQL Local      [7] Deploy Backend                │
│          ↓                          ↓                          │
│   [2] Setup Supabase         [8] Configurar Domínio            │
│          ↓                          ↓                          │
│   [3] Criar .env             [9] Variáveis de Produção         │
│          ↓                          ↓                          │
│   [4] Instalar deps          [10] Migrar Banco                 │
│          ↓                          ↓                          │
│   [5] Rodar Migrações        [11] Testes Finais                │
│          ↓                          ↓                          │
│   [6] Testar Sistema         [12] Go Live! 🚀                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 🔷 FASE 1: LOCALHOST (Teste Local)

## Status: ⬜ Não Iniciado

---

### ETAPA 1.1: Verificar Pré-requisitos

| Requisito | Versão | Status | Comando |
|-----------|--------|--------|---------|
| Node.js | 18+ | ⬜ | `node --version` |
| pnpm | 8+ | ⬜ | `pnpm --version` |
| MySQL | 8.0+ | ⬜ | `mysql --version` |

**Instalar pnpm (se não tiver):**
```bash
npm install -g pnpm
```

---

### ETAPA 1.2: Configurar MySQL Local

**Status:** ⬜ Pendente

#### Opção A: Usar script pronto
```bash
mysql -u root -p < setup-database.sql
```
> ⚠️ Edite o arquivo antes para alterar a senha!

#### Opção B: Comandos manuais
```sql
-- Conectar ao MySQL
mysql -u root -p

-- Executar comandos
CREATE DATABASE helpdesk_coopedu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'helpdesk_user'@'localhost' IDENTIFIED BY 'MinhaSenh@Segur@2024';
GRANT ALL PRIVILEGES ON helpdesk_coopedu.* TO 'helpdesk_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Verificar criação:**
```sql
mysql -u helpdesk_user -p -e "SHOW DATABASES;"
```

---

### ETAPA 1.3: Configurar Supabase (Autenticação)

**Status:** ⬜ Pendente

#### Passo a passo:

1. ⬜ Acessar [supabase.com/dashboard](https://supabase.com/dashboard)
2. ⬜ Criar projeto (ou usar existente)
3. ⬜ Ir em **Settings > API**
4. ⬜ Copiar credenciais:

| Campo no Supabase | Variável no .env |
|-------------------|------------------|
| Project URL | `VITE_SUPABASE_URL` |
| anon public | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| service_role | `SUPABASE_SERVICE_KEY` |

---

### ETAPA 1.4: Criar Arquivo .env

**Status:** ⬜ Pendente

Criar arquivo `.env` na **raiz do projeto**:

```env
# =============================================
# CONFIGURAÇÃO LOCALHOST - HELPDESK COOPEDU
# =============================================

# -----------------
# BANCO DE DADOS (MySQL Local)
# -----------------
DATABASE_URL="mysql://helpdesk_user:MinhaSenh@Segur@2024@localhost:3306/helpdesk_coopedu"

# -----------------
# SERVIDOR
# -----------------
PORT=3000
NODE_ENV=development

# -----------------
# SEGURANÇA (JWT)
# -----------------
JWT_SECRET="GERAR_COM_COMANDO_ABAIXO"

# -----------------
# SUPABASE (Autenticação)
# -----------------
VITE_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_URL="https://SEU-PROJETO.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# -----------------
# APLICAÇÃO
# -----------------
VITE_APP_TITLE="Helpdesk Coopedu - LOCAL"
OWNER_OPEN_ID="admin"
OWNER_NAME="Administrador"
```

**Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### ETAPA 1.5: Instalar Dependências

**Status:** ⬜ Pendente

```bash
pnpm install
```

---

### ETAPA 1.6: Executar Migrações

**Status:** ⬜ Pendente

```bash
pnpm db:push
```

Este comando cria todas as tabelas no MySQL local.

---

### ETAPA 1.7: Iniciar Servidor Local

**Status:** ⬜ Pendente

```bash
pnpm dev
```

Ou use o script:
```cmd
INICIAR.bat
```

---

### ETAPA 1.8: Testar Sistema Local

**Status:** ⬜ Pendente

#### Checklist de Testes:

| Teste | Status | Observações |
|-------|--------|-------------|
| ⬜ Página carrega em `http://localhost:3000` | | |
| ⬜ Tela de login aparece | | |
| ⬜ Login com Supabase funciona | | |
| ⬜ Dashboard carrega após login | | |
| ⬜ Menu lateral navega corretamente | | |
| ⬜ Página Cooperados carrega | | |
| ⬜ Cadastro de cooperado funciona | | |
| ⬜ Página Contratos carrega | | |
| ⬜ Página Departamentos carrega | | |
| ⬜ Importação CSV funciona | | |
| ⬜ Exportação Excel funciona | | |

---

# 🔶 FASE 2: PRODUÇÃO (Subir para Web)

## Status: ⬜ Aguardando Fase 1

> ⚠️ **Só iniciar após todos os testes locais passarem!**

---

### ETAPA 2.1: Escolher Plataforma de Deploy

| Plataforma | Tipo | Custo | Recomendado |
|------------|------|-------|-------------|
| Zeabur | PaaS | $5+/mês | ✅ Já em uso |
| Railway | PaaS | $5+/mês | ⭐ Fácil |
| Render | PaaS | Free tier | ⭐ Gratuito |
| Vercel | Frontend | Free | Frontend only |
| VPS (DigitalOcean, etc) | IaaS | $5+/mês | Mais controle |

---

### ETAPA 2.2: Configurar Banco de Dados Produção

**Opções:**
- ⬜ PlanetScale (MySQL serverless)
- ⬜ Railway MySQL
- ⬜ Supabase Postgres (migrar de MySQL)
- ⬜ MySQL em VPS próprio

---

### ETAPA 2.3: Variáveis de Ambiente Produção

```env
# PRODUÇÃO - NÃO COMMITAR!
DATABASE_URL="mysql://user:senha@host-producao:3306/helpdesk_prod"
NODE_ENV=production
JWT_SECRET="chave_diferente_da_local"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_producao"
```

---

### ETAPA 2.4: Build e Deploy

```bash
# Gerar build de produção
pnpm build

# O output estará em dist/
```

---

### ETAPA 2.5: Testes em Produção

| Teste | Status |
|-------|--------|
| ⬜ Aplicação acessível via URL | |
| ⬜ HTTPS funcionando | |
| ⬜ Login funciona | |
| ⬜ Dados persistem | |
| ⬜ Performance aceitável | |

---

# 🐛 Solução de Problemas

### Erro: Supabase não configurado
```
❌ ERRO CRÍTICO: Credenciais do Supabase não encontradas!
```
**Causa:** Variáveis `VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` não estão no `.env`
**Solução:** Verificar arquivo `.env` e reiniciar o servidor

---

### Erro: MySQL - Conexão recusada
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Causa:** MySQL não está rodando
**Solução Windows:**
```cmd
net start MySQL80
```

---

### Erro: DATABASE_URL não encontrada
```
Error: DATABASE_URL is required
```
**Causa:** Arquivo `.env` não existe ou variável não está definida
**Solução:** Criar/verificar arquivo `.env`

---

### Erro: Porta em uso
```
Error: listen EADDRINUSE :::3000
```
**Causa:** Outra aplicação usando a porta 3000
**Solução:** O sistema tentará automaticamente a próxima porta, ou altere:
```env
PORT=3001
```

---

# 📋 Resumo de Comandos

```bash
# === SETUP INICIAL ===
pnpm install              # Instalar dependências
pnpm db:push              # Criar tabelas no banco

# === DESENVOLVIMENTO ===
pnpm dev                  # Iniciar servidor local
# Acesse: http://localhost:3000

# === PRODUÇÃO ===
pnpm build                # Gerar build
pnpm start                # Iniciar em modo produção

# === UTILITÁRIOS ===
pnpm check                # Verificar TypeScript
pnpm test                 # Executar testes
```

---

# ✅ Progresso Geral

| Fase | Etapa | Descrição | Status |
|------|-------|-----------|--------|
| 1 | 1.1 | Pré-requisitos | ⬜ |
| 1 | 1.2 | MySQL Local | ⬜ |
| 1 | 1.3 | Supabase | ⬜ |
| 1 | 1.4 | Arquivo .env | ⬜ |
| 1 | 1.5 | Dependências | ⬜ |
| 1 | 1.6 | Migrações | ⬜ |
| 1 | 1.7 | Iniciar Local | ⬜ |
| 1 | 1.8 | Testes Locais | ⬜ |
| 2 | 2.1 | Plataforma Deploy | ⬜ |
| 2 | 2.2 | Banco Produção | ⬜ |
| 2 | 2.3 | Variáveis Prod | ⬜ |
| 2 | 2.4 | Build/Deploy | ⬜ |
| 2 | 2.5 | Testes Prod | ⬜ |

---

**Última atualização:** Dezembro 2025
