import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { normalizeText } from "../../shared/textUtils";

export const contractsRouter = router({
  // Listar todos os contratos com filtros
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["ativo", "inativo"]).optional(),
      cooperadoId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAllContracts(input);
    }),

  // Buscar contrato por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getContractById(input.id);
    }),

  // Buscar contrato especial "NÃO COOPERADO"
  getSpecial: protectedProcedure
    .query(async () => {
      return await db.getSpecialContract();
    }),

  // Criar novo contrato
  create: protectedProcedure
    .input(z.object({
      cooperadoId: z.number().optional(),
      name: z.string().min(1),
      city: z.string().min(1),
      state: z.string().length(2),
      status: z.enum(["ativo", "inativo"]).default("ativo"),
      validityDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createContract({
        ...input,
        name: normalizeText(input.name),
        city: normalizeText(input.city),
        state: normalizeText(input.state),
        validityDate: input.validityDate || null,
        isSpecial: false,
      });
      return { id };
    }),

  // Atualizar contrato
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      state: z.string().length(2).optional(),
      status: z.enum(["ativo", "inativo"]).optional(),
      validityDate: z.string().optional(),
      cooperadoId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const normalizedData = {
        ...data,
        ...(data.name && { name: normalizeText(data.name) }),
        ...(data.city && { city: normalizeText(data.city) }),
        ...(data.state && { state: normalizeText(data.state) }),
      };
      await db.updateContract(id, normalizedData);
      return { success: true };
    }),
});
