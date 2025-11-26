import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const cooperadosRouter = router({
  // Listar todos os cooperados com filtros
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["ativo", "inativo", "sem_producao"]).optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAllCooperados(input);
    }),

  // Buscar cooperado por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCooperadoById(input.id);
    }),

  // Buscar cooperado por telefone (para integração WhatsApp)
  getByPhone: protectedProcedure
    .input(z.object({ phone: z.string() }))
    .query(async ({ input }) => {
      return await db.getCooperadoByPhone(input.phone);
    }),

  // Criar novo cooperado
  create: protectedProcedure
    .input(z.object({
      registrationNumber: z.number(),
      name: z.string().min(1),
      document: z.string().min(1),
      birthDate: z.string().optional(),
      admissionDate: z.string().optional(),
      position: z.string().optional(),
      status: z.enum(["ativo", "inativo", "sem_producao"]).default("ativo"),
      contractId: z.number().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createCooperado({
        ...input,
        birthDate: input.birthDate || null,
        admissionDate: input.admissionDate || null,
        terminationDate: null,
      });
      return { id };
    }),

  // Atualizar cooperado
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      document: z.string().min(1).optional(),
      birthDate: z.string().optional(),
      admissionDate: z.string().optional(),
      terminationDate: z.string().optional(),
      position: z.string().optional(),
      status: z.enum(["ativo", "inativo", "sem_producao"]).optional(),
      contractId: z.number().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCooperado(id, data);
      return { success: true };
    }),

  // Gerenciar telefones do cooperado
  phones: router({
    list: protectedProcedure
      .input(z.object({ cooperadoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCooperadoPhones(input.cooperadoId);
      }),

    add: protectedProcedure
      .input(z.object({
        cooperadoId: z.number(),
        phone: z.string().min(1),
        phoneType: z.enum(["principal", "secundario", "whatsapp"]).default("principal"),
      }))
      .mutation(async ({ input }) => {
        const id = await db.addCooperadoPhone({
          ...input,
          isActive: true,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        phone: z.string().min(1).optional(),
        phoneType: z.enum(["principal", "secundario", "whatsapp"]).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCooperadoPhone(id, data);
        return { success: true };
      }),
  }),

  // Gerenciar dados bancários do cooperado
  bankData: router({
    get: protectedProcedure
      .input(z.object({ cooperadoId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Apenas administradores podem ver dados bancários
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado: apenas administradores podem visualizar dados bancários");
        }
        return await db.getCooperadoBankData(input.cooperadoId);
      }),

    upsert: protectedProcedure
      .input(z.object({
        cooperadoId: z.number(),
        bankCode: z.string().min(1),
        bankName: z.string().min(1),
        accountType: z.enum(["salario", "corrente", "poupanca"]),
        agency: z.string().min(1),
        accountNumber: z.string().min(1),
        accountDigit: z.string().optional(),
        pixKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Apenas administradores podem gerenciar dados bancários
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado: apenas administradores podem gerenciar dados bancários");
        }
        
        const id = await db.upsertCooperadoBankData({
          ...input,
          isActive: true,
        });
        return { id };
      }),
  }),
});
