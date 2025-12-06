import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean, date, json, uniqueIndex } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Schema do Sistema Helpdesk Coopedu
 * Adaptado da arquitetura PostgreSQL/Supabase para MySQL/Drizzle ORM
 */

// ============================================================================
// USUÁRIOS E AUTENTICAÇÃO
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "gerente", "atendente"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_unique").on(table.email),
}));

export const userProfileTypes = mysqlTable("user_profile_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  role: mysqlEnum("role", ["user", "admin", "gerente", "atendente"]).notNull().default("user"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 120 }),
  phone: varchar("phone", { length: 32 }),
  avatarUrl: text("avatarUrl"),
  profileTypeId: int("profileTypeId").references(() => userProfileTypes.id),
  departmentId: int("departmentId").references(() => departments.id),
  isActive: boolean("isActive").default(true).notNull(),
  isOnLeave: boolean("isOnLeave").default(false).notNull(),
  leaveStartDate: date("leaveStartDate"),
  leaveEndDate: date("leaveEndDate"),
  passwordExpiresAt: timestamp("passwordExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// DEPARTAMENTOS
// ============================================================================

export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  responsibleUserId: int("responsibleUserId").references(() => users.id),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// COOPERADOS
// ============================================================================

export const cooperados: any = mysqlTable("cooperados", {
  id: int("id").autoincrement().primaryKey(),
  registrationNumber: bigint("registrationNumber", { mode: "number" }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  document: varchar("document", { length: 20 }).notNull(),
  birthDate: date("birthDate"),
  admissionDate: date("admissionDate"),
  associationDate: date("associationDate"),
  terminationDate: date("terminationDate"),
  position: varchar("position", { length: 255 }),
  status: mysqlEnum("status", ["ativo", "inativo", "desligado"]).notNull().default("ativo"),
  contractId: int("contractId").references(() => contracts.id),
  email: varchar("email", { length: 255 }),
  // Telefones
  whatsappNumber: varchar("whatsappNumber", { length: 20 }),
  secondaryPhone: varchar("secondaryPhone", { length: 20 }),
  // Endereço completo
  street: varchar("street", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 20 }),
  neighborhood: varchar("neighborhood", { length: 255 }),
  complement: varchar("complement", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cooperadoPhones = mysqlTable("cooperado_phones", {
  id: int("id").autoincrement().primaryKey(),
  cooperadoId: int("cooperadoId").notNull().references(() => cooperados.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 20 }).notNull(),
  phoneType: mysqlEnum("phoneType", ["principal", "secundario", "whatsapp"]).default("principal").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cooperadoBankData = mysqlTable("cooperado_bank_data", {
  id: int("id").autoincrement().primaryKey(),
  cooperadoId: int("cooperadoId").notNull().references(() => cooperados.id, { onDelete: "cascade" }),
  bankCode: varchar("bankCode", { length: 10 }).notNull(),
  bankName: varchar("bankName", { length: 255 }).notNull(),
  accountType: mysqlEnum("accountType", ["salario", "corrente", "poupanca"]).notNull(),
  agency: varchar("agency", { length: 10 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 20 }).notNull(),
  accountDigit: varchar("accountDigit", { length: 2 }),
  pixKey: varchar("pixKey", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// CONTRATOS
// ============================================================================

export const contracts: any = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  cooperadoId: int("cooperadoId").references(() => cooperados.id),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  validityDate: date("validityDate"),
  isSpecial: boolean("isSpecial").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// MOTIVOS DE ATENDIMENTO
// ============================================================================

export const attendanceReasons = mysqlTable("attendance_reasons", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").references((): any => attendanceReasons.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slaHours: int("slaHours").default(48).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// TICKETS
// ============================================================================

export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  protocol: varchar("protocol", { length: 20 }).notNull().unique(),
  cooperadoId: int("cooperadoId").references(() => cooperados.id),
  contractId: int("contractId").notNull().references(() => contracts.id),
  reasonId: int("reasonId").notNull().references(() => attendanceReasons.id),
  status: mysqlEnum("status", [
    "aberto",
    "em_andamento",
    "aguardando_cooperado",
    "aguardando_departamento",
    "resolvido",
    "fechado",
    "fechado_sem_interacao"
  ]).default("aberto").notNull(),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  description: text("description").notNull(),
  assignedTo: int("assignedTo").references(() => users.id),
  currentDepartmentId: int("currentDepartmentId").notNull().references(() => departments.id),
  slaDeadline: timestamp("slaDeadline"),
  lastInteractionAt: timestamp("lastInteractionAt").defaultNow(),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const ticketMessages = mysqlTable("ticket_messages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  senderType: mysqlEnum("senderType", ["cooperado", "atendente", "sistema"]).notNull(),
  senderId: int("senderId").references(() => users.id),
  message: text("message").notNull(),
  mediaUrl: text("mediaUrl"),
  whatsappMessageId: varchar("whatsappMessageId", { length: 255 }),
  isFromWhatsapp: boolean("isFromWhatsapp").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ticketHistory = mysqlTable("ticket_history", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const ticketTimeTracking = mysqlTable("ticket_time_tracking", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  departmentId: int("departmentId").notNull().references(() => departments.id),
  userId: int("userId").notNull().references(() => users.id),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  pausedAt: timestamp("pausedAt"),
  resumedAt: timestamp("resumedAt"),
  finishedAt: timestamp("finishedAt"),
  totalSeconds: int("totalSeconds").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// CSAT (PESQUISA DE SATISFAÇÃO)
// ============================================================================

export const csatSurveys = mysqlTable("csat_surveys", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  cooperadoId: int("cooperadoId").notNull().references(() => cooperados.id),
  rating: int("rating"),
  comment: text("comment"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  answeredAt: timestamp("answeredAt"),
  status: mysqlEnum("status", ["pending", "answered", "expired"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// WHATSAPP
// ============================================================================

export const whatsappSessions = mysqlTable("whatsapp_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionName: varchar("sessionName", { length: 100 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  qrCode: text("qrCode"),
  status: mysqlEnum("status", ["disconnected", "qr_ready", "connected"]).default("disconnected").notNull(),
  connectedAt: timestamp("connectedAt"),
  disconnectedAt: timestamp("disconnectedAt"),
  sessionData: json("sessionData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// MENSAGENS RÁPIDAS
// ============================================================================

export const quickMessages = mysqlTable("quick_messages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// TYPES
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type UserProfileType = typeof userProfileTypes.$inferSelect;
export type InsertUserProfileType = typeof userProfileTypes.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

export type Cooperado = typeof cooperados.$inferSelect;
export type InsertCooperado = typeof cooperados.$inferInsert;

export type CooperadoPhone = typeof cooperadoPhones.$inferSelect;
export type InsertCooperadoPhone = typeof cooperadoPhones.$inferInsert;

export type CooperadoBankData = typeof cooperadoBankData.$inferSelect;
export type InsertCooperadoBankData = typeof cooperadoBankData.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

export type AttendanceReason = typeof attendanceReasons.$inferSelect;
export type InsertAttendanceReason = typeof attendanceReasons.$inferInsert;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = Omit<typeof tickets.$inferInsert, 'protocol'> & { protocol?: string };

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

export type TicketHistory = typeof ticketHistory.$inferSelect;
export type InsertTicketHistory = typeof ticketHistory.$inferInsert;

export type TicketTimeTracking = typeof ticketTimeTracking.$inferSelect;
export type InsertTicketTimeTracking = typeof ticketTimeTracking.$inferInsert;

export type CsatSurvey = typeof csatSurveys.$inferSelect;
export type InsertCsatSurvey = typeof csatSurveys.$inferInsert;

export type WhatsappSession = typeof whatsappSessions.$inferSelect;
export type InsertWhatsappSession = typeof whatsappSessions.$inferInsert;

export type QuickMessage = typeof quickMessages.$inferSelect;
export type InsertQuickMessage = typeof quickMessages.$inferInsert;
