import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const ticketsRouter = router({
  // Listar tickets com filtros e RBAC
  list: protectedProcedure
    .input(z.object({
      status: z.enum([
        "aberto",
        "em_andamento",
        "aguardando_cooperado",
        "aguardando_departamento",
        "resolvido",
        "fechado",
        "fechado_sem_interacao"
      ]).optional(),
      departmentId: z.number().optional(),
      cooperadoId: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const filters: any = { ...input };
      
      // RBAC: Atendentes veem apenas seus tickets
      if (ctx.user.role === "atendente") {
        filters.assignedTo = ctx.user.id;
      }
      
      // RBAC: Gerentes veem tickets de seu departamento
      if (ctx.user.role === "gerente") {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (profile?.departmentId) {
          filters.departmentId = profile.departmentId;
        }
      }
      
      return await db.getAllTickets(filters);
    }),

  // Buscar ticket por ID com RBAC
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const ticket = await db.getTicketById(input.id);
      
      if (!ticket) return null;
      
      // RBAC: Verificar permissão
      if (ctx.user.role === "atendente" && ticket.assignedTo !== ctx.user.id) {
        throw new Error("Acesso negado: você não tem permissão para ver este ticket");
      }
      
      if (ctx.user.role === "gerente") {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (profile?.departmentId !== ticket.currentDepartmentId) {
          throw new Error("Acesso negado: este ticket não pertence ao seu departamento");
        }
      }
      
      return ticket;
    }),

  // Buscar ticket por protocolo
  getByProtocol: protectedProcedure
    .input(z.object({ protocol: z.string() }))
    .query(async ({ input }) => {
      return await db.getTicketByProtocol(input.protocol);
    }),

  // Criar novo ticket
  create: protectedProcedure
    .input(z.object({
      cooperadoId: z.number().optional(),
      contractId: z.number(),
      reasonId: z.number(),
      description: z.string().min(1),
      priority: z.enum(["baixa", "media", "alta", "urgente"]).default("media"),
      currentDepartmentId: z.number(),
      assignedTo: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.createTicket({
        ...input,
        status: "aberto",
        openedAt: new Date(),
      });
      
      // Criar histórico de criação
      await db.createTicketHistory({
        ticketId: Number(result.id),
        userId: ctx.user.id,
        action: "ticket_created",
        newValue: "Ticket criado",
      });
      
      return result;
    }),

  // Atualizar status do ticket
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum([
        "aberto",
        "em_andamento",
        "aguardando_cooperado",
        "aguardando_departamento",
        "resolvido",
        "fechado",
        "fechado_sem_interacao"
      ]),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, status, comment } = input;
      
      // Buscar ticket atual
      const ticket = await db.getTicketById(id);
      if (!ticket) throw new Error("Ticket não encontrado");
      
      const oldStatus = ticket.status;
      
      // Atualizar status
      const updates: any = { status };
      
      // Se fechando, registrar data de fechamento
      if (status === "fechado" || status === "fechado_sem_interacao") {
        updates.closedAt = new Date();
      }
      
      await db.updateTicket(id, updates);
      
      // Criar histórico
      await db.createTicketHistory({
        ticketId: id,
        userId: ctx.user.id,
        action: "status_change",
        oldValue: oldStatus,
        newValue: status,
        comment: comment || null,
      });
      
      return { success: true };
    }),

  // Atribuir ticket a um atendente
  assign: protectedProcedure
    .input(z.object({
      id: z.number(),
      assignedTo: z.number(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, assignedTo, comment } = input;
      
      // Apenas gerentes e admins podem atribuir
      if (ctx.user.role === "atendente") {
        throw new Error("Acesso negado: apenas gerentes e administradores podem atribuir tickets");
      }
      
      const ticket = await db.getTicketById(id);
      if (!ticket) throw new Error("Ticket não encontrado");
      
      await db.updateTicket(id, { assignedTo });
      
      await db.createTicketHistory({
        ticketId: id,
        userId: ctx.user.id,
        action: "reassign",
        oldValue: ticket.assignedTo?.toString() || "não atribuído",
        newValue: assignedTo.toString(),
        comment: comment || null,
      });
      
      return { success: true };
    }),

  // Remanejar ticket para outro departamento
  transfer: protectedProcedure
    .input(z.object({
      id: z.number(),
      departmentId: z.number(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, departmentId, comment } = input;
      
      // Apenas gerentes e admins podem remanejar
      if (ctx.user.role === "atendente") {
        throw new Error("Acesso negado: apenas gerentes e administradores podem remanejar tickets");
      }
      
      const ticket = await db.getTicketById(id);
      if (!ticket) throw new Error("Ticket não encontrado");
      
      await db.updateTicket(id, { 
        currentDepartmentId: departmentId,
        assignedTo: null, // Remove atribuição ao remanejar
      });
      
      await db.createTicketHistory({
        ticketId: id,
        userId: ctx.user.id,
        action: "department_change",
        oldValue: ticket.currentDepartmentId.toString(),
        newValue: departmentId.toString(),
        comment: comment || null,
      });
      
      return { success: true };
    }),

  // Mensagens do ticket
  messages: router({
    list: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketMessages(input.ticketId);
      }),

    create: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        message: z.string().min(1),
        mediaUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createTicketMessage({
          ticketId: input.ticketId,
          senderType: "atendente",
          senderId: ctx.user.id,
          message: input.message,
          mediaUrl: input.mediaUrl || null,
          isFromWhatsapp: false,
        });
        
        return { id };
      }),
  }),

  // Histórico do ticket
  history: router({
    list: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketHistory(input.ticketId);
      }),
  }),

  // Controle de tempo
  timeTracking: router({
    list: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketTimeTracking(input.ticketId);
      }),

    start: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        departmentId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.startTimeTracking({
          ticketId: input.ticketId,
          departmentId: input.departmentId,
          userId: ctx.user.id,
        });
        
        return { id };
      }),

    pause: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.pauseTimeTracking(input.id);
        return { success: true };
      }),

    resume: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.resumeTimeTracking(input.id);
        return { success: true };
      }),

    finish: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.finishTimeTracking(input.id);
        return { success: true };
      }),
  }),
});
