import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  className?: string;
}

/**
 * Titular de sección con la gramática visual institucional:
 * barra guinda + eyebrow pequeño en mayúsculas + titular display
 * en sentence case con tracking apretado.
 */
export function SectionTitle({ eyebrow, title, className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <span aria-hidden="true" className="barra-guinda" />
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ciruela-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-balance text-ciruela-700 sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
