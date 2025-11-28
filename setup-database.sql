-- ============================================================================
-- Script de Setup do Banco de Dados - Sistema Helpdesk Coopedu
-- ============================================================================
-- Este script cria o banco de dados e o usuário necessários para o sistema
-- Execute este script no MySQL antes de iniciar a aplicação
-- ============================================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS helpdesk_coopedu 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Criar usuário (substitua 'sua_senha_aqui' por uma senha forte)
CREATE USER IF NOT EXISTS 'helpdesk_user'@'localhost' IDENTIFIED BY 'sua_senha_aqui';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON helpdesk_coopedu.* TO 'helpdesk_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Selecionar o banco de dados
USE helpdesk_coopedu;

-- Verificar se o banco foi criado corretamente
SELECT 'Banco de dados helpdesk_coopedu criado com sucesso!' AS status;

-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================
-- 1. Abra o terminal e conecte ao MySQL:
--    mysql -u root -p
--
-- 2. Execute este script:
--    source setup-database.sql
--
-- OU execute diretamente:
--    mysql -u root -p < setup-database.sql
--
-- 3. IMPORTANTE: Substitua 'sua_senha_aqui' por uma senha forte antes de executar
--
-- 4. Após executar este script, configure o DATABASE_URL no arquivo .env:
--    DATABASE_URL="mysql://helpdesk_user:sua_senha_aqui@localhost:3306/helpdesk_coopedu"
-- ============================================================================
