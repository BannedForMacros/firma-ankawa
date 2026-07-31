import Image from "next/image";
import { cn } from "@/lib/utils";

interface AnkawaLogoProps {
  className?: string;
}

/** Isotipo institucional de Ankawa Internacional. */
export function AnkawaLogo({ className }: AnkawaLogoProps) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Ankawa Internacional"
      width={96}
      height={96}
      priority
      className={cn("h-12 w-12 object-contain", className)}
    />
  );
}

interface AnkawaMarcaProps {
  className?: string;
}

/** Marca completa: isotipo + denominación institucional del centro. */
export function AnkawaMarca({ className }: AnkawaMarcaProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <AnkawaLogo />
      <span className="flex flex-col leading-tight">
        <span className="titulo-institucional text-[0.65rem] tracking-[0.18em]">
          Centro de Arbitraje y Resolución de Disputas
        </span>
        <span className="titulo-institucional text-sm tracking-[0.22em]">
          CARD – ANKAWA INTL
        </span>
      </span>
    </span>
  );
}
