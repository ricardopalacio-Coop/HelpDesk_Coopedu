import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não está definida");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // 1. Criar departamentos iniciais
    console.log("📁 Criando departamentos...");
    const departmentNames = [
      "Atendimento",
      "Ouvidoria",
      "RH",
      "Logística",
      "Financeiro",
      "Tesouraria",
      "Jurídico",
      "Presidência"
    ];

    for (const name of departmentNames) {
      await db.insert(schema.departments).values({
        name,
        description: `Departamento de ${name}`,
        isActive: true,
      });
    }
    console.log(`✅ ${departmentNames.length} departamentos criados`);

    // 2. Criar contrato especial "NÃO COOPERADO"
    console.log("📄 Criando contrato especial...");
    await db.insert(schema.contracts).values({
      name: "NÃO COOPERADO",
      status: "ativo",
      isSpecial: true,
    });
    console.log("✅ Contrato 'NÃO COOPERADO' criado");

    // 3. Criar motivos de atendimento hierárquicos
    console.log("📋 Criando motivos de atendimento...");
    
    // Motivos principais
    const financeiroResult = await db.insert(schema.attendanceReasons).values({
      name: "Financeiro",
      description: "Questões financeiras gerais",
      slaHours: 48,
      isActive: true,
    });
    const financeiroId = Number(financeiroResult[0].insertId);

    const tecnicoResult = await db.insert(schema.attendanceReasons).values({
      name: "Técnico",
      description: "Suporte técnico e problemas operacionais",
      slaHours: 24,
      isActive: true,
    });
    const tecnicoId = Number(tecnicoResult[0].insertId);

    const comercialResult = await db.insert(schema.attendanceReasons).values({
      name: "Comercial",
      description: "Questões comerciais e vendas",
      slaHours: 72,
      isActive: true,
    });
    const comercialId = Number(comercialResult[0].insertId);

    // Submotivos de Financeiro
    await db.insert(schema.attendanceReasons).values([
      {
        name: "Boleto",
        description: "Solicitação de boleto",
        parentId: financeiroId,
        slaHours: 24,
        isActive: true,
      },
      {
        name: "Segunda Via",
        description: "Solicitação de segunda via de documentos",
        parentId: financeiroId,
        slaHours: 24,
        isActive: true,
      },
      {
        name: "Pagamento",
        description: "Dúvidas sobre pagamentos",
        parentId: financeiroId,
        slaHours: 48,
        isActive: true,
      },
    ]);

    // Submotivos de Técnico
    await db.insert(schema.attendanceReasons).values([
      {
        name: "Problema no Sistema",
        description: "Erro ou falha no sistema",
        parentId: tecnicoId,
        slaHours: 12,
        isActive: true,
      },
      {
        name: "Dúvida de Uso",
        description: "Dúvida sobre como usar o sistema",
        parentId: tecnicoId,
        slaHours: 24,
        isActive: true,
      },
    ]);

    // Submotivos de Comercial
    await db.insert(schema.attendanceReasons).values([
      {
        name: "Novo Contrato",
        description: "Solicitação de novo contrato",
        parentId: comercialId,
        slaHours: 72,
        isActive: true,
      },
      {
        name: "Renovação",
        description: "Renovação de contrato existente",
        parentId: comercialId,
        slaHours: 48,
        isActive: true,
      },
    ]);

    console.log("✅ Motivos de atendimento criados com hierarquia");

    console.log("🎉 Seed concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante seed:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
