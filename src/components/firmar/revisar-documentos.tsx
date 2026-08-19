"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RevisarDocumentosProps {
  url: string;
  label?: string;
  title?: string;
}

export function RevisarDocumentos({ url, label, title }: RevisarDocumentosProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-guinda-600 hover:text-guinda-700"
        >
          <FileText className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          {label ?? "Revisar documento"}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base font-semibold text-ciruela-700">
            {title ?? "Documento a firmar"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 pt-2">
          <div className="relative h-[70vh] w-full overflow-hidden rounded-[var(--radius-brand)] border border-humo-300 bg-humo-100">
            <iframe
              src={url}
              title="Documento a firmar"
              className="h-full w-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
