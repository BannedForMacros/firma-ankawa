import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SpinnerProps {
  className?: string;
}

function Spinner({ className }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <Loader2
        strokeWidth={1.5}
        aria-hidden="true"
        className={cn("h-5 w-5 animate-spin text-guinda-500", className)}
      />
      <span className="sr-only">Cargando…</span>
    </span>
  );
}

export { Spinner };
