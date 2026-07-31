import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StepperProps {
  steps: ReadonlyArray<{ id: string; label: string }>;
  current: number;
}

/**
 * Indicador de progreso por pasos (índice base 0).
 * Pasos completados en guinda; paso actual en ciruela.
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
                "before:absolute before:left-[calc(-50%+1.375rem)] before:right-[calc(50%+1.375rem)] before:top-4 before:h-px before:content-['']",
              index > 0 &&
                (completado || actual ? "before:bg-guinda-500" : "before:bg-humo-300")
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200",
                completado &&
                  "border-guinda-500 bg-guinda-500 text-white",
                actual &&
                  "border-ciruela-600 bg-ciruela-600 text-white",
                !completado &&
                  !actual &&
                  "border-humo-300 bg-white text-ciruela-300"
              )}
            >
              {completado ? (
                <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "px-1 text-xs font-medium leading-tight",
                completado && "text-guinda-600",
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
