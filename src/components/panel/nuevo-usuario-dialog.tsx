"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { crearUsuarioSchema } from "@/lib/validation";
import type { ApiError } from "@/lib/types";

type ErroresCampo = Partial<
  Record<"nombre" | "email" | "password" | "role", string>
>;

const FORM_INICIAL = {
  nombre: "",
  email: "",
  password: "",
  role: "OPERADOR",
} as const;

/**
 * Diálogo de creación de usuarios internos (solo ADMIN).
 * Valida con crearUsuarioSchema y envía a POST /api/usuarios.
 */
export function NuevoUsuarioDialog() {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [errores, setErrores] = React.useState<ErroresCampo>({});
  const [errorServidor, setErrorServidor] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<{
    nombre: string;
    email: string;
    password: string;
    role: string;
  }>({ ...FORM_INICIAL });

  function alCambiarApertura(abrir: boolean) {
    setAbierto(abrir);
    if (!abrir) {
      setForm({ ...FORM_INICIAL });
      setErrores({});
      setErrorServidor(null);
      setEnviando(false);
    }
  }

  function actualizarCampo(campo: keyof typeof form, valor: string) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
  }

  async function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorServidor(null);

    const resultado = crearUsuarioSchema.safeParse(form);
    if (!resultado.success) {
      const porCampo: ErroresCampo = {};
      for (const issue of resultado.error.issues) {
        const campo = issue.path[0];
        if (
          (campo === "nombre" ||
            campo === "email" ||
            campo === "password" ||
            campo === "role") &&
          !porCampo[campo]
        ) {
          porCampo[campo] = issue.message;
        }
      }
      setErrores(porCampo);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      const respuesta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultado.data),
      });

      if (respuesta.status === 201) {
        alCambiarApertura(false);
        router.refresh();
        return;
      }

      const cuerpo = (await respuesta.json().catch(() => null)) as
        | ApiError
        | null;
      setErrorServidor(
        cuerpo?.error ??
          "No fue posible registrar el usuario. Verifique los datos e intente nuevamente.",
      );
    } catch {
      setErrorServidor(
        "No fue posible comunicarse con el servidor. Verifique su conexión e intente nuevamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiarApertura}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <UserPlus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Nuevo usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar nuevo usuario interno</DialogTitle>
          <DialogDescription>
            Complete los datos del colaborador del centro. La cuenta quedará
            habilitada de inmediato para acceder al panel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alEnviar} className="grid gap-4" noValidate>
          {errorServidor ? (
            <Alert variant="error">
              <AlertTitle>No se pudo crear el usuario</AlertTitle>
              <AlertDescription>{errorServidor}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="nuevo-usuario-nombre">Nombre completo</Label>
            <Input
              id="nuevo-usuario-nombre"
              name="nombre"
              autoComplete="name"
              value={form.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              aria-invalid={errores.nombre ? true : undefined}
              aria-describedby={
                errores.nombre ? "nuevo-usuario-nombre-error" : undefined
              }
              disabled={enviando}
            />
            {errores.nombre ? (
              <p
                id="nuevo-usuario-nombre-error"
                className="text-xs text-guinda-600"
              >
                {errores.nombre}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="nuevo-usuario-email">Correo electrónico</Label>
            <Input
              id="nuevo-usuario-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => actualizarCampo("email", e.target.value)}
              aria-invalid={errores.email ? true : undefined}
              aria-describedby={
                errores.email ? "nuevo-usuario-email-error" : undefined
              }
              disabled={enviando}
            />
            {errores.email ? (
              <p
                id="nuevo-usuario-email-error"
                className="text-xs text-guinda-600"
              >
                {errores.email}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="nuevo-usuario-password">Contraseña</Label>
            <Input
              id="nuevo-usuario-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => actualizarCampo("password", e.target.value)}
              aria-invalid={errores.password ? true : undefined}
              aria-describedby={
                errores.password ? "nuevo-usuario-password-error" : undefined
              }
              disabled={enviando}
            />
            {errores.password ? (
              <p
                id="nuevo-usuario-password-error"
                className="text-xs text-guinda-600"
              >
                {errores.password}
              </p>
            ) : (
              <p className="text-xs text-ciruela-400">
                Mínimo 10 caracteres.
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="nuevo-usuario-role">Rol</Label>
            <Select
              id="nuevo-usuario-role"
              name="role"
              value={form.role}
              onChange={(e) => actualizarCampo("role", e.target.value)}
              aria-invalid={errores.role ? true : undefined}
              aria-describedby={
                errores.role ? "nuevo-usuario-role-error" : undefined
              }
              disabled={enviando}
            >
              <option value="OPERADOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </Select>
            {errores.role ? (
              <p
                id="nuevo-usuario-role-error"
                className="text-xs text-guinda-600"
              >
                {errores.role}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => alCambiarApertura(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={enviando}>
              {enviando ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Registrando…
                </>
              ) : (
                "Crear usuario"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
