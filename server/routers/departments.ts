import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const departmentsRouter = router({
  // Listar todos os departamentos
  list: protectedProcedure
    .query(async () => {
      return await db.getAllDepartments();
    }),

  // Buscar departamento por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getDepartmentById(input.id);
    }),

  // Criar novo departamento
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      responsibleUserId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas administradores podem criar departamentos
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado: apenas administradores podem criar departamentos");
      }
      
      const id = await db.createDepartment({
        ...input,
        isActive: true,
      });
      return { id };
    }),

  // Atualizar departamento
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      responsibleUserId: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas administradores podem atualizar departamentos
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado: apenas administradores podem atualizar departamentos");
      }
      
      const { id, ...data } = input;
      await db.updateDepartment(id, data);
      return { success: true };
    }),
});

export const attendanceReasonsRouter = router({
  // Listar todos os motivos de atendimento
  list: protectedProcedure
    .query(async () => {
      return await db.getAllAttendanceReasons();
    }),

  // Buscar motivo por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getAttendanceReasonById(input.id);
    }),

  // Criar novo motivo de atendimento
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      parentId: z.number().optional(),
      slaHours: z.number().default(48),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas administradores podem criar motivos
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado: apenas administradores podem criar motivos de atendimento");
      }
      
      const id = await db.createAttendanceReason({
        ...input,
        isActive: true,
      });
      return { id };
    }),

  // Atualizar motivo de atendimento
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      parentId: z.number().optional(),
      slaHours: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas administradores podem atualizar motivos
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado: apenas administradores podem atualizar motivos de atendimento");
      }
      
      const { id, ...data } = input;
      await db.updateAttendanceReason(id, data);
      return { success: true };
    }),
});
