import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-brand)] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-guinda-500 focus-visible:ring-offset-2 focus-visible:ring-offset-humo-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-guinda-500 text-white shadow-card hover:bg-guinda-600 active:bg-guinda-700",
        outline:
          "border border-ciruela-600 bg-transparent text-ciruela-700 hover:bg-ciruela-50 active:bg-ciruela-100",
        ghost:
          "bg-transparent text-ciruela-700 hover:bg-humo-200 active:bg-humo-300",
        destructive:
          "bg-terracota-500 text-white shadow-card hover:bg-terracota-600 active:bg-terracota-600",
        link: "bg-transparent text-guinda-500 underline-offset-4 hover:underline hover:text-guinda-600",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
