import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full rounded-[var(--radius-brand)] border border-humo-300 bg-white px-3 py-2 text-sm text-berenjena shadow-sm transition-colors duration-150 placeholder:text-ciruela-300 outline-none focus-visible:border-guinda-500 focus-visible:ring-2 focus-visible:ring-guinda-500/30 disabled:cursor-not-allowed disabled:bg-humo-100 disabled:opacity-60 aria-[invalid=true]:border-guinda-500",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
