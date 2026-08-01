import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoFondoProps {
  className?: string;
  /**
   * Clases del contenedor del logo: controlan tamaño y posición del cóndor.
   * REGLA INSTITUCIONAL: el águila se muestra SIEMPRE completa y derecha —
   * nunca rotada, invertida ni recortada por los bordes. Use posiciones
   * centradas o contenidas (p. ej. "left-1/2 top-16 w-[56rem] -translate-x-1/2").
   */
  posicion?: string;
  /** Intensidad de la marca de agua (0–1). */
  opacidad?: number;
}

/**
 * El cóndor de Ankawa como marca de agua monumental de fondo.
 * Flota con solemnidad (solo desplazamiento vertical sutil, sin rotación)
 * y se muestra íntegro, como corresponde a un emblema institucional.
 * Decorativo (aria-hidden).
 */
export function LogoFondo({
  className,
  posicion = "left-1/2 top-16 w-[56rem] -translate-x-1/2",
  opacidad = 0.06,
}: LogoFondoProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div className={cn("anim-flotar absolute", posicion)}>
        <Image
          src="/brand/logo.png"
          alt=""
          width={724}
          height={512}
          className="h-auto w-full"
          style={{ opacity: opacidad }}
        />
      </div>
    </div>
  );
}
