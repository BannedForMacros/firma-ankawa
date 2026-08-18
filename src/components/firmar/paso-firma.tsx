"use client";

import { useCallback, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SignaturePadCanvas } from "@/components/brand/signature-pad";
import { UploadSignature } from "@/components/brand/upload-signature";
import type { FirmaCapturada } from "@/components/firmar/flujo-firma";

interface PasoFirmaProps {
  firma: FirmaCapturada | null;
  onChange: (firma: FirmaCapturada | null) => void;
}

export function PasoFirma({ firma, onChange }: PasoFirmaProps) {
  const [metodo, setMetodo] = useState<"dibujar" | "subir">("dibujar");
  const [reinicio, setReinicio] = useState(0);

  const manejarDibujo = useCallback(
    (dataUrl: string | null) => {
      onChange(dataUrl ? { dataUrl, metodo: "DRAWN" } : null);
    },
    [onChange]
  );

  const manejarCarga = useCallback(
    (dataUrl: string | null) => {
      onChange(dataUrl ? { dataUrl, metodo: "UPLOADED" } : null);
    },
    [onChange]
  );

  const rehacer = useCallback(() => {
    setReinicio((n) => n + 1);
    onChange(null);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-ciruela-700">Estampe su firma</h2>
        <p className="mt-0.5 text-sm text-ciruela-400">
          Dibuje o suba una imagen de su firma.
        </p>
      </div>

      <Tabs
        value={metodo}
        onValueChange={(valor) => setMetodo(valor === "subir" ? "subir" : "dibujar")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dibujar">Dibujar</TabsTrigger>
          <TabsTrigger value="subir">Subir imagen</TabsTrigger>
        </TabsList>
        <TabsContent value="dibujar" forceMount className="data-[state=inactive]:hidden">
          <SignaturePadCanvas key={`pad-${reinicio}`} onChange={manejarDibujo} />
        </TabsContent>
        <TabsContent value="subir" forceMount className="data-[state=inactive]:hidden">
          <UploadSignature key={`carga-${reinicio}`} onChange={manejarCarga} />
        </TabsContent>
      </Tabs>

      {firma ? (
        <div className="flex flex-col gap-2 rounded-[var(--radius-brand)] border border-humo-300 bg-humo-50 p-3">
          <p className="text-xs font-medium text-ciruela-700">Vista previa</p>
          <div className="fondo-ajedrez flex items-center justify-center rounded-[var(--radius-brand)] border border-humo-300 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL local */}
            <img
              src={firma.dataUrl}
              alt="Previsualización de su firma"
              className="max-h-28 max-w-full object-contain"
            />
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={rehacer} className="min-h-10 w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Rehacer firma
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
