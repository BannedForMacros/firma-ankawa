# Registro de cambios

## 2026-08-18 — CRUD configurable de cargos y partes

### Resumen
Se implementó un catálogo administrable de **cargos** y **partes** para las audiencias. Los firmantes ahora pueden elegir opciones predefinidas o escribir libremente mediante la opción "Otro".

### Cambios técnicos

#### Base de datos
- Se agregaron los modelos `Cargo` y `Parte` en `prisma/schema.prisma`:
  - `id`, `nombre` (único), `orden`, `activo`, `createdAt`, `updatedAt`.
- Se generó y aplicó la migración `20260818162822_add_cargos_partes`.
- Se actualizó `prisma/seed.ts` para crear los cargos y partes iniciales solicitados.

#### APIs
- Nuevos endpoints bajo `src/app/api/`:
  - `GET /api/cargos` — lista cargos activos (público).
  - `POST /api/cargos` — crea cargo (solo ADMIN).
  - `PATCH /api/cargos/[id]` — edita cargo (solo ADMIN).
  - `DELETE /api/cargos/[id]` — elimina cargo (solo ADMIN).
  - `GET /api/partes` — lista partes activas (público).
  - `POST /api/partes` — crea parte (solo ADMIN).
  - `PATCH /api/partes/[id]` — edita parte (solo ADMIN).
  - `DELETE /api/partes/[id]` — elimina parte (solo ADMIN).
- Se agregaron las acciones de auditoría `CARGO_CREATED`, `CARGO_UPDATED`, `CARGO_DELETED`, `PARTE_CREATED`, `PARTE_UPDATED`, `PARTE_DELETED` en `src/lib/audit.ts`.
- Se agregaron los esquemas `catalogoItemSchema` y `actualizarCatalogoItemSchema` en `src/lib/validation.ts`.
- Se agregó el tipo `CatalogoItemDto` en `src/lib/types.ts`.

#### Panel de administración
- Nueva página `src/app/panel/configuracion/cargos-partes/page.tsx` (solo ADMIN).
- Nuevos componentes bajo `src/components/panel/cargos-partes/`:
  - `configuracion-client.tsx` — estado y mutaciones.
  - `crud-lista.tsx` — tabla con crear, editar, reordenar y eliminar.
  - `form-item.tsx` — formulario inline de creación/edición.
- Se agregó el enlace **Configuración** en `src/components/panel/panel-header.tsx` visible solo para administradores.

#### Formulario de firma pública
- Se modificó `src/components/firmar/paso-identificacion.tsx` para:
  - Cargar dinámicamente `/api/cargos` y `/api/partes`.
  - Mostrar las opciones como chips seleccionables.
  - Incluir un chip **"Otro cargo" / "Otra parte"** que enfoca el campo de texto libre.
  - Mantener las opciones frecuentes originales como fallback si el catálogo no está disponible.

### Cargos y partes precargados

#### Cargos
1. Representante legal del Centro
2. Representante común
3. Funcionario público
4. Adjudicador único
5. Adjudicador de parte
6. Presidente de la JPRD
7. Alcalde
8. Gerente municipal
9. Director de administración
10. Secretario(a) arbitral
11. Árbitro
12. Árbitro único
13. Abogado(a)
14. Perito
15. Testigo

#### Partes
1. Demandante
2. Demandado
3. Tribunal arbitral
4. Secretaría arbitral
5. Centro arbitral
6. Comunidad
7. Municipalidad

### Cómo acceder
- Panel: http://localhost:3000/login
- Configuración de cargos y partes: http://localhost:3000/panel/configuracion/cargos-partes

### Verificación
- `npx tsc --noEmit` sin errores.
- `npm run build` generó el proyecto correctamente.
- Se probaron las APIs de creación, edición y eliminación.
- Se registraron firmas de prueba usando opciones del catálogo y valores libres.
