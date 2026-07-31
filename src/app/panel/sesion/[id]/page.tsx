import { notFound } from "next/navigation";

import { requireUser } from "@/auth";
import { obtenerDetalleSesion } from "@/server/session-service";
import { SesionDetalle } from "@/components/panel/sesion-detalle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Sesión de firmas — Panel | CARD ANKAWA INTL",
};

export default async function PaginaDetalleSesion({ params }: PageProps) {
  await requireUser();

  const { id } = await params;
  const sesion = await obtenerDetalleSesion(id);
  if (!sesion) {
    notFound();
  }

  const qrUrl =
    (process.env.APP_URL ?? "http://localhost:3000") + "/firmar/" + sesion.token;

  return <SesionDetalle inicial={sesion} qrUrl={qrUrl} />;
}
