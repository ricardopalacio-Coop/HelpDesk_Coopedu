import { eq, and, like, desc, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, profiles, departments, cooperados, cooperadoPhones, 
  cooperadoBankData, contracts, attendanceReasons, tickets, ticketMessages,
  ticketHistory, ticketTimeTracking, csatSurveys, whatsappSessions as whatsappSessionsTable,
  quickMessages, userProfileTypes,
  type InsertProfile, type InsertDepartment, type InsertCooperado,
  type InsertCooperadoPhone, type InsertCooperadoBankData, type InsertContract,
  type InsertAttendanceReason, type InsertTicket, type InsertTicketMessage,
  type InsertTicketHistory, type InsertTicketTimeTracking, type InsertCsatSurvey,
  type InsertWhatsappSession, type InsertQuickMessage, type UserProfileType
} from "../drizzle/schema";

export { whatsappSessionsTable as whatsappSessions };
import { ENV } from './_core/env';
import { normalizeText } from '../shared/textUtils';
import { randomUUID } from "crypto";
import { storagePut } from "./storage";

let _db: ReturnType<typeof drizzle> | null = null;
type DatabaseInstance = NonNullable<Awaited<ReturnType<typeof getDb>>>;

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
      const normalized = value ? normalizeText(value) : null;
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
  
  const normalizedProfile = {
    ...profile,
    fullName: normalizeText(profile.fullName),
  };
  
  const result = await db.insert(profiles).values(normalizedProfile);
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
  
  const normalizedData = {
    ...data,
    ...(data.fullName && { fullName: normalizeText(data.fullName) }),
  };
  
  await db.update(profiles).set(normalizedData).where(eq(profiles.id, id));
}

// ============================================================================
// GESTÃO DE USUÁRIOS INTERNOS
// ============================================================================

type UserFilters = {
  page: number;
  pageSize: number;
  search?: string;
  email?: string;
  departmentId?: number;
  profileTypeId?: number;
};

type UserInput = {
  fullName: string;
  nickname?: string | null;
  email: string;
  phone: string;
  departmentId?: number | null;
  profileTypeId: number;
  avatar?: string | null;
};

const DEFAULT_PAGE_SIZE = 10;

function buildUserConditions(filters: Partial<UserFilters>) {
  const clauses = [];

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    clauses.push(
      or(
        like(users.name, term),
        like(profiles.fullName, term),
        like(users.email, term)
      )
    );
  }

  if (filters.email) {
    clauses.push(like(users.email, `%${filters.email.trim()}%`));
  }

  if (filters.departmentId) {
    clauses.push(eq(profiles.departmentId, filters.departmentId));
  }

  if (filters.profileTypeId) {
    clauses.push(eq(profiles.profileTypeId, filters.profileTypeId));
  }

  return clauses.length ? and(...clauses) : undefined;
}

function normalizePhoneNumber(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("55") ? digits.slice(2) : digits;
  return `+55${normalized}`;
}

async function maybeUploadAvatar(avatar?: string | null) {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  const base64Match = avatar.match(/^data:(.+);base64,(.+)$/);
  if (!base64Match) {
    return avatar;
  }
  const [, mime, data] = base64Match;
  try {
    const buffer = Buffer.from(data, "base64");
    const extension = mime.split("/")[1] ?? "png";
    const key = `avatars/${randomUUID()}.${extension}`;
    const { url } = await storagePut(key, buffer, mime);
    return url;
  } catch (error) {
    console.warn("[Users] Falha ao enviar avatar, usando data-url local", error);
    return avatar;
  }
}

function mapUserRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.fullName,
    nickname: row.nickname ?? row.name,
    email: row.email,
    phone: row.phone,
    departmentId: row.departmentId,
    departmentName: row.departmentName,
    profileTypeId: row.profileTypeId,
    profileName: row.profileName,
    profileRole: row.profileRole,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function fetchProfileType(db: DatabaseInstance, profileTypeId: number) {
  const result = await db
    .select()
    .from(userProfileTypes)
    .where(eq(userProfileTypes.id, profileTypeId))
    .limit(1);
  return result[0];
}

export async function listUserProfileTypes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userProfileTypes).orderBy(userProfileTypes.name);
}

export async function listSystemUsers(filters: Partial<UserFilters>) {
  const db = await getDb();
  if (!db) {
    return { items: [], total: 0 };
  }

  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(filters.pageSize ?? DEFAULT_PAGE_SIZE, 100);
  const where = buildUserConditions(filters);

  const baseQueryBuilder = db
    .select({
      id: users.id,
      fullName: profiles.fullName,
      nickname: profiles.nickname,
      name: users.name,
      email: users.email,
      phone: profiles.phone,
      departmentId: profiles.departmentId,
      departmentName: departments.name,
      profileTypeId: profiles.profileTypeId,
      profileName: userProfileTypes.name,
      profileRole: userProfileTypes.role,
      avatarUrl: profiles.avatarUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(departments, eq(profiles.departmentId, departments.id))
    .leftJoin(userProfileTypes, eq(profiles.profileTypeId, userProfileTypes.id));

  const totalQueryBuilder = db
    .select({ value: sql<number>`count(*)` })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id));

  const paginatedQuery = (where ? baseQueryBuilder.where(where) : baseQueryBuilder)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const totalQuery = where ? totalQueryBuilder.where(where) : totalQueryBuilder;

  const [items, totalResult] = await Promise.all([paginatedQuery, totalQuery]);
  const total = totalResult[0]?.value ?? 0;
  const mappedItems = items
    .map(mapUserRow)
    .filter((item): item is NonNullable<ReturnType<typeof mapUserRow>> => Boolean(item));

  return {
    items: mappedItems,
    total,
    page,
    pageSize,
  };
}

export async function getSystemUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      id: users.id,
      fullName: profiles.fullName,
      nickname: profiles.nickname,
      name: users.name,
      email: users.email,
      phone: profiles.phone,
      departmentId: profiles.departmentId,
      departmentName: departments.name,
      profileTypeId: profiles.profileTypeId,
      profileName: userProfileTypes.name,
      profileRole: userProfileTypes.role,
      avatarUrl: profiles.avatarUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(departments, eq(profiles.departmentId, departments.id))
    .leftJoin(userProfileTypes, eq(profiles.profileTypeId, userProfileTypes.id))
    .where(eq(users.id, id))
    .limit(1);

  return mapUserRow(result[0]);
}

export async function createSystemUser(input: UserInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length) {
    throw new Error("EMAIL_IN_USE");
  }

  const profileType = await fetchProfileType(db, input.profileTypeId);
  if (!profileType) {
    throw new Error("PROFILE_TYPE_NOT_FOUND");
  }

  const now = new Date();
  const openId = `local-${randomUUID()}`;
  const avatarUrl = await maybeUploadAvatar(input.avatar);

  const [{ insertId }] = await db.insert(users).values({
    openId,
    name: input.nickname ? normalizeText(input.nickname) : normalizeText(input.fullName),
    email: normalizedEmail,
    role: profileType.role as InsertUser["role"],
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  });

  await db.insert(profiles).values({
    userId: Number(insertId),
    fullName: normalizeText(input.fullName),
    nickname: input.nickname ? normalizeText(input.nickname) : null,
    phone: normalizePhoneNumber(input.phone),
    departmentId: input.departmentId ?? null,
    avatarUrl,
    profileTypeId: input.profileTypeId,
    isActive: true,
    isOnLeave: false,
    createdAt: now,
    updatedAt: now,
  });

  return await getSystemUserById(Number(insertId));
}

export async function updateSystemUser(id: number, input: UserInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const current = await getSystemUserById(id);
  if (!current) {
    throw new Error("USER_NOT_FOUND");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  if (normalizedEmail !== (current.email ?? "")) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, normalizedEmail), sql`${users.id} <> ${id}`))
      .limit(1);
    if (existing.length) {
      throw new Error("EMAIL_IN_USE");
    }
  }

  const profileType = await fetchProfileType(db, input.profileTypeId);
  if (!profileType) {
    throw new Error("PROFILE_TYPE_NOT_FOUND");
  }

  const avatarUrl = input.avatar === undefined
    ? current.avatarUrl
    : await maybeUploadAvatar(input.avatar);

  await db.update(users).set({
    name: input.nickname ? normalizeText(input.nickname) : normalizeText(input.fullName),
    email: normalizedEmail,
    role: profileType.role as InsertUser["role"],
    updatedAt: new Date(),
  }).where(eq(users.id, id));

  await db.update(profiles).set({
    fullName: normalizeText(input.fullName),
    nickname: input.nickname ? normalizeText(input.nickname) : null,
    phone: normalizePhoneNumber(input.phone),
    departmentId: input.departmentId ?? null,
    avatarUrl,
    profileTypeId: input.profileTypeId,
    updatedAt: new Date(),
  }).where(eq(profiles.userId, id));

  return await getSystemUserById(id);
}

export async function deleteSystemUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(users).where(eq(users.id, id));
}

// ============================================================================
// DEPARTAMENTOS
// ============================================================================

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: departments.id,
      name: departments.name,
      description: departments.description,
      responsibleUserId: departments.responsibleUserId,
      responsibleUserName: users.name,
      isActive: departments.isActive,
      createdAt: departments.createdAt,
    })
    .from(departments)
    .leftJoin(users, eq(departments.responsibleUserId, users.id))
    .orderBy(departments.name);
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

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(departments).where(eq(departments.id, id));
}

export async function toggleDepartmentStatus(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const department = await getDepartmentById(id);
  if (!department) throw new Error("Department not found");
  
  await db
    .update(departments)
    .set({ isActive: !department.isActive })
    .where(eq(departments.id, id));
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

export async function deleteCooperado(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(cooperados).where(eq(cooperados.id, id));
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
  
  // Importar funções de geração de ID
  const { generateContractId, extractSequentialFromContractId } = await import('../shared/ufCodes');
  
  // Buscar o último contrato da mesma UF para gerar o próximo sequencial
  const existingContractsFromState = await db.select()
    .from(contracts)
    .where(eq(contracts.state, contract.state))
    .orderBy(desc(contracts.id));
  
  let nextSequential = 1;
  if (existingContractsFromState.length > 0) {
    try {
      const lastSequential = extractSequentialFromContractId(existingContractsFromState[0].id);
      nextSequential = lastSequential + 1;
    } catch {
      // Se não conseguir extrair, começa do 1
      nextSequential = 1;
    }
  }
  
  // Gerar ID personalizado e verificar se já existe (loop até encontrar ID disponível)
  let customId: number;
  let attempts = 0;
  const maxAttempts = 999; // Máximo de contratos por UF
  
  while (attempts < maxAttempts) {
    customId = generateContractId(contract.state, nextSequential);
    
    // Verificar se o ID já existe
    const existing = await db.select()
      .from(contracts)
      .where(eq(contracts.id, customId))
      .limit(1);
    
    if (existing.length === 0) {
      // ID disponível, pode inserir
      break;
    }
    
    // ID já existe, incrementar e tentar novamente
    nextSequential++;
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error(`Não foi possível gerar um ID único para o estado ${contract.state}. Limite de contratos atingido.`);
  }
  
  // Inserir com ID personalizado
  await db.insert(contracts).values({
    ...contract,
    id: customId!,
  });
  
  return customId!;
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(contracts).set(data).where(eq(contracts.id, id));
}

export async function deleteContract(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se é contrato especial
  const contract = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  if (contract.length > 0 && contract[0].isSpecial) {
    throw new Error("Não é possível excluir contrato especial");
  }
  
  await db.delete(contracts).where(eq(contracts.id, id));
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

// ==================== Quick Messages ====================

export async function getQuickMessages() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quickMessages).where(eq(quickMessages.active, true));
}

export async function createQuickMessage(data: InsertQuickMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(quickMessages).values(data);
}

export async function updateQuickMessage(id: number, data: Partial<InsertQuickMessage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(quickMessages).set(data).where(eq(quickMessages.id, id));
}

export async function deleteQuickMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(quickMessages).where(eq(quickMessages.id, id));
}
