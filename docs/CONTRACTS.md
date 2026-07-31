# CONTRATOS DEL PROYECTO — Sistema de Firmas CARD ANKAWA INTL

Documento normativo para todos los agentes. **Cumplir exactamente estas APIs.**
Cada agente SOLO crea/edita los archivos que le fueron asignados. Nunca tocar
archivos del núcleo (`src/lib/*`, `src/server/*`, `src/auth.ts`, `prisma/*`,
`src/app/globals.css`, `src/app/layout.tsx`) ni los de otro agente.

## Reglas globales

- TypeScript estricto, **prohibido `any`** y `@ts-ignore`.
- Todo el copy de UI en **español formal jurídico** (trato de "usted").
- Copy: verbos activos y precisos ("Cerrar sesión de firmas", no "Enviar").
  Los errores explican qué pasó y cómo corregirlo, sin disculpas vagas.
- Mobile-first en el flujo del firmante; desktop-first aceptable en el panel.
- Accesibilidad: focus visible, labels asociados, roles ARIA en componentes.
- Imports con alias `@/` (p. ej. `@/lib/utils`, `@/components/ui/button`).
- Íconos: `lucide-react` con `strokeWidth={1.5}` (línea fina, precisa).
- Antes de codificar, leer: `src/app/globals.css` (tokens), `src/lib/types.ts`
  (DTOs), `src/lib/validation.ts` (schemas Zod).

## Lenguaje visual Ankawa (obligatorio)

- Fondo `bg-humo-100`, tarjetas blancas `shadow-card rounded-[var(--radius-brand)]`.
- Acento primario guinda `guinda-500` (#A21C26); navegación/titulares ciruela
  `ciruela-600/700`; texto `berenjena`; toques `terracota-500` con moderación.
- Titulares de sección: clase `titulo-institucional` (mayúsculas, tracking
  0.18em, fuente display Archivo) precedidos de la clase `barra-guinda`.
- Cuerpo: fuente Public Sans (ya aplicada en `body`).
- Botón primario sólido guinda; secundario outline ciruela. Esquinas
  levemente redondeadas (`rounded-[var(--radius-brand)]`), nunca pills
  gigantes ni glassmorphism.
- Nada de gradientes morados de IA, ni tarjetas genéricas: sobriedad
  institucional, generoso espacio en blanco, jerarquía tipográfica clara.

## Roles y permisos en UI (crítico)

- `ADMIN` y `OPERADOR` comparten el layout del panel, pero **los elementos
  exclusivos de ADMIN no se renderizan para OPERADOR** (p. ej. el ítem de
  navegación "Usuarios" y todo /panel/usuarios).
- La UI oculta; el backend **además** valida con `requireAdmin()` /
  `requireUser()` de `@/auth`. Nunca confiar solo en la UI.
- FIRMANTE no tiene cuenta: solo ve `/firmar/[token]` y la landing.

## Núcleo ya implementado (usar, no reimplementar)

- `@/lib/db` → `db` (PrismaClient singleton).
- `@/auth` → `auth()`, `signIn`, `signOut`, `requireUser()`, `requireAdmin()`.
- `@/lib/types` → DTOs: `SesionResumenDto`, `SesionDetalleDto`,
  `FirmaResumenDto`, `SesionPublicaDto`, `IdentidadDto`, `RolUsuario`, etc.
- `@/lib/validation` → `loginSchema`, `crearSesionSchema`,
  `consultaIdentidadSchema`, `guardarFirmaSchema`, `crearUsuarioSchema`,
  `dniSchema`, `rucSchema`.
- `@/lib/decolecta` → `consultarIdentidad(docType, docNumber)`.
- `@/lib/audit` → `registrarAuditoria(entry)`.
- `@/lib/storage` → `guardarImagenFirma`, `leerImagenFirma`.
- `@/lib/rate-limit` → `rateLimit(key, {limit, windowMs})`, `cleanupExpiredBuckets()`.
- `@/lib/request` → `clientInfo(req)` → `{ip, userAgent}`.
- `@/lib/dates` → `leyendaConformidad(date)`, `fechaCorta(date)`, `fechaHoraLegal(date)`.
- `@/lib/crypto` → `sha256Hex`, `generateSessionToken`, `generateShortCode`.
- `@/server/session-service` → `crearSesion`, `listarSesiones`,
  `obtenerDetalleSesion`, `cerrarSesion`, `obtenerSesionPublicaPorToken`,
  `resolverCodigoCorto`, `obtenerSesionParaPlanilla`, `ReglaDeNegocioError`.
- `@/server/signer-service` → `guardarFirma(sessionToken, input, evidencia)`.
- `@/lib/utils` → `cn(...)`.

## Contratos de componentes UI (`src/components/ui/`)

Estilo shadcn/ui (CVA + cn + forwardRef). Exportar exactamente:

- `button.tsx`: `Button`, `buttonVariants`. Variants: `primary` (sólido
  guinda, hover guinda-600), `outline` (borde ciruela-600, texto ciruela-700),
  `ghost`, `destructive`, `link`. Sizes: `sm | md | lg | icon`.
- `card.tsx`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`,
  `CardContent`, `CardFooter`.
- `input.tsx`: `Input`. — `label.tsx`: `Label` (radix). — `textarea.tsx`:
  `Textarea`. — `select.tsx`: `Select` (select nativo estilizado).
- `badge.tsx`: `Badge` variants: `guinda | ciruela | success | warning | neutral | outline`.
- `tabs.tsx`: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (@radix-ui/react-tabs).
- `dialog.tsx`: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`,
  `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`
  (@radix-ui/react-dialog).
- `alert.tsx`: `Alert`, `AlertTitle`, `AlertDescription` variants:
  `info | success | warning | error`.
- `spinner.tsx`: `Spinner` props `{className?: string}`.
- `stepper.tsx`: `Stepper` props `{steps: ReadonlyArray<{id: string; label: string}>; current: number}`
  (índice base 0; pasos completados en guinda, actual en ciruela).

## Contratos de componentes de marca (`src/components/brand/`)

- `logo.tsx`: `AnkawaLogo({className?})` — `next/image` de `/brand/logo.png`
  con alt "Ankawa Internacional". `AnkawaMarca({className?})` — logo + bloque
  de texto "CENTRO DE ARBITRAJE Y RESOLUCIÓN DE DISPUTAS / CARD – ANKAWA INTL".
- `section-title.tsx`: `SectionTitle({eyebrow?: string; title: string; className?})`
  — barra-guinda + h2 `titulo-institucional`.
- `session-status-pill.tsx`: `SessionStatusPill({status: EstadoSesion; className?})`
  — ABIERTA (verde esmeralda suave) / CERRADA (neutro berenjena).
- `verified-badge.tsx`: `VerifiedBadge({verified: boolean; source?: "RENIEC" | "SUNAT"})`
  — "Verificado RENIEC/SUNAT" (success) o "No verificado" (warning).
- `site-header.tsx`: `SiteHeader()` — header público: fondo ciruela-700,
  logo + wordmark, enlace "Iniciar sesión". `SiteFooter()` — pie institucional
  (sede Cusco, Perú, © año).
- `qr-poster.tsx`: `QrPoster({sesion: {code: string; asunto: string; expediente: string; fechaAudiencia: string; sede: string}; url: string})`
  — client component. QR generado con `qrcode` (`toDataURL`, margen 2,
  ancho ≥ 512, color oscuro `#2E1A30`). Plantilla de marca: cabecera con logo
  y nombre del centro, asunto/expediente, QR centrado con marco guinda grueso,
  código corto en tipografía display gigante con tracking, instrucción
  "Escanee el código para firmar el acta" + "o ingrese el código en
  {APP_URL}". Acciones (ocultas al imprimir con `no-print`): "Descargar PNG"
  (html-to-image `toPng` del nodo del póster), "Imprimir / PDF"
  (`window.print()`), "Proyectar" (fullscreen del póster vía
  `requestFullscreen`).
- `signature-pad.tsx`: `SignaturePadCanvas({onChange: (dataUrl: string | null) => void; className?})`
  — client. `signature_pad` sobre canvas con devicePixelRatio correcto,
  fondo transparente, tinta `#1e1220`. Botones "Deshacer" y "Limpiar".
  Emite PNG transparente recortado (trim de bordes vacíos vía canvas).
- `upload-signature.tsx`: `UploadSignature({onChange: (dataUrl: string | null) => void; className?})`
  — client. Acepta JPG/PNG ≤ 5 MB. Procesa en canvas: slider "Umbral de
  fondo" (0–255, default 200) — píxeles con luminancia ≥ umbral se vuelven
  transparentes; el resto se oscurece a tinta `#1e1220` preservando alpha
  suave. Recorta márgenes vacíos. Previsualización sobre clase
  `fondo-ajedrez`. Emite PNG transparente (max 1200px de ancho).

## Contratos de rutas API

Errores SIEMPRE `{ error: string }` (español) con status apropiado.
En cada handler público: `rateLimit` por IP + `cleanupExpiredBuckets()`.

- `POST /api/identidad` (público, 10 req/min por IP)
  Body: `{docType: "DNI"|"RUC", docNumber: string, sessionToken: string}`.
  Valida con `consultaIdentidadSchema`; exige sesión OPEN
  (`obtenerSesionPublicaPorToken`); llama `consultarIdentidad`; audita
  `IDENTITY_LOOKUP` (actorType SIGNER, entityType Identity, metadata con
  docType/docNumber/resultado). 200 → `{identidad: IdentidadDto}`.
  Si Decolecta falla → status del ResultadoIdentidad con `{error}`.
- `GET /api/firmar/[token]` (público) → `{sesion: SesionPublicaDto}` | 404.
- `POST /api/firmar/[token]` (público, 5 req/min por IP)
  Body: `guardarFirmaSchema`. El flag `verified` del cliente SE IGNORA:
  el servidor consulta `db.identityCache` por (docType, docNumber); si hay
  entrada, `verified=true` y `verificationRaw` = esa respuesta; si no,
  `verified=false`. Llama `guardarFirma`. 201 → `{ok: true, sha256: string}`.
  `ReglaDeNegocioError` → su `status` y mensaje (423 = sesión cerrada).
- `POST /api/codigo` (público, 15 req/min) Body `{code: string}` →
  `{token, status}` | 404 `{error: "Código no encontrado..."}`.
- `GET /api/sesiones` (requireUser) → `{sesiones: SesionResumenDto[]}`.
- `POST /api/sesiones` (requireUser) Body `crearSesionSchema` → 201
  `{sesion: SesionResumenDto}`.
- `GET /api/sesiones/[id]` (requireUser) → `{sesion: SesionDetalleDto}` | 404.
  (la usa el polling de 4 s del panel).
- `POST /api/sesiones/[id]/cerrar` (requireUser) → `{ok: true}`;
  `ReglaDeNegocioError` → su status.
- `GET /api/firmas/[...path]` (requireUser) → PNG binario vía
  `leerImagenFirma(path.join("/"))`, `Content-Type: image/png`,
  `Cache-Control: private, no-store`. 404 si no existe.
- `GET /api/planilla/[id]` (requireUser) → PDF binario
  (`Content-Disposition: attachment; filename="planilla-{code}.pdf"`),
  audita `PDF_GENERATED`.
- `GET/POST /api/usuarios` (requireAdmin) → listar/crear usuarios internos
  (`crearUsuarioSchema`, hash bcrypt cost 12, audita `USER_CREATED`).

En route handlers con `params`, Next 15 los entrega como Promise:
`{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params;`.

## Polling en vivo (panel)

Hook `useSesionEnVivo(id: string, activo: boolean)` en
`src/components/panel/use-sesion-en-vivo.ts`: fetch a `/api/sesiones/[id]`
cada 4000 ms mientras `activo` (sesión OPEN y pestaña visible), devuelve
`{sesion: SesionDetalleDto | null, error: string | null, refetch: () => void}`.

## Planilla PDF (`src/lib/pdf/planilla.tsx` + ruta)

`@react-pdf/renderer`, A4 vertical, márgenes 56pt. Encabezado: logo
(`public/brand/logo.png` leído con `fs` y pasado como data URI) +
"Centro de Arbitraje y Resolución de Disputas CARD - ANKAWA INTL" +
asunto y expediente. Línea: `leyendaConformidad(fechaAudiencia)`.
Tabla 2 columnas con bordes negros 1pt colapsados: cada celda alto fijo
(~150pt): zona superior con la firma centrada (PNG transparente desde
storage vía `leerImagenFirma`, altura máx. uniforme ~70pt, objectFit
contain); línea divisoria; debajo en negrita y MAYÚSCULAS, centrado:
ENTIDAD (displayName), CARGO (cargo — si RUC añadir "REP.: {repNombre}"),
NOMBRE (repNombre si RUC, displayName si DNI) y la parte que representa.
Si el número de firmantes es impar, última celda vacía CON bordes.
Pie de página: "Sesión {code} — Generado el {fechaHoraLegal}" y por cada
firma una línea 6pt: `{displayName}: SHA-256 {hash}`. Fuente Helvetica
(la incorporada de react-pdf; documentado como decisión).
