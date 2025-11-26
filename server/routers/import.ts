import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const importRouter = router({
  /**
   * Importar cooperados em massa
   */
  importCooperados: protectedProcedure
    .input(
      z.object({
        data: z.array(
          z.object({
            registrationNumber: z.string(),
            name: z.string(),
            document: z.string(),
            email: z.string().optional(),
            phone: z.string().optional(),
            birthDate: z.string().optional(),
            admissionDate: z.string().optional(),
            position: z.string().optional(),
            status: z.enum(["ativo", "inativo", "sem_producao"]).optional(),
            contractId: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode importar
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem importar dados",
        });
      }

      // Converter datas de string para Date
      const processedData = input.data.map((row) => ({
        ...row,
        birthDate: row.birthDate ? new Date(row.birthDate) : undefined,
        admissionDate: row.admissionDate ? new Date(row.admissionDate) : undefined,
        status: (row.status || "ativo") as "ativo" | "inativo" | "sem_producao",
      }));

      const result = await db.bulkImportCooperados(processedData);
      return result;
    }),

  /**
   * Importar contratos em massa
   */
  importContracts: protectedProcedure
    .input(
      z.object({
        data: z.array(
          z.object({
            name: z.string(),
            status: z.enum(["ativo", "inativo"]).optional(),
            validityDate: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode importar
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem importar dados",
        });
      }

      // Converter datas de string para Date
      const processedData = input.data.map((row) => ({
        ...row,
        validityDate: row.validityDate ? new Date(row.validityDate) : undefined,
        status: (row.status || "ativo") as "ativo" | "inativo",
      }));

      const result = await db.bulkImportContracts(processedData);
      return result;
    }),
});
