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
  // Al incrementarse, remonta el lienzo y el cargador para rehacer la firma.
  const [reinicio, setReinicio] = useState(0);

  const manejarDibujo = useCallback(
    (dataUrl: string | null) => {
      onChange(dataUrl ? { dataUrl, metodo: "DRAWN" } : null);
    },
    [onChange],
  );

  const manejarCarga = useCallback(
    (dataUrl: string | null) => {
      onChange(dataUrl ? { dataUrl, metodo: "UPLOADED" } : null);
    },
    [onChange],
  );

  const rehacer = useCallback(() => {
    setReinicio((n) => n + 1);
    onChange(null);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-ciruela-700">Estampe su firma</h2>
        <p className="mt-1 text-sm leading-relaxed text-ciruela-400">
          Firme dentro del recuadro con el dedo o un lápiz óptico. Si lo prefiere, suba una
          fotografía o imagen de su firma.
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
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ciruela-700">
            Así quedará su firma en el acta
          </p>
          <div className="fondo-ajedrez flex items-center justify-center rounded-[var(--radius-brand)] border border-humo-300 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL local, no optimizable */}
            <img
              src={firma.dataUrl}
              alt="Previsualización de su firma"
              className="max-h-32 max-w-full object-contain"
            />
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={rehacer}>
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Rehacer la firma
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
