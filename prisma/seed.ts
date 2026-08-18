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

  const cargosSeed = [
    "Representante legal del Centro",
    "Representante común",
    "Funcionario público",
    "Adjudicador único",
    "Adjudicador de parte",
    "Presidente de la JPRD",
    "Alcalde",
    "Gerente municipal",
    "Director de administración",
    "Secretario(a) arbitral",
    "Árbitro",
    "Árbitro único",
    "Abogado(a)",
    "Perito",
    "Testigo",
  ];

  const partesSeed = [
    "Demandante",
    "Demandado",
    "Tribunal arbitral",
    "Secretaría arbitral",
    "Centro arbitral",
    "Comunidad",
    "Municipalidad",
  ];

  for (const [indice, nombre] of cargosSeed.entries()) {
    await prisma.cargo.upsert({
      where: { nombre },
      update: {},
      create: { nombre, orden: indice },
    });
  }

  for (const [indice, nombre] of partesSeed.entries()) {
    await prisma.parte.upsert({
      where: { nombre },
      update: {},
      create: { nombre, orden: indice },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorType: "SYSTEM",
      action: "SEED_EXECUTED",
      entityType: "User",
      entityId: admin.id,
      metadata: { usuarios: [admin.email, operador.email], cargos: cargosSeed.length, partes: partesSeed.length },
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
