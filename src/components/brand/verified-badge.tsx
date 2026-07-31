import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  verified: boolean;
  source?: "RENIEC" | "SUNAT";
  className?: string;
}

/**
 * Insignia de verificación de identidad ante RENIEC (DNI) o SUNAT (RUC).
 */
export function VerifiedBadge({ verified, source, className }: VerifiedBadgeProps) {
  if (verified) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[var(--radius-brand)] bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200",
          className
        )}
      >
        <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
        {source ? `Verificado ${source}` : "Verificado"}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-brand)] bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200",
        className
      )}
    >
      <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
      No verificado
    </span>
  );
}
