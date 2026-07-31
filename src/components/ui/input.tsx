import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-brand)] border border-humo-300 bg-white px-3 py-2 text-sm text-berenjena shadow-sm transition-colors duration-150 placeholder:text-ciruela-300 outline-none focus-visible:border-guinda-500 focus-visible:ring-2 focus-visible:ring-guinda-500/30 disabled:cursor-not-allowed disabled:bg-humo-100 disabled:opacity-60 aria-[invalid=true]:border-guinda-500 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ciruela-700",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
