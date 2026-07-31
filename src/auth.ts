import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { rateLimit, cleanupExpiredBuckets } from "@/lib/rate-limit";
import { clientInfo } from "@/lib/request";
import { registrarAuditoria } from "@/lib/audit";
import type { RolUsuario } from "@/lib/types";

declare module "next-auth" {
  interface User {
    role: RolUsuario;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: RolUsuario;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // JWT de vida corta: la revocación efectiva (usuario desactivado o rol
  // cambiado) la aplica requireUser() contra la BD en cada acceso al panel.
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials, request) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email } = parsed.data;
        const { ip, userAgent } = clientInfo(request);

        // Rate limit del login: por IP y por correo (fuerza bruta).
        cleanupExpiredBuckets();
        const porIp = rateLimit(`login-ip:${ip}`, { limit: 10, windowMs: 60_000 });
        const porCorreo = rateLimit(`login-email:${email}`, {
          limit: 5,
          windowMs: 60_000,
        });
        if (!porIp.ok || !porCorreo.ok) {
          await registrarAuditoria({
            actorType: "SYSTEM",
            action: "LOGIN_FAILED",
            entityType: "User",
            ip,
            userAgent,
            metadata: { email, motivo: "RATE_LIMITED" },
          });
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        const passwordOk =
          user !== null && (await compare(parsed.data.password, user.passwordHash));

        if (!user || !user.activo || !passwordOk) {
          await registrarAuditoria({
            actorType: "SYSTEM",
            action: "LOGIN_FAILED",
            entityType: "User",
            entityId: user?.id,
            ip,
            userAgent,
            metadata: {
              email,
              motivo: !user
                ? "USUARIO_INEXISTENTE"
                : !user.activo
                  ? "USUARIO_INACTIVO"
                  : "PASSWORD_INCORRECTA",
            },
          });
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.role as RolUsuario,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as RolUsuario;
      return session;
    },
  },
});

/**
 * Sesión interna obligatoria; lanza si no hay usuario autenticado.
 *
 * Revalida contra la BD en cada llamada: desactivar un usuario
 * (`activo=false`) o cambiarle el rol revoca el acceso de inmediato,
 * aunque su JWT siga vigente. El rol devuelto es SIEMPRE el de la BD,
 * no el del token.
 */
export async function requireUser(): Promise<{
  id: string;
  email: string;
  name: string;
  role: RolUsuario;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("NO_AUTORIZADO");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, nombre: true, role: true, activo: true },
  });
  if (!user || !user.activo) throw new Error("NO_AUTORIZADO");

  return {
    id: user.id,
    email: user.email,
    name: user.nombre,
    role: user.role as RolUsuario,
  };
}

/** Igual que requireUser pero exige rol ADMIN (defensa en backend, no solo UI). */
export async function requireAdmin(): Promise<{
  id: string;
  email: string;
  name: string;
  role: RolUsuario;
}> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("NO_AUTORIZADO");
  return user;
}
