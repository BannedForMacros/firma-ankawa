"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** Cierra la sesión del usuario interno y regresa a la portada pública. */
export function SignoutButton() {
  const [saliendo, setSaliendo] = useState(false);

  const handleSignout = async (): Promise<void> => {
    setSaliendo(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setSaliendo(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={saliendo}
      onClick={() => {
        void handleSignout();
      }}
      className="text-ciruela-100 hover:bg-ciruela-600 hover:text-white active:bg-ciruela-500 focus-visible:ring-guinda-300 focus-visible:ring-offset-ciruela-700"
    >
      {saliendo ? (
        <Spinner className="h-4 w-4 text-white" />
      ) : (
        <LogOut className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      )}
      Cerrar sesión
    </Button>
  );
}
