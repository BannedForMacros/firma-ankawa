import Image from "next/image";
import { cn } from "@/lib/utils";

interface FacetaProps {
  className: string;
  points: string;
  fill: string;
  retrasoMs: number;
  dx: number;
  dy: number;
  rot: number;
  opacidad?: number;
}

/** Faceta triangular que vuela a su posición y luego flota. */
function Faceta({ className, points, fill, retrasoMs, dx, dy, rot, opacidad = 1 }: FacetaProps) {
  return (
    <div
      className={cn("anim-faceta absolute", className)}
      style={
        {
          "--retraso": `${retrasoMs}ms`,
          "--faceta-dx": `${dx}px`,
          "--faceta-dy": `${dy}px`,
          "--faceta-rot": `${rot}deg`,
          "--faceta-opacidad": opacidad,
        } as React.CSSProperties
      }
    >
      <div className="anim-flotar" style={{ "--retraso": `${retrasoMs + 900}ms` } as React.CSSProperties}>
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <polygon points={points} fill={fill} />
        </svg>
      </div>
    </div>
  );
}

/**
 * El cóndor protagonista: logo gigante que entra desenfocado y se asienta,
 * mientras facetas poligonales (los fragmentos de sus alas) se ensamblan
 * a su alrededor y quedan flotando.
 */
export function HeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-fit", className)}>
      {/* Halo suave detrás del logo */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#ffffff_35%,rgba(251,234,236,0.9)_65%,transparent_100%)]"
      />

      {/* Facetas ensamblándose (decorativas) */}
      <div aria-hidden="true">
        <Faceta className="-left-14 top-2 h-9 w-9 sm:-left-20 sm:h-11 sm:w-11" points="4,36 20,4 36,34" fill="#a21c26" retrasoMs={650} dx={-70} dy={40} rot={-24} opacidad={0.9} />
        <Faceta className="-left-8 -top-6 h-6 w-6 sm:-left-10" points="4,4 36,12 16,36" fill="#c0603a" retrasoMs={800} dx={-40} dy={-50} rot={18} opacidad={0.85} />
        <Faceta className="-right-14 top-6 h-8 w-8 sm:-right-20 sm:h-10 sm:w-10" points="4,32 22,4 36,36" fill="#3b1f3d" retrasoMs={720} dx={70} dy={30} rot={26} opacidad={0.9} />
        <Faceta className="-right-8 -top-5 h-5 w-5 sm:-right-11" points="4,8 36,4 20,36" fill="#8b1620" retrasoMs={900} dx={50} dy={-40} rot={-16} opacidad={0.8} />
        <Faceta className="-bottom-4 -left-6 h-5 w-5" points="4,36 18,4 36,30" fill="#590d14" retrasoMs={980} dx={-30} dy={50} rot={12} opacidad={0.7} />
        <Faceta className="-bottom-3 -right-5 h-6 w-6" points="6,32 20,6 34,34" fill="#d07a54" retrasoMs={1060} dx={40} dy={46} rot={-20} opacidad={0.75} />
      </div>

      {/* El logo, grande y protagonista, siempre sobre claro */}
      <Image
        src="/brand/logo.png"
        alt="Ankawa Internacional — cóndor poligonal"
        width={724}
        height={512}
        priority
        className="anim-logo-entra relative h-32 w-auto drop-shadow-[0_18px_35px_rgba(30,18,32,0.18)] sm:h-48 lg:h-72"
      />
    </div>
  );
}
