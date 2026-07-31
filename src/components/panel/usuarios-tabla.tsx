import { Badge } from "@/components/ui/badge";
import type { RolUsuario } from "@/lib/types";

export interface UsuarioListadoDto {
  id: string;
  email: string;
  nombre: string;
  role: RolUsuario;
  activo: boolean;
  createdAt: string; // ISO
}

interface UsuariosTablaProps {
  usuarios: UsuarioListadoDto[];
}

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(new Date(iso));
}

/**
 * Tabla institucional de usuarios internos del centro (solo ADMIN).
 */
export function UsuariosTabla({ usuarios }: UsuariosTablaProps) {
  if (usuarios.length === 0) {
    return (
      <div className="rounded-[var(--radius-brand)] bg-white p-8 text-center shadow-card">
        <p className="text-sm text-ciruela-400">
          Aún no hay usuarios registrados. Cree el primer usuario interno con el
          botón &laquo;Nuevo usuario&raquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-brand)] bg-white shadow-card">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">
          Listado de usuarios internos del sistema de firmas
        </caption>
        <thead>
          <tr className="bg-humo-200">
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ciruela-700"
            >
              Nombre
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ciruela-700"
            >
              Correo electrónico
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ciruela-700"
            >
              Rol
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ciruela-700"
            >
              Estado
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ciruela-700"
            >
              Fecha de creación
            </th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr
              key={usuario.id}
              className="border-b border-humo-200 last:border-b-0"
            >
              <td className="px-4 py-3 font-medium text-berenjena">
                {usuario.nombre}
              </td>
              <td className="px-4 py-3 text-ciruela-400">{usuario.email}</td>
              <td className="px-4 py-3">
                <Badge variant={usuario.role === "ADMIN" ? "guinda" : "ciruela"}>
                  {usuario.role === "ADMIN" ? "Administrador" : "Operador"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={usuario.activo ? "success" : "neutral"}>
                  {usuario.activo ? "Activo" : "Inactivo"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-ciruela-400">
                {formatearFecha(usuario.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
