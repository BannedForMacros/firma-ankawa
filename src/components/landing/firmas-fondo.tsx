import { cn } from "@/lib/utils";

/**
 * Una firma manuscrita de tres trazos que se escribe sola, en secuencia
 * realista: primero el nombre en cursiva, luego la rúbrica que lo subraya
 * y al final el punto. Los tres trazos comparten la misma duración de
 * ciclo para mantenerse sincronizados en cada repetición.
 */
interface FirmaAnimadaProps {
  className?: string;
  stroke: string;
  strokeWidth?: number;
  /** Inicio del ciclo de esta firma dentro del bucle global (ms). */
  retrasoMs: number;
  /** Duración total del ciclo (s). */
  duracionS?: number;
  opacidad?: number;
}

export function FirmaAnimada({
  className,
  stroke,
  strokeWidth = 3,
  retrasoMs,
  duracionS = 16,
  opacidad = 0.55,
}: FirmaAnimadaProps) {
  const comun = {
    fill: "none",
    stroke,
    strokeWidth,
    pathLength: 1,
  } as const;
  const estilo = (extraMs: number): React.CSSProperties =>
    ({
      "--trazo-dur": `${duracionS}s`,
      "--retraso": `${retrasoMs + extraMs}ms`,
      "--trazo-opacidad": opacidad,
    }) as React.CSSProperties;

  return (
    <svg aria-hidden="true" viewBox="0 0 420 150" fill="none" className={className}>
      {/* El nombre: cursiva continua con mayúscula inicial, crestas y lazos */}
      <path
        d="M 24 96
           C 32 44, 56 26, 60 58
           C 63 84, 46 104, 38 90
           C 31 76, 52 68, 72 76
           C 88 83, 92 66, 102 58
           C 114 49, 120 66, 116 82
           C 113 94, 124 92, 132 74
           C 140 55, 154 50, 158 66
           C 161 82, 150 94, 144 82
           C 139 71, 152 62, 166 68
           C 180 74, 186 58, 196 52
           C 207 46, 208 68, 214 74
           C 221 81, 228 60, 236 55
           C 245 50, 246 74, 256 76
           C 267 78, 272 60, 282 58
           C 293 56, 292 80, 304 78
           C 320 74, 338 62, 372 52"
        {...comun}
        className="trazo-firma"
        style={estilo(0)}
      />
      {/* La rúbrica: subrayado con retorno, arranca cuando el nombre termina */}
      <path
        d="M 34 116 C 130 100, 250 98, 372 90 C 300 96, 180 110, 76 116"
        {...comun}
        strokeWidth={strokeWidth * 0.85}
        className="trazo-firma"
        style={estilo(2600)}
      />
      {/* El punto final */}
      <path
        d="M 384 44 a 3 3 0 1 1 0.1 0"
        {...comun}
        strokeWidth={strokeWidth * 1.6}
        className="trazo-firma"
        style={estilo(3400)}
      />
    </svg>
  );
}

/**
 * Fondo animado de la portada y del modo proyección: firmas manuscritas
 * que se escriben solas sobre lavados radiales suaves, con facetas del
 * cóndor a la deriva. Decorativo (aria-hidden); prefers-reduced-motion
 * lo congela vía globals.css.
 */
export function FirmasFondo({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Lavados de color muy suaves para dar profundidad al blanco */}
      <div className="absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,#fbeaec_0%,transparent_70%)]" />
      <div className="absolute bottom-[-20%] left-[-8%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,#f2edf3_0%,transparent_70%)]" />

      {/* Firmas escribiéndose, a distintas escalas e inclinaciones */}
      <FirmaAnimada
        className="absolute left-[-4%] top-[8%] w-[30rem] -rotate-6"
        stroke="#e79aa1"
        retrasoMs={0}
        duracionS={17}
        opacidad={0.5}
      />
      <FirmaAnimada
        className="absolute right-[-6%] top-[30%] w-[36rem] rotate-3"
        stroke="#b8a3bc"
        retrasoMs={5200}
        duracionS={19}
        opacidad={0.45}
      />
      <FirmaAnimada
        className="absolute bottom-[6%] left-[14%] w-[26rem] -rotate-3"
        stroke="#d07a54"
        strokeWidth={2.5}
        retrasoMs={9600}
        duracionS={15}
        opacidad={0.4}
      />

      {/* Facetas poligonales a la deriva */}
      <svg
        className="anim-flotar absolute left-[8%] top-[18%] h-8 w-8"
        style={{ "--retraso": "300ms" } as React.CSSProperties}
        viewBox="0 0 32 32"
      >
        <polygon points="2,30 16,4 30,30" fill="#f5cdd1" />
      </svg>
      <svg
        className="anim-flotar absolute right-[12%] top-[24%] h-6 w-6"
        style={{ "--retraso": "1400ms" } as React.CSSProperties}
        viewBox="0 0 32 32"
      >
        <polygon points="2,2 30,10 12,30" fill="#ddd1df" />
      </svg>
      <svg
        className="anim-flotar absolute bottom-[22%] left-[16%] h-5 w-5"
        style={{ "--retraso": "2600ms" } as React.CSSProperties}
        viewBox="0 0 32 32"
      >
        <polygon points="4,28 16,2 28,24" fill="#d07a54" opacity={0.5} />
      </svg>
      <svg
        className="anim-flotar absolute bottom-[30%] right-[7%] h-9 w-9"
        style={{ "--retraso": "700ms" } as React.CSSProperties}
        viewBox="0 0 32 32"
      >
        <polygon points="2,26 18,4 30,28" fill="#fbeaec" />
      </svg>
    </div>
  );
}
