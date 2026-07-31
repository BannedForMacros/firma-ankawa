import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/** Select nativo estilizado con la estética institucional Ankawa. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("relative w-full", className)}>
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-[var(--radius-brand)] border border-humo-300 bg-white px-3 pr-9 py-2 text-sm text-berenjena shadow-sm transition-colors duration-150 outline-none focus-visible:border-guinda-500 focus-visible:ring-2 focus-visible:ring-guinda-500/30 disabled:cursor-not-allowed disabled:bg-humo-100 disabled:opacity-60 aria-[invalid=true]:border-guinda-500"
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.5}
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ciruela-400"
      />
    </div>
  )
);
Select.displayName = "Select";

export { Select };
