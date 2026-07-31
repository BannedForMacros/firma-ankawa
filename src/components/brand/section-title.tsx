import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  className?: string;
}

/**
 * Titular de sección con la gramática visual institucional:
 * barra guinda + titular en mayúsculas con tracking amplio.
 */
export function SectionTitle({ eyebrow, title, className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <span aria-hidden="true" className="barra-guinda" />
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ciruela-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="titulo-institucional text-xl text-ciruela-700 sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}
