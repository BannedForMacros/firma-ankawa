const FRASES = [
  "CENTRO DE ARBITRAJE Y RESOLUCIÓN DE DISPUTAS",
  "CARD – ANKAWA INTL",
  "CUSCO – PERÚ",
  "FIRMA VERIFICADA DE ACTAS",
] as const;

function Tira() {
  return (
    <div className="flex shrink-0 items-center">
      {FRASES.map((frase, indice) => (
        <span key={frase} className="flex items-center">
          <span
            className={
              indice % 2 === 0
                ? "texto-contorno font-display text-4xl font-extrabold tracking-tight whitespace-nowrap sm:text-5xl"
                : "font-display text-4xl font-extrabold tracking-tight whitespace-nowrap text-guinda-500 sm:text-5xl"
            }
          >
            {frase}
          </span>
          <svg viewBox="0 0 24 24" className="mx-6 h-4 w-4 shrink-0 sm:mx-8">
            <polygon points="12,2 22,12 12,22 2,12" fill="#c0603a" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/**
 * Marquesina institucional de la portada: el nombre del centro desfilando
 * en texto de contorno con acentos guinda. Decorativa (aria-hidden);
 * prefers-reduced-motion la detiene.
 */
export function Marquesina() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-humo-200 bg-white py-5"
    >
      <div
        className="anim-marquesina flex w-max"
        style={{ "--marquesina-dur": "36s" } as React.CSSProperties}
      >
        <Tira />
        <Tira />
      </div>
    </div>
  );
}
