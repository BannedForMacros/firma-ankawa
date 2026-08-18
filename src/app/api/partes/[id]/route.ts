import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/auth";
import { db } from "@/lib/db";
import { actualizarCatalogoItemSchema } from "@/lib/validation";
import { registrarAuditoria } from "@/lib/audit";
import { clientInfo } from "@/lib/request";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await req.json().catch(() => null);
  const parsed = actualizarCatalogoItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos." },
      { status: 400 },
    );
  }

  const existente = await db.parte.findUnique({ where: { id }, select: { id: true } });
  if (!existente) {
    return NextResponse.json({ error: "La parte no existe." }, { status: 404 });
  }

  try {
    const actualizado = await db.parte.update({
      where: { id },
      data: parsed.data,
      select: { id: true, nombre: true, orden: true, activo: true },
    });

    const { ip, userAgent } = clientInfo(req);
    await registrarAuditoria({
      actorType: "USER",
      userId: admin.id,
      action: "PARTE_UPDATED",
      entityType: "Parte",
      entityId: actualizado.id,
      ip,
      userAgent,
      metadata: { nombre: actualizado.nombre, cambios: parsed.data },
    });

    return NextResponse.json({ parte: actualizado }, { status: 200 });
  } catch (error) {
    const esDuplicado = error instanceof Error && error.message.includes("unique constraint");
    if (esDuplicado) {
      return NextResponse.json(
        { error: "Ya existe una parte con ese nombre." },
        { status: 409 },
      );
    }
    console.error("[api/partes/[id]] Error al actualizar parte:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la parte." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const existente = await db.parte.findUnique({
    where: { id },
    select: { id: true, nombre: true },
  });
  if (!existente) {
    return NextResponse.json({ error: "La parte no existe." }, { status: 404 });
  }

  try {
    await db.parte.delete({ where: { id } });

    const { ip, userAgent } = clientInfo(req);
    await registrarAuditoria({
      actorType: "USER",
      userId: admin.id,
      action: "PARTE_DELETED",
      entityType: "Parte",
      entityId: existente.id,
      ip,
      userAgent,
      metadata: { nombre: existente.nombre },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[api/partes/[id]] Error al eliminar parte:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la parte." },
      { status: 500 },
    );
  }
}
