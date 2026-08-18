"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const OTRO = "__OTRO__";

interface SelectOInputProps {
  id?: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  placeholderInput?: string;
  otroLabel?: string;
  disabled?: boolean;
}

/**
 * Select nativo estilizado con opción "Otro" que despliega un input libre.
 * El valor expuesto al padre es el texto final (catalogo u otro escrito).
 */
export function SelectOInput({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Seleccione",
  placeholderInput = "Especifique",
  otroLabel = "Otro (especifique)",
  disabled = false,
}: SelectOInputProps) {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [modoOtro, setModoOtro] = useState(false);

  // Si el padre resetea el valor a vacío, salimos del modo Otro.
  useEffect(() => {
    if (value === "") setModoOtro(false);
  }, [value]);

  // Mostramos "Otro" cuando el usuario lo eligió explícitamente o cuando
  // el valor actual no pertenece al catálogo (por ejemplo, datos precargados).
  const isOtro = modoOtro || (value.length > 0 && !options.includes(value));
  const selectValue = isOtro ? OTRO : value;

  function handleSelectChange(nuevoValor: string) {
    if (nuevoValor === OTRO) {
      setModoOtro(true);
      onChange("");
      // Enfocamos el input en el siguiente tick para que el render termine.
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setModoOtro(false);
      onChange(nuevoValor);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={`${fieldId}-select`}
        className="text-sm font-medium text-ciruela-700"
      >
        {label}
      </Label>
      <div className="relative w-full">
        <select
          id={`${fieldId}-select`}
          value={selectValue}
          onChange={(e) => handleSelectChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "h-11 w-full appearance-none rounded-[var(--radius-brand)] border border-humo-300 bg-white px-3 pr-9 py-2 text-sm text-berenjena shadow-sm outline-none transition-colors",
            "focus:border-guinda-500 focus:ring-2 focus:ring-guinda-500/30",
            "disabled:cursor-not-allowed disabled:bg-humo-100 disabled:opacity-60"
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
          <option value={OTRO}>{otroLabel}</option>
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ciruela-400"
        />
      </div>
      {isOtro ? (
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderInput}
          className="min-h-11"
        />
      ) : null}
    </div>
  );
}
