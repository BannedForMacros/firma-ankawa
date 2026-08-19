/**
 * DTOs compartidos entre server y client. No importar Prisma aquí:
 * estos tipos viajan a componentes cliente.
 */

export type RolUsuario = "ADMIN" | "OPERADOR";
export type EstadoSesion = "OPEN" | "CLOSED";
export type TipoDocumento = "DNI" | "RUC";
export type MetodoFirma = "DRAWN" | "UPLOADED";
export type ModalidadAudiencia = "PRESENCIAL" | "VIRTUAL" | "MIXTA";

export interface SesionResumenDto {
  id: string;
  code: string;
  asunto: string;
  expediente: string;
  fechaAudiencia: string; // ISO
  sede: string;
  modalidad: ModalidadAudiencia;
  status: EstadoSesion;
  totalFirmas: number;
  createdAt: string; // ISO
  closedAt: string | null; // ISO
}

export interface FirmaResumenDto {
  id: string;
  docType: TipoDocumento;
  docNumberMasked: string;
  displayName: string;
  entidad: string | null;
  repNombre: string | null;
  cargo: string;
  verified: boolean;
  signMethod: MetodoFirma;
  signedAt: string; // ISO
  /** URL autenticada de la miniatura: /api/firmas/{sessionId}/{fileName} */
  imageUrl: string;
  imageSha256: string;
}

export interface DocumentoSesionDto {
  id: string;
  sessionId: string;
  originalName: string;
  originalPath: string;
  signedPath: string | null;
  orden: number;
  createdAt: string; // ISO
}

export interface SesionDetalleDto extends SesionResumenDto {
  token: string;
  closedAt: string | null;
  closedByNombre: string | null;
  createdByNombre: string;
  documentos: DocumentoSesionDto[];
  firmas: FirmaResumenDto[];
}

/** Lo que ve el firmante público (sin datos internos). */
export interface SesionPublicaDto {
  code: string;
  asunto: string;
  expediente: string;
  fechaAudiencia: string; // ISO
  sede: string;
  modalidad: ModalidadAudiencia;
  status: EstadoSesion;
  documentos: DocumentoSesionDto[];
}

export interface IdentidadDniDto {
  tipo: "DNI";
  numero: string;
  nombreCompleto: string;
  verificado: true;
}

export interface IdentidadRucDto {
  tipo: "RUC";
  numero: string;
  razonSocial: string;
  estado: string;
  condicion: string;
  direccion: string | null;
  verificado: true;
  /** true si estado=ACTIVO y condicion=HABIDO */
  habilitado: boolean;
}

export type IdentidadDto = IdentidadDniDto | IdentidadRucDto;

export interface CatalogoItemDto {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

/** Envoltura estándar de error de las rutas API. */
export interface ApiError {
  error: string;
}
