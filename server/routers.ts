import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { cooperadosRouter } from "./routers/cooperados";
import { contractsRouter } from "./routers/contracts";
import { departmentsRouter, attendanceReasonsRouter } from "./routers/departments";
import { ticketsRouter } from "./routers/tickets";
import { whatsappRouter } from "./routers/whatsapp";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Routers do sistema Helpdesk
  cooperados: cooperadosRouter,
  contracts: contractsRouter,
  departments: departmentsRouter,
  attendanceReasons: attendanceReasonsRouter,
  tickets: ticketsRouter,
  whatsapp: whatsappRouter,
});

export type AppRouter = typeof appRouter;
