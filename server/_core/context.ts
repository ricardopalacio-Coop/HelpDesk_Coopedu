import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
// import { sdk } from "./sdk"; // Desativado para não depender da Manus

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  
  // ============================================================
  // 🔓 MODO BYPASS (IGNORAR LOGIN)
  // ============================================================
  // Este código cria um usuário "Admin" falso para que você possa
  // acessar o sistema sem precisar da autenticação externa.
  
  const mockAdminUser: User = {
    id: 1,
    openId: "bypass-admin-001",
    name: "Administrador (Modo Teste)",
    email: "admin@coopedu.com.br",
    role: "admin", // Permissão total
    loginMethod: "bypass",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  // Log para sabermos que funcionou quando olharmos no Zeabur
  console.log("🔓 [Auth Bypass] Acessando como Administrador automaticamente.");

  return {
    req: opts.req,
    res: opts.res,
    user: mockAdminUser,
  };
}
