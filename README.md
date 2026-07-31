# Sistema de Firmas de Actas de Audiencia — CARD ANKAWA INTL

Aplicación institucional del **Centro de Arbitraje y Resolución de Disputas
CARD – ANKAWA INTL** (Cusco, Perú) para la recolección de firmas digitales de
los asistentes a audiencias arbitrales. El personal del centro crea una sesión
de firmas por audiencia y proyecta un póster con código QR; cada asistente
escanea el código desde su teléfono, acredita su identidad (DNI ante RENIEC o
RUC ante SUNAT mediante la API de Decolecta), dibuja o carga su firma y
manifiesta su conformidad. Al cierre de la sesión, el sistema genera la
planilla de firmas en PDF con la evidencia criptográfica de cada rúbrica, lista
para anexarse al acta de la audiencia.

## Stack

- [Next.js 15](https://nextjs.org) (App Router, React Server Components)
- TypeScript en modo estricto
- Tailwind CSS v4 (tokens de marca definidos en `src/app/globals.css`)
- PostgreSQL 17 + [Prisma ORM](https://www.prisma.io)
- Auth.js (NextAuth v5) con credenciales y bcrypt
- Zod (validación en cliente y servidor)
- `@react-pdf/renderer` (planilla PDF), `qrcode` (póster), `signature_pad` (firma manuscrita)
- API [Decolecta](https://decolecta.com) para verificación RENIEC / SUNAT

## Requisitos

- Node.js 20 o superior
- PostgreSQL 17 ejecutándose en local

## Puesta en marcha

1. Instale las dependencias:

   ```bash
   npm install
   ```

2. Copie la plantilla de variables de entorno y complete **cada** variable:

   ```bash
   cp .env.example .env
   ```

   | Variable | Descripción |
   | --- | --- |
   | `DATABASE_URL` | Cadena de conexión a PostgreSQL. Formato: `postgresql://usuario:password@localhost:5432/ankawa_firmas` |
   | `AUTH_SECRET` | Secreto de sesión de Auth.js. Genérelo con `openssl rand -base64 32` |
   | `AUTH_TRUST_HOST` | Mantener en `true` para desarrollo local |
   | `APP_URL` | URL pública de la aplicación (p. ej. `http://localhost:3000`). Se usa para construir el enlace del QR `/firmar/{token}` |
   | `DECOLECTA_API` | Token Bearer de [decolecta.com](https://decolecta.com) para consultar RENIEC/SUNAT. Solo se usa en el servidor. Si queda vacío, el sistema permite el registro manual marcado como «No verificado» |

3. Cree la base de datos:

   ```bash
   createdb ankawa_firmas
   ```

4. Aplique las migraciones:

   ```bash
   npx prisma migrate dev
   ```

5. Cargue los datos iniciales (usuarios de prueba):

   ```bash
   npx prisma db seed
   ```

   Credenciales sembradas:

   | Rol | Correo | Contraseña |
   | --- | --- | --- |
   | Administrador | `admin@ankawa.local` | `Ankawa2026!` |
   | Operadora | `secretaria@ankawa.local` | `Ankawa2026!` |

6. Inicie el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Mapa de carpetas

```
src/
├── app/
│   ├── api/               # Rutas API (identidad, firmar, sesiones, usuarios,
│   │                      #   planilla PDF, imágenes de firmas, código corto)
│   ├── panel/             # Panel interno (requiere cuenta): sesiones y usuarios
│   ├── layout.tsx         # Layout raíz: fuentes Archivo + Public Sans, metadatos
│   ├── page.tsx           # Landing pública con ingreso de código corto
│   └── globals.css        # Tokens de marca Ankawa (guinda, ciruela, humo…)
├── auth.ts                # Auth.js: auth(), signIn, signOut, requireUser, requireAdmin
├── components/
│   ├── ui/                # Sistema de componentes (Button, Dialog, Badge, Alert…)
│   ├── brand/             # Marca: logo, títulos, póster QR, pad de firma, header
│   ├── panel/             # Componentes del panel interno
│   └── firmar/            # Flujo público del firmante (mobile-first)
├── lib/
│   ├── db.ts              # PrismaClient singleton
│   ├── validation.ts      # Schemas Zod compartidos cliente/servidor
│   ├── types.ts           # DTOs (sin dependencias de Prisma)
│   ├── decolecta.ts       # Cliente RENIEC/SUNAT (token solo server-side)
│   ├── storage.ts         # Almacenamiento de imágenes de firma (/storage/firmas)
│   ├── audit.ts           # Registro de auditoría (AuditLog)
│   ├── crypto.ts          # SHA-256, token de sesión, código corto
│   ├── rate-limit.ts      # Límite de solicitudes por IP en endpoints públicos
│   ├── dates.ts           # Fechas legales en es-PE (leyenda de conformidad)
│   └── pdf/               # Plantilla de la planilla PDF (@react-pdf/renderer)
├── server/
│   ├── session-service.ts # Reglas de negocio de sesiones de firmas
│   └── signer-service.ts  # Registro de firmas con evidencia
prisma/
├── schema.prisma          # Modelo de datos (User, SignSession, Signature, AuditLog…)
├── migrations/            # Migraciones versionadas
└── seed.ts                # Datos iniciales (usuarios de prueba)
storage/
└── firmas/                # PNG de firmas: {sessionId}/{archivo}.png (fuera de public/)
```

## Roles y permisos

| Rol | Acceso |
| --- | --- |
| **ADMIN** | Todo el panel: sesiones de firmas **y** gestión de usuarios internos (`/panel/usuarios`) |
| **OPERADOR** | Panel de sesiones: crear, proyectar, supervisar y cerrar sesiones. No ve el módulo de usuarios |
| **FIRMANTE** | Sin cuenta. Solo accede a la landing pública y a `/firmar/{token}` |

La interfaz oculta las opciones exclusivas de ADMIN al OPERADOR y, además, el
backend valida cada operación con `requireAdmin()` / `requireUser()`; nunca se
confía únicamente en la interfaz.

## Flujo operativo

1. **Crear sesión** — El personal registra la audiencia (asunto, expediente,
   fecha, sede, modalidad). El sistema genera un token impredecible y un código
   corto legible.
2. **Proyectar el QR** — Desde el detalle de la sesión se abre el póster
   institucional con el QR y el código corto, apto para proyección en sala,
   impresión o descarga PNG.
3. **Firmar** — Cada asistente escanea el QR (o ingresa el código corto en la
   landing), acredita su identidad con DNI o RUC (verificación RENIEC/SUNAT),
   dibuja o carga su firma y acepta la declaración de conformidad.
4. **Supervisar y cerrar** — El panel muestra las firmas entrantes en vivo
   (sondeo cada 4 s). Concluida la audiencia, el personal cierra la sesión: a
   partir de ese momento no se admite ninguna firma adicional.
5. **Planilla** — El sistema genera la planilla de firmas en PDF con la
   leyenda de conformidad, las firmas en tabla de dos columnas y el resumen
   criptográfico (SHA-256) de cada imagen, lista para anexarse al acta.

## Decisiones técnicas

- **`@react-pdf/renderer` en lugar de Puppeteer** — La planilla se compone de
  manera declarativa y se genera en el propio proceso de Node, sin necesidad de
  instalar ni orquestar un navegador headless (pesado, frágil en despliegues y
  lento en frío). La tipografía Helvetica incorporada de react-pdf evita
  además la descarga de fuentes externas.
- **Sondeo (polling) de 4 s en lugar de SSE/WebSockets** — El panel consulta
  `GET /api/sesiones/[id]` cada 4 segundos solo mientras la sesión está
  abierta y la pestaña visible. Para decenas de firmantes por audiencia, el
  sondeo es más que suficiente, sobrevive a proxies y despliegues serverless, y
  elimina la complejidad de conexiones persistentes.
- **Almacenamiento local de firmas** — Los PNG se guardan en
  `/storage/firmas/{sessionId}/{archivo}.png` (fuera de `public/`; se sirven
  solo a usuarios autenticados vía `GET /api/firmas/...`). Para migrar a S3
  basta con reemplazar las funciones `guardarImagenFirma` / `leerImagenFirma`
  de `src/lib/storage.ts` por llamadas `PutObject` / `GetObject`, conservando
  la misma clave `{sessionId}/{archivo}.png`; el resto del sistema no cambia.

## Trazabilidad y evidencia

- **AuditLog** — Cada acción relevante (consulta de identidad, firma
  registrada, sesión cerrada, PDF generado, usuario creado) queda registrada
  con actor, entidad, IP y user-agent.
- **SHA-256** — De cada imagen de firma se calcula y persiste su hash SHA-256,
  que se imprime también al pie de la planilla PDF.
- **Timestamps de servidor** — Las marcas de tiempo provienen siempre del
  servidor, nunca del dispositivo del firmante.
- **Sesiones cerradas inmutables** — Una sesión CERRADA rechaza toda firma
  nueva (HTTP 423) y no puede reabrirse.
- **Token impredecible** — El enlace `/firmar/{token}` usa un token generado
  criptográficamente; no es adivinable ni enumerable.

## Seguridad

- **Rate limiting por IP** en todos los endpoints públicos (identidad, firma,
  código corto), con limpieza periódica de contadores.
- **Cabeceras y respuestas prudentes** — Las imágenes de firma se sirven con
  `Cache-Control: private, no-store` y solo a usuarios autenticados; los
  errores de API siguen el formato uniforme `{ "error": string }` en español.
- **Zod en todos los endpoints** — Cada cuerpo de solicitud se valida con los
  schemas de `src/lib/validation.ts` tanto en el cliente como en el servidor.
- **Token de Decolecta solo server-side** — `DECOLECTA_API` jamás se expone al
  navegador; toda consulta a RENIEC/SUNAT pasa por `POST /api/identidad`.
- **Contraseñas con bcrypt (coste 12)** y verificación de rol en el servidor
  para cada operación del panel.

## Marca

Para reemplazar el logotipo institucional, sustituya el archivo
`public/brand/logo.png`. Esa única imagen se usa en el encabezado del sitio,
en el póster QR de proyección y en la planilla PDF.
