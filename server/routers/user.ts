import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// O ID do Supabase é um UUID, mas o Drizzle/MySQL trata como VARCHAR(64).
const CreateUserSchema = z.object({
  openId: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["user", "admin", "gerente", "atendente"]).default("user"),
});

export const usersRouter = router({
  
  // 1. Procedimento para Sincronizar o Usuário do Supabase para o MySQL
  createUser: publicProcedure // Precisa ser público pois roda ANTES da autenticação
    .input(CreateUserSchema)
    .mutation(async ({ input }) => {
      
      // Checagem de segurança: Já existe um usuário com este openId (Supabase ID)?
      const existingUser = await db.getDb().select().from(users)
        .where(eq(users.openId, input.openId))
        .limit(1);

      if (existingUser.length > 0) {
        return existingUser[0]; // Retorna se já existir
      }

      // Se não existir, cria o novo usuário no MySQL
      const result = await db.createMySqlUser({
        openId: input.openId,
        email: input.email,
        name: input.name,
        role: input.role,
        // Os demais campos (createdAt, updatedAt) são definidos no Drizzle por padrão
      });

      console.log(`[SYNC] Novo usuário MySQL criado: ${input.email}`);

      // Retorna o novo usuário (ou o ID de inserção, dependendo do db.createMySqlUser)
      return { 
          id: Number(result.insertId), 
          openId: input.openId, 
          name: input.name 
      }; 
    }),

});