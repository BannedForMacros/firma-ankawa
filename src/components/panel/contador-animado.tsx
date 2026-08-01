"use client";

import { useEffect, useRef, useState } from "react";

interface ContadorAnimadoProps {
  valor: number;
  duracionMs?: number;
  className?: string;
}

/**
 * Número que cuenta desde cero hasta su valor real cuando entra en
 * pantalla, con desaceleración suave. Con prefers-reduced-motion
 * muestra el valor final de inmediato.
 */
export function ContadorAnimado({
  valor,
  duracionMs = 1100,
  className,
}: ContadorAnimadoProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [mostrado, setMostrado] = useState(0);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (
      valor === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setMostrado(valor);
      return;
    }

    let raf = 0;
    let inicio: number | null = null;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas[0]?.isIntersecting) return;
        observador.disconnect();
        const paso = (t: number): void => {
          if (inicio === null) inicio = t;
          const progreso = Math.min((t - inicio) / duracionMs, 1);
          const suavizado = 1 - Math.pow(1 - progreso, 3);
          setMostrado(Math.round(suavizado * valor));
          if (progreso < 1) raf = requestAnimationFrame(paso);
        };
        raf = requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    observador.observe(nodo);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor, duracionMs]);

  return (
    <span ref={ref} className={className}>
      {mostrado}
    </span>
  );
}
