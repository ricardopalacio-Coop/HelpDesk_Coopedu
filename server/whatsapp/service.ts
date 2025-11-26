import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import type { Message } from "whatsapp-web.js";
import QRCode from "qrcode";
import * as db from "../db";

let whatsappClient: any = null;
let currentQRCode: string | null = null;
let connectionStatus: "disconnected" | "qr_ready" | "connected" = "disconnected";

/**
 * Inicializar cliente WhatsApp
 */
export async function initializeWhatsApp() {
  if (whatsappClient) {
    console.log("[WhatsApp] Cliente já inicializado");
    return;
  }

  console.log("[WhatsApp] Inicializando cliente...");

  try {

  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      clientId: "helpdesk-coopedu",
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    },
  });

  // Evento: QR Code gerado
  whatsappClient.on("qr", async (qr: string) => {
    console.log("[WhatsApp] QR Code gerado");
    connectionStatus = "qr_ready";
    
    try {
      // Gerar QR Code como string base64
      currentQRCode = await QRCode.toDataURL(qr);
      
      // Salvar no banco de dados
      const dbClient = await db.getDb();
      if (dbClient) {
        await dbClient.insert(db.whatsappSessions).values({
          sessionName: "helpdesk-coopedu",
          qrCode: currentQRCode,
          status: "qr_ready",
        }).onDuplicateKeyUpdate({
          set: {
            qrCode: currentQRCode,
            status: "qr_ready",
            updatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("[WhatsApp] Erro ao gerar QR Code:", error);
    }
  });

  // Evento: Cliente pronto
  whatsappClient.on("ready", async () => {
    console.log("[WhatsApp] Cliente conectado e pronto!");
    connectionStatus = "connected";
    currentQRCode = null;
    
    const info = whatsappClient?.info;
    const phoneNumber = info?.wid?.user || "desconhecido";
    
    // Atualizar status no banco
    const dbClient = await db.getDb();
    if (dbClient) {
      await dbClient.insert(db.whatsappSessions).values({
        sessionName: "helpdesk-coopedu",
        phoneNumber,
        status: "connected",
        connectedAt: new Date(),
        qrCode: null,
      }).onDuplicateKeyUpdate({
        set: {
          phoneNumber,
          status: "connected",
          connectedAt: new Date(),
          qrCode: null,
          updatedAt: new Date(),
        },
      });
    }
  });

  // Evento: Cliente desconectado
  whatsappClient.on("disconnected", async (reason: string) => {
    console.log("[WhatsApp] Cliente desconectado:", reason);
    connectionStatus = "disconnected";
    currentQRCode = null;
    
    // Atualizar status no banco
    const dbClient = await db.getDb();
    if (dbClient) {
      await dbClient.insert(db.whatsappSessions).values({
        sessionName: "helpdesk-coopedu",
        status: "disconnected",
        disconnectedAt: new Date(),
      }).onDuplicateKeyUpdate({
        set: {
          status: "disconnected",
          disconnectedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  });

  // Evento: Mensagem recebida
  whatsappClient.on("message", async (message: Message) => {
    try {
      await handleIncomingMessage(message);
    } catch (error) {
      console.error("[WhatsApp] Erro ao processar mensagem:", error);
    }
  });

    // Inicializar cliente
    await whatsappClient.initialize();
  } catch (error) {
    console.error("[WhatsApp] Erro ao inicializar cliente:", error);
    connectionStatus = "disconnected";
    whatsappClient = null;
    throw new Error("Erro ao inicializar WhatsApp. Verifique se o Chromium está instalado corretamente.");
  }
}

/**
 * Processar mensagem recebida
 */
async function handleIncomingMessage(message: Message) {
  // Ignorar mensagens de grupos e status
  if (message.from.includes("@g.us") || message.from.includes("status@broadcast")) {
    return;
  }

  const phone = message.from.replace("@c.us", "");
  const messageText = message.body;
  
  console.log(`[WhatsApp] Mensagem recebida de ${phone}: ${messageText}`);

  // Buscar cooperado pelo telefone
  let cooperado = await db.getCooperadoByPhone(phone);
  
  // Se não encontrou, buscar ticket aberto para este número
  let ticket = null;
  
  if (cooperado) {
    // Buscar ticket aberto ou em andamento do cooperado
    const tickets = await db.getAllTickets({
      cooperadoId: cooperado.id,
    });
    
    ticket = tickets.find(t => 
      t.status === "aberto" || 
      t.status === "em_andamento" || 
      t.status === "aguardando_cooperado"
    );
  }
  
  // Se não tem ticket aberto, criar novo
  if (!ticket) {
    // Se não tem cooperado, usar contrato especial
    const contractId = cooperado?.contractId || (await db.getSpecialContract())?.id;
    
    if (!contractId) {
      console.error("[WhatsApp] Contrato especial não encontrado");
      return;
    }
    
    // Buscar primeiro departamento (Atendimento)
    const departments = await db.getAllDepartments();
    const atendimentoDept = departments.find(d => d.name === "Atendimento");
    
    if (!atendimentoDept) {
      console.error("[WhatsApp] Departamento de Atendimento não encontrado");
      return;
    }
    
    // Buscar motivo padrão (primeiro ativo)
    const reasons = await db.getAllAttendanceReasons();
    const defaultReason = reasons[0];
    
    if (!defaultReason) {
      console.error("[WhatsApp] Nenhum motivo de atendimento encontrado");
      return;
    }
    
    // Criar ticket
    const result = await db.createTicket({
      cooperadoId: cooperado?.id || null,
      contractId,
      reasonId: defaultReason.id,
      description: `Atendimento via WhatsApp: ${messageText.substring(0, 100)}`,
      priority: "media",
      currentDepartmentId: atendimentoDept.id,
      status: "aberto",
    });
    
    ticket = await db.getTicketById(Number(result.id));
    
    // Enviar mensagem de boas-vindas
    await sendWhatsAppMessage(
      phone,
      `Olá! Seu atendimento foi registrado com o protocolo *${result.protocol}*. Em breve um de nossos atendentes irá responder.`
    );
  }
  
  if (!ticket) {
    console.error("[WhatsApp] Erro ao criar/encontrar ticket");
    return;
  }
  
  // Salvar mensagem no ticket
  await db.createTicketMessage({
    ticketId: ticket.id,
    senderType: "cooperado",
    senderId: null,
    message: messageText,
    whatsappMessageId: message.id._serialized,
    isFromWhatsapp: true,
  });
  
  // Atualizar lastInteractionAt do ticket
  await db.updateTicketInteraction(ticket.id);
}

/**
 * Enviar mensagem via WhatsApp
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!whatsappClient || connectionStatus !== "connected") {
    console.error("[WhatsApp] Cliente não conectado");
    return false;
  }

  try {
    const chatId = `${phone}@c.us`;
    await whatsappClient.sendMessage(chatId, message);
    console.log(`[WhatsApp] Mensagem enviada para ${phone}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Erro ao enviar mensagem:", error);
    return false;
  }
}

/**
 * Obter QR Code atual
 */
export function getCurrentQRCode(): string | null {
  return currentQRCode;
}

/**
 * Obter status da conexão
 */
export function getConnectionStatus(): string {
  return connectionStatus;
}

/**
 * Desconectar cliente
 */
export async function disconnectWhatsApp() {
  if (whatsappClient) {
    await whatsappClient.destroy();
    whatsappClient = null;
    connectionStatus = "disconnected";
    currentQRCode = null;
  }
}
