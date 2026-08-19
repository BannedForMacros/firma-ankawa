"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PrevisualizarDocumentoProps {
  sesionId?: string;
  url?: string;
  label?: string;
}

export function PrevisualizarDocumento({
  sesionId,
  url: urlProp,
  label = "Previsualizar documento firmado",
}: PrevisualizarDocumentoProps) {
  const [abierto, setAbierto] = useState(false);
  const url = urlProp ?? `/api/planilla/${sesionId}?modo=preview`;

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="md">
          <Eye className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base font-semibold text-ciruela-700">
            Vista previa del documento firmado
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2">
          <div className="relative h-[70vh] w-full overflow-hidden rounded-[var(--radius-brand)] border border-humo-300 bg-humo-100">
            <iframe src={url} title="Vista previa del documento firmado" className="h-full w-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
