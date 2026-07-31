import { NextResponse, type NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { requireAdmin } from "@/auth";
import { db } from "@/lib/db";
import { crearUsuarioSchema } from "@/lib/validation";
import { registrarAuditoria } from "@/lib/audit";
import { clientInfo } from "@/lib/request";
import type { RolUsuario } from "@/lib/types";

export const runtime = "nodejs";

interface UsuarioDto {
  id: string;
  email: string;
  nombre: string;
  role: RolUsuario;
  activo: boolean;
  createdAt: string; // ISO
}

export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const usuarios = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      nombre: true,
      role: true,
      activo: true,
      createdAt: true,
    },
  });

  const dto: UsuarioDto[] = usuarios.map((u) => ({
    id: u.id,
    email: u.email,
    nombre: u.nombre,
    role: u.role,
    activo: u.activo,
    createdAt: u.createdAt.toISOString(),
  }));

  return NextResponse.json({ usuarios: dto }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = crearUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Los datos del usuario no son válidos." },
      { status: 400 },
    );
  }

  const existente = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existente) {
    return NextResponse.json(
      { error: "Ya existe un usuario registrado con ese correo electrónico." },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const creado = await db.user.create({
    data: {
      email: parsed.data.email,
      nombre: parsed.data.nombre,
      passwordHash,
      role: parsed.data.role,
    },
    select: {
      id: true,
      email: true,
      nombre: true,
      role: true,
      activo: true,
      createdAt: true,
    },
  });

  const { ip, userAgent } = clientInfo(req);
  await registrarAuditoria({
    actorType: "USER",
    userId: admin.id,
    action: "USER_CREATED",
    entityType: "User",
    entityId: creado.id,
    ip,
    userAgent,
    metadata: { email: creado.email, role: creado.role },
  });

  const usuario: UsuarioDto = {
    id: creado.id,
    email: creado.email,
    nombre: creado.nombre,
    role: creado.role,
    activo: creado.activo,
    createdAt: creado.createdAt.toISOString(),
  };

  return NextResponse.json({ usuario }, { status: 201 });
}
