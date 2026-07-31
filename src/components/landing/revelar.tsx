"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevelarProps {
  children: React.ReactNode;
  /** Retraso del revelado en ms (escalonar elementos hermanos). */
  retrasoMs?: number;
  className?: string;
}

/**
 * Revela su contenido (fade + slide) la primera vez que entra al viewport.
 * Con prefers-reduced-motion el contenido es visible desde el inicio (CSS).
 */
export function Revelar({ children, retrasoMs = 0, className }: RevelarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas[0]?.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("revelar", visible && "revelado", className)}
      style={{ "--retraso": `${retrasoMs}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
