import Link from "next/link";
import { Lock } from "lucide-react";
import type { SesionPublicaDto } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SesionCerradaProps {
  sesion: SesionPublicaDto;
}

/**
 * Pantalla que se muestra cuando la sesión de firmas ya fue cerrada por la
 * secretaría arbitral: el acta ya no admite nuevas firmas.
 */
export function SesionCerrada({ sesion }: SesionCerradaProps) {
  return (
    <section
      aria-labelledby="titulo-sesion-cerrada"
      className="flex flex-col items-center rounded-[var(--radius-brand)] bg-white px-6 py-10 text-center shadow-card sm:px-10"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-humo-200">
        <Lock className="h-8 w-8 text-ciruela-600" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2
        id="titulo-sesion-cerrada"
        className="titulo-institucional mt-5 text-base text-ciruela-700"
      >
        Sesión de firmas cerrada
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-berenjena">
        La sesión de firmas <span className="font-semibold">{sesion.code}</span> del expediente{" "}
        <span className="font-semibold">{sesion.expediente}</span> fue cerrada y el acta ya no
        admite nuevas firmas.
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ciruela-400">
        Si usted considera que aún debía firmar, comuníquese con la secretaría arbitral del
        centro para que evalúe su caso.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-6")}>
        Volver a la página principal
      </Link>
    </section>
  );
}
