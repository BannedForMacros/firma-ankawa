# DIRECCIÓN DE REDISEÑO — Frontend CARD ANKAWA INTL

Documento normativo del rediseño. Complementa (y donde contradiga, REEMPLAZA)
la sección visual de CONTRACTS.md. **No cambiar props/APIs de componentes ni
lógica: este es un rediseño visual. No romper funcionalidad.**

## Diagnóstico (por qué se rediseña)

1. **El logo es 100 % píxeles oscuros sobre transparente** (verificado por
   análisis de alpha). Sobre las cabeceras `ciruela-700` actuales es INVISIBLE.
   → El logo SOLO puede ir sobre blanco o `humo-50/100`. PROHIBIDO colocarlo
   sobre ciruela, guinda o cualquier superficie oscura (tampoco "chips"
   blancos flotando sobre oscuro: se ve a parche).
2. **Secciones oscuras sueltas en página clara** (header ciruela, tarjeta
   ciruela de la landing, cabecera del póster): patrón de "copy-paste
   accident" según la auditoría de rediseño. → Compromiso TOTAL con página
   clara: la web institucional de Ankawa es blanca con bloques rojos y
   wordmark morado. El ciruela pasa a ser color de TEXTO y detalles, no de
   fondos grandes.
3. **Genérico**: tarjetas iguales, jerarquía plana, sin elemento memorable.

## Sistema (obligatorio)

### Superficies y color
- Fondo de página: `humo-50` (#fafafb). Superficies: blanco `#ffffff` con
  `shadow-card`. Bordes `humo-200`.
- **Un solo acento protagonista: guinda-500.** Ciruela-700/600 SOLO para
  tipografía, iconos y detalles finos. Terracota SOLO dentro del elemento
  firma (abajo) y micro-detalles (nunca botones ni textos largos).
- PROHIBIDO: fondos ciruela/oscuros en headers, cards o strips; gradientes;
  glassmorphism; más de un acento por vista.
- Headers (público, panel, firmante): BLANCOS, `border-b border-humo-200`,
  con una **barra guinda de 3px** como línea inferior de marca
  (border-b adicional o pseudo-elemento). Logo a todo color sobre el blanco.

### Elemento firma: "el ala poligonal"
Componente decorativo `src/components/brand/ala-poligonal.tsx`:
`AlaPoligonal({className?})` — franja horizontal de facetas triangulares
(SVG inline, `aria-hidden`, `preserveAspectRatio="none"`) que evoca el ala
del cóndor del logo: 8–12 triángulos irregulares contiguos alternando
`#A21C26`, `#8B1620`, `#3B1F3D`, `#C0603A`, `#590D14` con opacidades 0.9–1.
Altura por defecto `h-1.5` a `h-2`, ancho completo. USOS (los únicos):
borde superior del hero de la landing y del póster QR, y separador bajo el
header del flujo del firmante. Es la firma visual del sistema — no abusar.

### Tipografía
- Titulares grandes (hero, contador): `font-[family-name:var(--font-display)]`
  peso 700/800, `tracking-tight` (¡NEGATIVO en grande, no uppercase!),
  `text-balance`, ciruela-700.
- El estilo `titulo-institucional` (uppercase tracking 0.18em) queda SOLO
  para eyebrows/etiquetas pequeñas (`text-[11px]`–`text-xs`, guinda-600 o
  ciruela-400) y el wordmark. Nunca para titulares grandes.
- Números de datos (contador de firmas, códigos): `tabular-nums`. El código
  corto siempre en display con `tracking-[0.3em]`.
- Cuerpo: máx. ~65 caracteres de línea (`max-w-prose` o `max-w-[60ch]`).

### Componentes
- Botón primario: sólido guinda, hover guinda-600, `active:scale-[0.99]`,
  focus ring guinda. Secundario: outline `border-humo-300` texto ciruela-700
  hover borde ciruela-300 (NO borde morado grueso). Destructivo igual que
  primario (el cierre es una acción de marca aquí, no un "peligro" rojo
  genérico distinto del guinda: usar guinda-700 sólido).
- Cards: blanco, `rounded-[var(--radius-brand)]`, `shadow-card`,
  hover `shadow-card-hover` + `-translate-y-0.5` con transición 200ms solo
  si son clicables.
- Inputs: fondo blanco, borde humo-300, focus borde guinda-400 + ring
  guinda-100; altura cómoda táctil (min 44px) en el flujo del firmante.
- Transiciones: 150–200ms ease-out; entrada de elementos en vivo con
  fade + slide sutil; respetar `prefers-reduced-motion` (ya en globals).

## Direcciones por vista

- **Landing**: hero asimétrico (NO todo centrado): columna izquierda con
  eyebrow + titular display grande ("La firma del acta, sin papel" o
  similar, en sentence case) + párrafo corto; columna derecha: la TARJETA
  PROTAGONISTA de código de firma (blanca, ala-poligonal como borde
  superior, input gigante tracking amplio, botón primario full-width).
  El acceso del personal se degrada a una línea discreta bajo la tarjeta o
  en el header ("Acceso del personal →" texto ciruela con underline
  hover), NUNCA una tarjeta oscura. "Cómo funciona": 3 pasos en fila
  asimétrica (números display grandes guinda-100 de fondo, texto encima),
  sin 3 cards iguales con borde.
- **Login**: página humo-50, tarjeta blanca estrecha, logo COMPLETO arriba
  (sobre blanco), sin franjas oscuras.
- **Panel header**: blanco, logo + "Panel de audiencias" en ciruela,
  nav con subrayado guinda de 3px en el ítem activo (usePathname),
  usuario + rol en badge sutil, línea guinda inferior de marca.
- **Dashboard**: cabecera de página con SectionTitle a la izquierda y botón
  primario a la derecha; sesiones abiertas primero con cards ligeramente
  más prominentes; cerradas después más compactas/apagadas.
- **Detalle de sesión**: contador de firmas como HÉROE tipográfico
  (display 6xl-7xl tabular-nums guinda-600 con label pequeño), lista en
  vivo con entrada animada sutil; firma recién llegada con fondo
  guinda-50 que se desvanece.
- **QR póster**: TODO claro: cabecera blanca con logo grande centrado +
  nombre del centro en ciruela (titulo-institucional pequeño), ala-poligonal
  como separador, QR con marco guinda grueso, código gigante display,
  instrucciones; pie con ala-poligonal fino. Sin franjas ciruela.
  En modo proyección (fullscreen) el fondo puede ser humo-100 con el
  póster blanco centrado y sombra amplia — nunca fondo oscuro con logo.
- **Flujo firmante**: header compacto BLANCO con logo pequeño + nombre del
  centro en ciruela + ala-poligonal de 2px debajo; stepper claro con paso
  activo guinda; tarjetas de paso blancas; éxito con check en círculo
  guinda-50/guinda-600.
- **PDF**: sin cambios (logo ya va sobre blanco).

## Control de calidad
Tras rediseñar: `npx tsc --noEmit` y `npm run build` en verde; revisar que
NINGÚN uso de `AnkawaLogo`/`logo.png` quede sobre fondo distinto de
blanco/humo; copy intacto en español formal; accesibilidad intacta
(focus visible, labels, aria).
