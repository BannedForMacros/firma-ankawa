const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const TIME_ZONE = "America/Lima";

function partsInLima(date: Date): { day: number; month: number; year: number } {
  const parts = new Intl.DateTimeFormat("es-PE", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: string): number =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { day: get("day"), month: get("month"), year: get("year") };
}

/** "Firmado en señal de conformidad a los N días del mes de X de YYYY." */
export function leyendaConformidad(date: Date): string {
  const { day, month, year } = partsInLima(date);
  const mes = MESES[month - 1] ?? "";
  const dias = day === 1 ? "al 1 día" : `a los ${day} días`;
  return `Firmado en señal de conformidad ${dias} del mes de ${mes} de ${year}.`;
}

/** Fecha corta peruana: 31/07/2026 */
export function fechaCorta(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Fecha y hora completas para auditoría y pies de página. */
export function fechaHoraLegal(date: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}
