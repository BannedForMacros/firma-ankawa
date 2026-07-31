import { cn } from "@/lib/utils";

interface AlaPoligonalProps {
  className?: string;
}

/**
 * Firma visual del sistema: franja horizontal de facetas triangulares
 * que evoca el ala del cóndor del logo institucional. Decorativa
 * (aria-hidden); la altura se controla desde fuera vía className.
 */
export function AlaPoligonal({ className }: AlaPoligonalProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className={cn("block h-1.5 w-full", className)}
    >
      <polygon points="0,24 0,0 140,24" fill="#A21C26" />
      <polygon points="0,0 140,24 210,0" fill="#590D14" fillOpacity="0.95" />
      <polygon points="140,24 210,0 360,24" fill="#8B1620" />
      <polygon points="210,0 360,24 430,0" fill="#3B1F3D" fillOpacity="0.9" />
      <polygon points="360,24 430,0 560,24" fill="#A21C26" fillOpacity="0.95" />
      <polygon points="430,0 560,24 680,0" fill="#C0603A" fillOpacity="0.95" />
      <polygon points="560,24 680,0 790,24" fill="#8B1620" />
      <polygon points="680,0 790,24 920,0" fill="#590D14" fillOpacity="0.9" />
      <polygon points="790,24 920,0 1030,24" fill="#A21C26" />
      <polygon points="920,0 1030,24 1120,0" fill="#3B1F3D" fillOpacity="0.95" />
      <polygon points="1030,24 1120,0 1200,24" fill="#8B1620" fillOpacity="0.95" />
      <polygon points="1120,0 1200,24 1200,0" fill="#C0603A" />
    </svg>
  );
}
