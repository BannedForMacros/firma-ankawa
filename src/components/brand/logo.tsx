import Image from "next/image";
import { cn } from "@/lib/utils";

interface AnkawaLogoProps {
  className?: string;
}

/**
 * Isotipo institucional de Ankawa Internacional. El PNG es 100 % oscuro
 * sobre transparente: SOLO debe colocarse sobre blanco o humo-50/100.
 */
export function AnkawaLogo({ className }: AnkawaLogoProps) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Ankawa Internacional"
      width={96}
      height={96}
      priority
      className={cn("h-14 w-auto object-contain", className)}
    />
  );
}

interface AnkawaMarcaProps {
  className?: string;
}

/**
 * Marca completa: isotipo + denominación institucional del centro.
 * El bloque de texto siempre va en ciruela sobre superficie clara.
 */
export function AnkawaMarca({ className }: AnkawaMarcaProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <AnkawaLogo />
      <span className="flex flex-col leading-tight">
        <span className="titulo-institucional text-[0.65rem] tracking-[0.18em] text-ciruela-400">
          Centro de Arbitraje y Resolución de Disputas
        </span>
        <span className="titulo-institucional text-sm tracking-[0.22em] text-ciruela-700">
          CARD – ANKAWA INTL
        </span>
      </span>
    </span>
  );
}
