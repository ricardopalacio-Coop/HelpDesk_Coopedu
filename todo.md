# Sistema Helpdesk Coopedu - TODO

## Banco de Dados e Schema
- [x] Adaptar schema do banco de dados para Drizzle ORM (MySQL)
- [x] Criar tabela profiles com campos de férias e expiração de senha
- [x] Criar tabela departments com responsável
- [x] Criar tabela cooperados com matrícula, dados trabalhistas e status
- [x] Criar tabela cooperado_phones para múltiplos telefones
- [x] Criar tabela cooperado_bank_data para dados bancários
- [x] Criar tabela contracts com data de validade
- [x] Criar tabela attendance_reasons com hierarquia e SLA
- [x] Criar tabela tickets com todos os status incluindo aguardando_departamento
- [x] Criar tabela ticket_messages para mensagens e WhatsApp
- [x] Criar tabela ticket_history para auditoria
- [x] Criar tabela ticket_time_tracking para controle de tempo
- [x] Criar tabela csat_surveys para pesquisas de satisfação
- [x] Criar tabela whatsapp_sessions para gerenciar conexão WhatsApp
- [x] Executar migrations e popular dados iniciais

## API Backend (tRPC)
- [ ] Implementar rotas de gestão de perfis de usuários
- [x] Implementar rotas de gestão de departamentos
- [x] Implementar rotas CRUD de cooperados
- [x] Implementar rotas de gestão de telefones de cooperados
- [x] Implementar rotas de gestão de dados bancários
- [x] Implementar rotas CRUD de contratos
- [x] Implementar rotas de motivos de atendimento hierárquicos
- [x] Implementar rotas de criação e gestão de tickets
- [x] Implementar rotas de mensagens de tickets
- [x] Implementar rotas de histórico de tickets
- [x] Implementar rotas de controle de tempo e SLA
- [x] Implementar rotas de remanejamento por departamento
- [ ] Implementar rotas de pesquisas CSAT
- [ ] Implementar dashboard com métricas agregadas

## Integração WhatsApp
- [x] Instalar e configurar whatsapp-web.js
- [x] Implementar geração e exibição de QR Code
- [x] Implementar recebimento de mensagens via WhatsApp
- [x] Implementar envio de mensagens via WhatsApp
- [x] Implementar criação automática de tickets a partir de mensagens
- [x] Implementar vinculação de número ao cooperado existente
- [ ] Implementar envio automático de pesquisa CSAT via WhatsApp
- [x] Implementar persistência de sessão WhatsApp

## Frontend (React + TailwindCSS)
- [x] Configurar tema e cores do sistema
- [x] Implementar DashboardLayout com sidebar
- [x] Criar página de login e autenticação (via Manus OAuth)
- [x] Criar página inicial com visão geral
- [x] Criar página de gestão de cooperados
- [x] Criar página de gestão de contratos
- [ ] Criar página de gestão de departamentos
- [ ] Criar página de gestão de usuários
- [x] Criar página de listagem de tickets
- [ ] Criar página de detalhes do ticket com mensagens
- [ ] Criar componente de chat integrado com WhatsApp
- [ ] Criar página de motivos de atendimento
- [ ] Criar dashboard com gráficos e métricas
- [x] Criar página de configuração do WhatsApp com QR Code
- [ ] Implementar alertas visuais de SLA próximo ao vencimento
- [ ] Criar página de relatórios e histórico

## Funcionalidades de Negócio
- [ ] Implementar RBAC com perfis Administrador, Gerente e Atendente
- [ ] Implementar Row Level Security nas queries
- [ ] Implementar geração automática de protocolo de ticket
- [ ] Implementar cálculo automático de SLA por motivo
- [ ] Implementar cronômetro de tempo trabalhado com pausas
- [ ] Implementar fechamento automático por inatividade (3h)
- [ ] Implementar expiração de pesquisa CSAT (3h)
- [ ] Implementar triggers de atualização de tempo
- [ ] Implementar notificações de SLA próximo ao vencimento
- [ ] Implementar histórico completo de ações nos tickets

## Testes e Documentação
- [ ] Escrever testes vitest para rotas de cooperados
- [ ] Escrever testes vitest para rotas de tickets
- [ ] Escrever testes vitest para integração WhatsApp
- [ ] Escrever testes vitest para CSAT
- [ ] Documentar APIs tRPC
- [ ] Documentar fluxo de integração WhatsApp
- [ ] Documentar regras de negócio e SLA
- [ ] Criar guia de uso do sistema

## Deploy e Finalização
- [ ] Validar todas as funcionalidades
- [ ] Criar checkpoint final
- [ ] Preparar documentação de entrega

## Importação de Dados
- [x] Criar página de Configurações com importadores CSV
- [x] Implementar importador de Cooperados via CSV
- [x] Implementar importador de Contratos via CSV
- [x] Criar modelos CSV de exemplo para download
- [x] Adicionar validação de dados importados
- [x] Exibir relatório de importação (sucessos e erros)

## Identidade Visual
- [x] Atualizar paleta de cores conforme padrão fornecido
- [x] Adicionar logo da Coopedu no sistema
- [x] Ajustar tema do sistema com novas cores

## Modernização Visual
- [x] Ajustar logo para azul padrão Coopedu
- [x] Melhorar design da sidebar com gradientes e sombras
- [x] Adicionar animações e transições suaves
- [x] Modernizar cards do dashboard com efeitos visuais
- [x] Melhorar tipografia e espaçamentos

## Melhorias no Menu Lateral
- [x] Corrigir texto quebrado "Helpdesk" na logo
- [x] Adicionar botão para encolher/expandir sidebar
- [x] Implementar estado colapsado do menu (apenas ícones)
- [x] Adicionar animação suave de transição

## Ajuste de Layout
- [x] Reorganizar header da sidebar com logo acima e texto "Helpdesk" abaixo

## Reorganização Menu WhatsApp
- [x] Mover item WhatsApp atual para dentro de Configurações como "Integrar WhatsApp"
- [x] Criar novo menu "WhatsApp" abaixo de "Tickets"
- [x] Desenvolver tela estilo WhatsApp Web para comunicação
- [x] Implementar lista de conversas/contatos
- [x] Implementar área de chat com mensagens
- [ ] Integrar com backend WhatsApp existente

## Melhorias WhatsApp Chat
- [x] Tornar interface WhatsApp responsiva até o menu
- [x] Adicionar botão de gravar áudio (UI pronto, backend pendente)
- [ ] Implementar gravação e envio de áudio real
- [ ] Adicionar função de reproduzir áudio recebido
- [x] Criar seção de mensagens rápidas nas Configurações
- [x] Adicionar botão de mensagens rápidas no chat WhatsApp
- [x] Implementar seleção e envio de mensagens rápidas

## Atualização de Logo e Favicon
- [x] Baixar favicon da Coopedu
- [x] Trocar logo para favicon quando menu estiver recolhido
- [x] Atualizar favicon da página no HTML

## Pacote para Execução Local
- [x] Criar arquivo .env.local com configurações
- [x] Criar script de instalação (install.bat/install.sh)
- [x] Criar script de execução (start.bat/start.sh)
- [x] Criar README com instruções
- [x] Gerar arquivo ZIP com todos os arquivos

## Melhorias no Cadastro de Contratos
- [x] Adicionar campos cidade e UF ao schema de contratos
- [x] Criar constante com lista de UFs do Brasil
- [x] Atualizar API de contratos para incluir cidade e UF
- [x] Atualizar interface com combobox de UF
- [x] Implementar auto-preenchimento do nome do contrato com nome da cidade
- [x] Tornar campos obrigatórios (nome, cidade, UF)
- [x] Executar migrations do banco de dados

## Ajuste no Cadastro de Contratos
- [x] Adicionar campo nome do contrato separado no formulário
- [x] Permitir edição independente de nome, cidade e UF

## Normalização de Texto
- [x] Criar função utilitária de normalização de texto (maiúsculas, sem acentos, ç→C)
- [x] Aplicar normalização nas APIs de contratos
- [x] Aplicar normalização nas APIs de cooperados
- [x] Aplicar normalização nas APIs de departamentos
- [x] Aplicar normalização na API de usuários/profiles
- [x] Testar normalização em todos os cadastros

## Melhorias na Página de Contratos
- [x] Implementar modal de edição de contratos
- [x] Adicionar toggle Ativar/Desativar no modal de edição
- [x] Implementar ação de exclusão de contratos com confirmação
- [x] Adicionar filtro por nome do contrato
- [x] Adicionar filtro por status (ativo/inativo)
- [x] Padronizar coluna Especial (Não com mesmo estilo do Sim)
- [x] Testar todas as funcionalidades
