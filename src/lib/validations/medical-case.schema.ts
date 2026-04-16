import { z } from "zod";

export const createMedicalCaseSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    title: z
      .string()
      .min(5, t("minLength", { min: 5 }))
      .max(500, t("maxLength", { max: 500 })),
    description: z
      .string()
      .min(8, t("minLength", { min: 8 }))
      .max(8192, t("maxLength", { max: 8192 })),
    caseDate: z.string().min(1, t("required")),
    hospital: z
      .string()
      .min(3, t("minLength", { min: 3 }))
      .max(255, t("maxLength", { max: 255 })),
  });

export type CreateMedicalCaseFormData = z.infer<
  ReturnType<typeof createMedicalCaseSchema>
>;
export type CreateMedicalCaseFormInput = z.input<
  ReturnType<typeof createMedicalCaseSchema>
>;

export const updateMedicalCaseSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    title: z
      .string()
      .min(5, t("minLength", { min: 5 }))
      .max(500, t("maxLength", { max: 500 }))
      .optional(),
    description: z
      .string()
      .min(8, t("minLength", { min: 8 }))
      .max(8192, t("maxLength", { max: 8192 }))
      .optional(),
    caseDate: z.string().optional(),
    hospital: z
      .string()
      .min(3, t("minLength", { min: 3 }))
      .max(255, t("maxLength", { max: 255 }))
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
  });

export type UpdateMedicalCaseFormData = z.infer<
  ReturnType<typeof updateMedicalCaseSchema>
>;
export type UpdateMedicalCaseFormInput = z.input<
  ReturnType<typeof updateMedicalCaseSchema>
>;
