import { cn } from "@/lib/utils";

interface TrazoProps {
  d: string;
  stroke: string;
  strokeWidth: number;
  duracionS: number;
  retrasoMs: number;
  opacidad: number;
}

function Trazo({ d, stroke, strokeWidth, duracionS, retrasoMs, opacidad }: TrazoProps) {
  return (
    <path
      d={d}
      pathLength={1}
      stroke={stroke}
      strokeWidth={strokeWidth}
      className="trazo-firma"
      style={
        {
          "--trazo-dur": `${duracionS}s`,
          "--retraso": `${retrasoMs}ms`,
          "--trazo-opacidad": opacidad,
        } as React.CSSProperties
      }
    />
  );
}

/**
 * Fondo animado de la portada: rúbricas que se trazan solas, en bucle
 * escalonado, sobre lavados radiales muy suaves. Decorativo (aria-hidden);
 * prefers-reduced-motion lo congela vía globals.css.
 */
export function FirmasFondo({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Lavados de color muy suaves para dar profundidad al blanco */}
      <div className="absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,#fbeaec_0%,transparent_70%)]" />
      <div className="absolute bottom-[-20%] left-[-8%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,#f2edf3_0%,transparent_70%)]" />

      {/* Rúbricas dibujándose */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <Trazo
          d="M-60 640 C 140 470, 260 780, 440 610 S 720 380, 880 570 S 1200 720, 1520 470"
          stroke="#e79aa1"
          strokeWidth={3}
          duracionS={16}
          retrasoMs={0}
          opacidad={0.55}
        />
        <Trazo
          d="M-80 250 C 120 120, 320 340, 500 210 C 640 110, 760 300, 950 190 S 1260 60, 1540 210"
          stroke="#b8a3bc"
          strokeWidth={2.5}
          duracionS={19}
          retrasoMs={2400}
          opacidad={0.5}
        />
        <Trazo
          d="M180 800 C 340 730, 420 860, 560 790 C 650 748, 610 700, 556 726 C 500 754, 640 810, 820 770 S 1120 690, 1320 760"
          stroke="#d07a54"
          strokeWidth={2.5}
          duracionS={14}
          retrasoMs={5200}
          opacidad={0.45}
        />
        <Trazo
          d="M-40 430 C 220 380, 300 520, 520 430 C 700 355, 660 300, 600 330 C 540 362, 700 430, 940 400 S 1300 320, 1560 380"
          stroke="#f5cdd1"
          strokeWidth={4}
          duracionS={22}
          retrasoMs={8000}
          opacidad={0.6}
        />
      </svg>

      {/* Facetas poligonales a la deriva */}
      <svg
        className="anim-flotar absolute left-[8%] top-[18%] h-8 w-8"
        style={{ "--retraso": "300ms" } as React.CSSProperties}
        viewBox="0 0 32 32"
      >
        <polygon points="2,30 16,4 30,30" fill="#f5cdd1" />
      </svg>
      <svg
        className="anim-flotar absolute right-[12%] top-[30%] h-6 w-6"
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
