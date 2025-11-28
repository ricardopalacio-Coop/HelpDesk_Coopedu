@echo off
chcp 65001 >nul
echo ========================================
echo  Sistema Helpdesk Coopedu
echo  Script de Inicialização
echo ========================================
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js não encontrado!
    echo Por favor, instale Node.js antes de continuar.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se pnpm está instalado
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] pnpm não encontrado. Instalando...
    npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao instalar pnpm
        pause
        exit /b 1
    )
)

REM Verificar se arquivo .env existe
if not exist ".env" (
    echo [ERRO] Arquivo .env não encontrado!
    echo.
    echo Por favor, crie o arquivo .env seguindo as instruções em:
    echo - README_INSTALACAO_LOCAL.md
    echo - VARIAVEIS_AMBIENTE.md
    echo.
    pause
    exit /b 1
)

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo [INFO] Instalando dependências pela primeira vez...
    echo Isso pode levar alguns minutos...
    echo.
    pnpm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERRO] Falha ao instalar dependências
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Iniciando servidor de desenvolvimento...
echo.
echo O sistema estará disponível em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
echo ========================================
echo.

pnpm dev

pause
