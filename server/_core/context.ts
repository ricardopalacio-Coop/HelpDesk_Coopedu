import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

const isBypassEnabled =
  process.env.AUTH_BYPASS === "true" ||
  (process.env.AUTH_BYPASS !== "false" && process.env.NODE_ENV !== "production");

function buildMockAdmin(): User {
  const now = new Date();
  return {
    id: 1,
    openId: "bypass-admin-001",
    name: "Administrador (Modo Teste)",
    email: "admin@coopedu.com.br",
    role: "admin",
    loginMethod: "bypass",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  if (isBypassEnabled) {
    console.log("🔓 [Auth Bypass] Acessando como Administrador automaticamente.");
    return {
      req: opts.req,
      res: opts.res,
      user: buildMockAdmin(),
    };
  }

  const user = await sdk.authenticateRequest(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
