import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { normalizeText } from "../../shared/textUtils";

export const cooperadosRouter = router({
  // Listar todos os cooperados com filtros
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["ativo", "inativo", "", "desligado"]).optional(),
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
      associationDate: z.string().optional(),
      position: z.string().optional(),
      status: z.enum(["ativo", "inativo", "", "desligado"]).default("ativo"),
      contractId: z.number().optional(),
      email: z.string().email().optional(),
      // Telefones
      whatsappNumber: z.string().optional(),
      secondaryPhone: z.string().optional(),
      // Endereço
      street: z.string().optional(),
      addressNumber: z.string().optional(),
      neighborhood: z.string().optional(),
      complement: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      // Dados Bancários
      bankCode: z.string().optional(),
      bankName: z.string().optional(),
      accountType: z.enum(["salario", "corrente", "poupanca"]).optional(),
      agency: z.string().optional(),
      accountNumber: z.string().optional(),
      accountDigit: z.string().optional(),
      pixKey: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Separar dados bancários do input
      const { bankCode, bankName, accountType, agency, accountNumber, accountDigit, pixKey, ...cooperadoData } = input;
      
      const id = await db.createCooperado({
        ...cooperadoData,
        name: normalizeText(input.name),
        document: normalizeText(input.document),
        position: input.position ? normalizeText(input.position) : undefined,
        street: input.street ? normalizeText(input.street) : undefined,
        neighborhood: input.neighborhood ? normalizeText(input.neighborhood) : undefined,
        city: input.city ? normalizeText(input.city) : undefined,
        birthDate: input.birthDate || null,
        admissionDate: input.admissionDate || null,
        associationDate: input.associationDate || null,
        terminationDate: null,
      });
      
      // Salvar dados bancários se fornecidos
      if (bankCode && bankName && accountType && agency && accountNumber) {
        await db.upsertCooperadoBankData({
          cooperadoId: id,
          bankCode: normalizeText(bankCode),
          bankName: normalizeText(bankName),
          accountType,
          agency: normalizeText(agency),
          accountNumber: normalizeText(accountNumber),
          accountDigit: accountDigit ? normalizeText(accountDigit) : undefined,
          pixKey: pixKey || undefined,
          isActive: true,
        });
      }
      
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
      associationDate: z.string().optional(),
      terminationDate: z.string().optional(),
      position: z.string().optional(),
      status: z.enum(["ativo", "inativo", "", "desligado"]).optional(),
      contractId: z.number().optional(),
      email: z.string().email().optional(),
      // Telefones
      whatsappNumber: z.string().optional(),
      secondaryPhone: z.string().optional(),
      // Endereço
      street: z.string().optional(),
      addressNumber: z.string().optional(),
      neighborhood: z.string().optional(),
      complement: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      // Dados Bancários
      bankCode: z.string().optional(),
      bankName: z.string().optional(),
      accountType: z.enum(["salario", "corrente", "poupanca"]).optional(),
      agency: z.string().optional(),
      accountNumber: z.string().optional(),
      accountDigit: z.string().optional(),
      pixKey: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const normalizedData = {
        ...data,
        ...(data.name && { name: normalizeText(data.name) }),
        ...(data.document && { document: normalizeText(data.document) }),
        ...(data.position && { position: normalizeText(data.position) }),
        ...(data.street && { street: normalizeText(data.street) }),
        ...(data.neighborhood && { neighborhood: normalizeText(data.neighborhood) }),
        ...(data.city && { city: normalizeText(data.city) }),
      };
      await db.updateCooperado(id, normalizedData);
      return { success: true };
    }),

  // Excluir cooperado
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCooperado(input.id);
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
          phone: normalizeText(input.phone),
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
        const normalizedData = {
          ...data,
          ...(data.phone && { phone: normalizeText(data.phone) }),
        };
        await db.updateCooperadoPhone(id, normalizedData);
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
          bankName: normalizeText(input.bankName),
          agency: normalizeText(input.agency),
          accountNumber: normalizeText(input.accountNumber),
          accountDigit: input.accountDigit ? normalizeText(input.accountDigit) : undefined,
          pixKey: input.pixKey ? normalizeText(input.pixKey) : undefined,
          isActive: true,
        });
        return { id };
      }),
  }),
});
