import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/auth";
import { db } from "@/lib/db";
import { catalogoItemSchema } from "@/lib/validation";
import { registrarAuditoria } from "@/lib/audit";
import { clientInfo } from "@/lib/request";
import type { CatalogoItemDto } from "@/lib/types";

export const runtime = "nodejs";

function toDto(item: { id: string; nombre: string; orden: number; activo: boolean }): CatalogoItemDto {
  return {
    id: item.id,
    nombre: item.nombre,
    orden: item.orden,
    activo: item.activo,
  };
}

export async function GET(): Promise<NextResponse> {
  const partes = await db.parte.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true, orden: true, activo: true },
  });

  const dto: CatalogoItemDto[] = partes.map(toDto);
  return NextResponse.json({ partes: dto }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = catalogoItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Los datos no son válidos." },
      { status: 400 },
    );
  }

  const maxOrden = await db.parte.aggregate({ _max: { orden: true } });
  const orden = parsed.data.orden ?? (maxOrden._max.orden ?? 0) + 1;

  try {
    const creado = await db.parte.create({
      data: { nombre: parsed.data.nombre, orden },
      select: { id: true, nombre: true, orden: true, activo: true },
    });

    const { ip, userAgent } = clientInfo(req);
    await registrarAuditoria({
      actorType: "USER",
      userId: admin.id,
      action: "PARTE_CREATED",
      entityType: "Parte",
      entityId: creado.id,
      ip,
      userAgent,
      metadata: { nombre: creado.nombre },
    });

    const dto: CatalogoItemDto = toDto(creado);
    return NextResponse.json({ parte: dto }, { status: 201 });
  } catch (error) {
    const esDuplicado = error instanceof Error && error.message.includes("unique constraint");
    if (esDuplicado) {
      return NextResponse.json(
        { error: "Ya existe una parte con ese nombre." },
        { status: 409 },
      );
    }
    console.error("[api/partes] Error al crear parte:", error);
    return NextResponse.json(
      { error: "No se pudo crear la parte." },
      { status: 500 },
    );
  }
}
