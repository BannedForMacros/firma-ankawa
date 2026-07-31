import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
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
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || !user.activo) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

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

/** Sesión interna obligatoria; lanza si no hay usuario autenticado. */
export async function requireUser(): Promise<{
  id: string;
  email: string;
  name: string;
  role: RolUsuario;
}> {
  const session = await auth();
  if (!session?.user) throw new Error("NO_AUTORIZADO");
  return session.user;
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
