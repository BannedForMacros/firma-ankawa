import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StepperProps {
  steps: ReadonlyArray<{ id: string; label: string }>;
  current: number;
}

/**
 * Indicador de progreso por pasos (índice base 0).
 * Paso actual en guinda sólido; completados en guinda-100 con check.
 */
function Stepper({ steps, current }: StepperProps) {
  return (
    <ol
      aria-label="Progreso del proceso de firma"
      className="flex w-full items-start"
    >
      {steps.map((step, index) => {
        const completado = index < current;
        const actual = index === current;
        return (
          <li
            key={step.id}
            aria-current={actual ? "step" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1.5 text-center",
              index > 0 &&
                "before:absolute before:left-[calc(-50%+1.375rem)] before:right-[calc(50%+1.375rem)] before:top-4 before:h-px before:bg-humo-200 before:content-['']"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
                completado && "bg-guinda-100 text-guinda-600",
                actual && "bg-guinda-500 text-white",
                !completado &&
                  !actual &&
                  "border border-humo-200 bg-white text-ciruela-300"
              )}
            >
              {completado ? (
                <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "px-1 text-xs font-medium leading-tight",
                completado && "text-ciruela-400",
                actual && "text-ciruela-700",
                !completado && !actual && "text-ciruela-300"
              )}
            >
              {step.label}
              {completado && <span className="sr-only"> (completado)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export { Stepper };
