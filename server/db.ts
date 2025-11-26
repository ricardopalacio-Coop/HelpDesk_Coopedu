import { eq, and, like, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, profiles, departments, cooperados, cooperadoPhones, 
  cooperadoBankData, contracts, attendanceReasons, tickets, ticketMessages,
  ticketHistory, ticketTimeTracking, csatSurveys, whatsappSessions as whatsappSessionsTable,
  type InsertProfile, type InsertDepartment, type InsertCooperado,
  type InsertCooperadoPhone, type InsertCooperadoBankData, type InsertContract,
  type InsertAttendanceReason, type InsertTicket, type InsertTicketMessage,
  type InsertTicketHistory, type InsertTicketTimeTracking, type InsertCsatSurvey,
  type InsertWhatsappSession
} from "../drizzle/schema";

export { whatsappSessionsTable as whatsappSessions };
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USUÁRIOS E AUTENTICAÇÃO
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// PERFIS
// ============================================================================

export async function createProfile(profile: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(profiles).values(profile);
  return result[0].insertId;
}

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProfile(id: number, data: Partial<InsertProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(profiles).set(data).where(eq(profiles.id, id));
}

// ============================================================================
// DEPARTAMENTOS
// ============================================================================

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(departments).orderBy(departments.name);
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDepartment(department: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(departments).values(department);
  return result[0].insertId;
}

export async function updateDepartment(id: number, data: Partial<InsertDepartment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(departments).set(data).where(eq(departments.id, id));
}

// ============================================================================
// COOPERADOS
// ============================================================================

export async function getAllCooperados(filters?: { status?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(cooperados);
  
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(cooperados.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      sql`(${cooperados.name} LIKE ${`%${filters.search}%`} OR ${cooperados.document} LIKE ${`%${filters.search}%`})`
    );
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(cooperados.createdAt));
}

export async function getCooperadoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(cooperados).where(eq(cooperados.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCooperadoByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select({ cooperado: cooperados })
    .from(cooperadoPhones)
    .innerJoin(cooperados, eq(cooperadoPhones.cooperadoId, cooperados.id))
    .where(and(
      eq(cooperadoPhones.phone, phone),
      eq(cooperadoPhones.isActive, true)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0].cooperado : undefined;
}

export async function createCooperado(cooperado: InsertCooperado) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(cooperados).values(cooperado);
  return result[0].insertId;
}

export async function updateCooperado(id: number, data: Partial<InsertCooperado>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(cooperados).set(data).where(eq(cooperados.id, id));
}

// ============================================================================
// TELEFONES DE COOPERADOS
// ============================================================================

export async function getCooperadoPhones(cooperadoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cooperadoPhones)
    .where(eq(cooperadoPhones.cooperadoId, cooperadoId))
    .orderBy(desc(cooperadoPhones.createdAt));
}

export async function addCooperadoPhone(phone: InsertCooperadoPhone) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(cooperadoPhones).values(phone);
  return result[0].insertId;
}

export async function updateCooperadoPhone(id: number, data: Partial<InsertCooperadoPhone>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(cooperadoPhones).set(data).where(eq(cooperadoPhones.id, id));
}

// ============================================================================
// DADOS BANCÁRIOS
// ============================================================================

export async function getCooperadoBankData(cooperadoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(cooperadoBankData)
    .where(eq(cooperadoBankData.cooperadoId, cooperadoId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCooperadoBankData(data: InsertCooperadoBankData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getCooperadoBankData(data.cooperadoId);
  
  if (existing) {
    await db.update(cooperadoBankData).set(data).where(eq(cooperadoBankData.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(cooperadoBankData).values(data);
    return result[0].insertId;
  }
}

// ============================================================================
// CONTRATOS
// ============================================================================

export async function getAllContracts(filters?: { status?: string; cooperadoId?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(contracts);
  
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(contracts.status, filters.status as any));
  }
  if (filters?.cooperadoId) {
    conditions.push(eq(contracts.cooperadoId, filters.cooperadoId));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(contracts.createdAt));
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSpecialContract() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contracts)
    .where(eq(contracts.isSpecial, true))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createContract(contract: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contracts).values(contract);
  return result[0].insertId;
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(contracts).set(data).where(eq(contracts.id, id));
}

// ============================================================================
// MOTIVOS DE ATENDIMENTO
// ============================================================================

export async function getAllAttendanceReasons() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(attendanceReasons)
    .where(eq(attendanceReasons.isActive, true))
    .orderBy(attendanceReasons.name);
}

export async function getAttendanceReasonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(attendanceReasons)
    .where(eq(attendanceReasons.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createAttendanceReason(reason: InsertAttendanceReason) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(attendanceReasons).values(reason);
  return result[0].insertId;
}

export async function updateAttendanceReason(id: number, data: Partial<InsertAttendanceReason>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(attendanceReasons).set(data).where(eq(attendanceReasons.id, id));
}

// ============================================================================
// TICKETS
// ============================================================================

export async function getAllTickets(filters?: { 
  status?: string; 
  departmentId?: number;
  assignedTo?: number;
  cooperadoId?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(tickets);
  
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(tickets.status, filters.status as any));
  }
  if (filters?.departmentId) {
    conditions.push(eq(tickets.currentDepartmentId, filters.departmentId));
  }
  if (filters?.assignedTo) {
    conditions.push(eq(tickets.assignedTo, filters.assignedTo));
  }
  if (filters?.cooperadoId) {
    conditions.push(eq(tickets.cooperadoId, filters.cooperadoId));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return await query.orderBy(desc(tickets.createdAt));
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTicketByProtocol(protocol: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tickets).where(eq(tickets.protocol, protocol)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTicket(ticket: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Gerar protocolo único (formato: YYYYMMDD-XXXX)
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const protocol = `${dateStr}-${randomSuffix}`;
  
  // Calcular SLA deadline se reasonId fornecido
  let slaDeadline = null;
  if (ticket.reasonId) {
    const reason = await getAttendanceReasonById(ticket.reasonId);
    if (reason) {
      slaDeadline = new Date(now.getTime() + reason.slaHours * 60 * 60 * 1000);
    }
  }
  
  const result = await db.insert(tickets).values({
    ...ticket,
    protocol,
    slaDeadline,
    lastInteractionAt: now,
    openedAt: now,
  });
  
  return { id: result[0].insertId, protocol };
}

export async function updateTicket(id: number, data: Partial<InsertTicket>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tickets).set(data).where(eq(tickets.id, id));
}

export async function updateTicketInteraction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tickets).set({ lastInteractionAt: new Date() }).where(eq(tickets.id, id));
}

// ============================================================================
// MENSAGENS DE TICKETS
// ============================================================================

export async function getTicketMessages(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(ticketMessages)
    .where(eq(ticketMessages.ticketId, ticketId))
    .orderBy(ticketMessages.createdAt);
}

export async function createTicketMessage(message: InsertTicketMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ticketMessages).values(message);
  
  // Atualizar lastInteractionAt do ticket se mensagem for do cooperado
  if (message.senderType === 'cooperado') {
    await updateTicketInteraction(message.ticketId);
  }
  
  return result[0].insertId;
}

// ============================================================================
// HISTÓRICO DE TICKETS
// ============================================================================

export async function getTicketHistory(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(ticketHistory)
    .where(eq(ticketHistory.ticketId, ticketId))
    .orderBy(desc(ticketHistory.createdAt));
}

export async function createTicketHistory(history: InsertTicketHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ticketHistory).values(history);
  return result[0].insertId;
}

// ============================================================================
// CONTROLE DE TEMPO
// ============================================================================

export async function getTicketTimeTracking(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(ticketTimeTracking)
    .where(eq(ticketTimeTracking.ticketId, ticketId))
    .orderBy(ticketTimeTracking.startedAt);
}

export async function startTimeTracking(tracking: InsertTicketTimeTracking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ticketTimeTracking).values({
    ...tracking,
    startedAt: new Date(),
    totalSeconds: 0,
  });
  
  return result[0].insertId;
}

export async function pauseTimeTracking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const tracking = await db.select().from(ticketTimeTracking)
    .where(eq(ticketTimeTracking.id, id))
    .limit(1);
  
  if (tracking.length === 0) return;
  
  const record = tracking[0];
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - new Date(record.startedAt).getTime()) / 1000);
  
  await db.update(ticketTimeTracking).set({
    pausedAt: now,
    totalSeconds: record.totalSeconds + elapsed,
  }).where(eq(ticketTimeTracking.id, id));
}

export async function resumeTimeTracking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(ticketTimeTracking).set({
    resumedAt: new Date(),
    pausedAt: null,
  }).where(eq(ticketTimeTracking.id, id));
}

export async function finishTimeTracking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const tracking = await db.select().from(ticketTimeTracking)
    .where(eq(ticketTimeTracking.id, id))
    .limit(1);
  
  if (tracking.length === 0) return;
  
  const record = tracking[0];
  const now = new Date();
  const startTime = record.resumedAt || record.startedAt;
  const elapsed = Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000);
  
  await db.update(ticketTimeTracking).set({
    finishedAt: now,
    totalSeconds: record.totalSeconds + elapsed,
  }).where(eq(ticketTimeTracking.id, id));
}


// ==================== IMPORTAÇÃO EM MASSA ====================

/**
 * Importar cooperados em massa
 */
export async function bulkImportCooperados(data: Array<{
  registrationNumber: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  admissionDate?: Date;
  position?: string;
  status: "ativo" | "inativo" | "sem_producao";
  contractId?: number;
}>) {
  const dbClient = await getDb();
  if (!dbClient) throw new Error("Database not available");

  const results = {
    success: 0,
    errors: [] as Array<{ row: number; error: string; data: any }>,
  };

  for (let i = 0; i < data.length; i++) {
    try {
      const row = data[i];
      if (!row) continue;

      // Validar campos obrigatórios
      if (!row.registrationNumber || !row.name || !row.document) {
        results.errors.push({
          row: i + 1,
          error: "Campos obrigatórios faltando (matrícula, nome ou documento)",
          data: row,
        });
        continue;
      }

      // Inserir cooperado
      const [result] = await dbClient.insert(cooperados).values({
        registrationNumber: row.registrationNumber,
        name: row.name,
        document: row.document,
        email: row.email || null,
        birthDate: row.birthDate || null,
        admissionDate: row.admissionDate || null,
        position: row.position || null,
        status: row.status || "ativo",
        contractId: row.contractId || null,
      });

      // Se tem telefone, inserir também
      if (row.phone && result?.insertId) {
        const cooperadoId = Number(result.insertId);
        await dbClient.insert(cooperadoPhones).values({
          cooperadoId,
          phone: row.phone,
          phoneType: "principal",
          isActive: true,
        });
      }

      results.success++;
    } catch (error: any) {
      results.errors.push({
        row: i + 1,
        error: error.message || "Erro desconhecido",
        data: data[i],
      });
    }
  }

  return results;
}

/**
 * Importar contratos em massa
 */
export async function bulkImportContracts(data: Array<{
  name: string;
  status: "ativo" | "inativo";
  validityDate?: Date;
}>) {
  const dbClient = await getDb();
  if (!dbClient) throw new Error("Database not available");

  const results = {
    success: 0,
    errors: [] as Array<{ row: number; error: string; data: any }>,
  };

  for (let i = 0; i < data.length; i++) {
    try {
      const row = data[i];
      if (!row) continue;

      // Validar campos obrigatórios
      if (!row.name) {
        results.errors.push({
          row: i + 1,
          error: "Nome do contrato é obrigatório",
          data: row,
        });
        continue;
      }

      await dbClient.insert(contracts).values({
        name: row.name,
        status: row.status || "ativo",
        validityDate: row.validityDate || null,
        isSpecial: false,
      });

      results.success++;
    } catch (error: any) {
      results.errors.push({
        row: i + 1,
        error: error.message || "Erro desconhecido",
        data: data[i],
      });
    }
  }

  return results;
}

// Nota: Importação de usuários não é suportada via CSV
// Os usuários são criados automaticamente no primeiro login via Manus OAuth
// Apenas cooperados e contratos podem ser importados em massa
