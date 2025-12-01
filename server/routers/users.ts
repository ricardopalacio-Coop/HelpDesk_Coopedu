import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

// O ID do Supabase é um UUID, o role deve ser validado
const CreateUserSchema = z.object({
  openId: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["user", "admin", "gerente", "atendente"]).default("user"),
});

export const usersRouter = router({
  
  // Procedimento para Sincronizar o Usuário do Supabase para o MySQL
  createUser: publicProcedure // Público porque a autenticação ainda não foi concluída
    .input(CreateUserSchema)
    .mutation(async ({ input }) => {
      
      // Checagem de segurança: Já existe um usuário com este openId (Supabase ID)?
      // Aqui, para simplificar o início, faremos apenas a criação.
      // Em produção, você deve checar a existência para evitar duplicatas.

      // Cria o novo usuário no MySQL
      const result = await db.createMySqlUser({
        openId: input.openId,
        email: input.email,
        name: input.name,
        role: input.role,
      });

      console.log(`[SYNC] Novo usuário MySQL criado: ${input.email}`);

      // Retorna o resultado da criação para o frontend
      return { 
          success: true, 
          id: result.insertId // Assumindo que o insertId é retornado
      }; 
    }),

});