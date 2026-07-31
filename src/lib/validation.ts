import { z } from "zod";

/** DNI peruano: exactamente 8 dígitos. */
export const dniSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/, "El DNI debe tener exactamente 8 dígitos.");

/** RUC peruano: 11 dígitos con prefijo 10, 15, 17 o 20. */
export const rucSchema = z
  .string()
  .trim()
  .regex(/^(10|15|17|20)\d{9}$/, "El RUC debe tener 11 dígitos y comenzar con 10, 15, 17 o 20.");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingrese un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const crearSesionSchema = z.object({
  asunto: z.string().trim().min(5, "Describa el asunto de la audiencia (mínimo 5 caracteres).").max(300),
  expediente: z.string().trim().min(3, "Ingrese el número de expediente.").max(60),
  fechaAudiencia: z.coerce.date({ message: "Ingrese la fecha de la audiencia." }),
  sede: z.string().trim().min(3, "Ingrese la sede.").max(120),
  modalidad: z.enum(["PRESENCIAL", "VIRTUAL", "MIXTA"]),
});

export const consultaIdentidadSchema = z.discriminatedUnion("docType", [
  z.object({ docType: z.literal("DNI"), docNumber: dniSchema }),
  z.object({ docType: z.literal("RUC"), docNumber: rucSchema }),
]);

/** Data URL de un PNG, con tope de ~2.5 MB en base64. */
const pngDataUrlSchema = z
  .string()
  .regex(/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/, "La firma debe ser una imagen PNG válida.")
  .max(3_500_000, "La imagen de la firma es demasiado grande (máximo ~2.5 MB).");

export const guardarFirmaSchema = z
  .object({
    docType: z.enum(["DNI", "RUC"]),
    docNumber: z.string().trim(),
    displayName: z.string().trim().min(3, "Ingrese el nombre o razón social.").max(200),
    repNombre: z.string().trim().min(3).max(200).optional(),
    repDni: dniSchema.optional(),
    cargo: z.string().trim().min(2, "Ingrese el cargo o rol en la audiencia.").max(120),
    parte: z.string().trim().min(2, "Indique la parte que representa.").max(160),
    verified: z.boolean(),
    signMethod: z.enum(["DRAWN", "UPLOADED"]),
    imageDataUrl: pngDataUrlSchema,
    conformidad: z.literal(true, {
      message: "Debe aceptar la declaración de conformidad para firmar.",
    }),
  })
  .superRefine((val, ctx) => {
    if (val.docType === "DNI" && !dniSchema.safeParse(val.docNumber).success) {
      ctx.addIssue({ code: "custom", path: ["docNumber"], message: "DNI inválido." });
    }
    if (val.docType === "RUC") {
      if (!rucSchema.safeParse(val.docNumber).success) {
        ctx.addIssue({ code: "custom", path: ["docNumber"], message: "RUC inválido." });
      }
      if (!val.repNombre) {
        ctx.addIssue({
          code: "custom",
          path: ["repNombre"],
          message: "Ingrese el nombre del representante que firma.",
        });
      }
      if (!val.repDni) {
        ctx.addIssue({
          code: "custom",
          path: ["repDni"],
          message: "Ingrese el DNI del representante que firma.",
        });
      }
    }
  });

export const crearUsuarioSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingrese un correo válido."),
  nombre: z.string().trim().min(3, "Ingrese el nombre completo.").max(120),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres."),
  role: z.enum(["ADMIN", "OPERADOR"]),
});

export type CrearSesionInput = z.infer<typeof crearSesionSchema>;
export type GuardarFirmaInput = z.infer<typeof guardarFirmaSchema>;
export type ConsultaIdentidadInput = z.infer<typeof consultaIdentidadSchema>;
