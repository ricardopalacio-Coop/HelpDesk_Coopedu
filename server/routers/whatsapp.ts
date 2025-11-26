import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as whatsappService from "../whatsapp/service";
import * as db from "../db";

export const whatsappRouter = router({
  // Obter status da conexão
  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      // Apenas administradores podem ver status
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado: apenas administradores podem gerenciar WhatsApp");
      }
      
      const status = whatsappService.getConnectionStatus();
      const qrCode = whatsappService.getCurrentQRCode();
      
      return {
        status,
        qrCode,
      };
    }),

  // Inicializar conexão WhatsApp
  initialize: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Apenas administradores podem inicializar
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado: apenas administradores podem gerenciar WhatsApp");
      }
      
      await whatsappService.initializeWhatsApp();
      
      return { success: true };
    }),

  // Desconectar WhatsApp
  disconnect: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Apenas administradores podem desconectar
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado: apenas administradores podem gerenciar WhatsApp");
      }
      
      await whatsappService.disconnectWhatsApp();
      
      return { success: true };
    }),

  // Enviar mensagem via WhatsApp
  sendMessage: protectedProcedure
    .input(z.object({
      ticketId: z.number(),
      message: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const { ticketId, message } = input;
      
      // Buscar ticket
      const ticket = await db.getTicketById(ticketId);
      if (!ticket) {
        throw new Error("Ticket não encontrado");
      }
      
      // Verificar permissão RBAC
      if (ctx.user.role === "atendente" && ticket.assignedTo !== ctx.user.id) {
        throw new Error("Acesso negado: você não tem permissão para este ticket");
      }
      
      // Buscar telefone do cooperado
      if (!ticket.cooperadoId) {
        throw new Error("Ticket não possui cooperado vinculado");
      }
      
      const phones = await db.getCooperadoPhones(ticket.cooperadoId);
      const primaryPhone = phones.find(p => p.phoneType === "principal" || p.phoneType === "whatsapp");
      
      if (!primaryPhone) {
        throw new Error("Cooperado não possui telefone cadastrado");
      }
      
      // Enviar mensagem
      const sent = await whatsappService.sendWhatsAppMessage(primaryPhone.phone, message);
      
      if (!sent) {
        throw new Error("Falha ao enviar mensagem. Verifique se o WhatsApp está conectado.");
      }
      
      // Salvar mensagem no histórico
      await db.createTicketMessage({
        ticketId,
        senderType: "atendente",
        senderId: ctx.user.id,
        message,
        isFromWhatsapp: true,
      });
      
      return { success: true };
    }),
});
