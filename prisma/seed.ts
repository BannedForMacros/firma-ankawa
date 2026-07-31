import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const admin = await prisma.user.upsert({
    where: { email: "admin@ankawa.local" },
    update: {},
    create: {
      email: "admin@ankawa.local",
      nombre: "Administrador CARD",
      passwordHash: hashSync("Ankawa2026!", 12),
      role: "ADMIN",
    },
  });

  const operador = await prisma.user.upsert({
    where: { email: "secretaria@ankawa.local" },
    update: {},
    create: {
      email: "secretaria@ankawa.local",
      nombre: "Secretaría Arbitral",
      passwordHash: hashSync("Ankawa2026!", 12),
      role: "OPERADOR",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorType: "SYSTEM",
      action: "SEED_EXECUTED",
      entityType: "User",
      entityId: admin.id,
      metadata: { usuarios: [admin.email, operador.email] },
    },
  });

  console.log("Seed completado:");
  console.log("  ADMIN    → admin@ankawa.local / Ankawa2026!");
  console.log("  OPERADOR → secretaria@ankawa.local / Ankawa2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
