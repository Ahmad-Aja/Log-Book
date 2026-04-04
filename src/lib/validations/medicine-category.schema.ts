import { z } from "zod";

export const createMedicineCategorySchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    arName: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 })),
    enName: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 })),
    arDescription: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    enDescription: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
  });

export type CreateMedicineCategoryFormData = z.infer<
  ReturnType<typeof createMedicineCategorySchema>
>;
export type CreateMedicineCategoryFormInput = z.input<
  ReturnType<typeof createMedicineCategorySchema>
>;

export const updateMedicineCategorySchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    arName: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 }))
      .optional(),
    enName: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 }))
      .optional(),
    arDescription: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    enDescription: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    status: z.enum(["APPROVED", "REJECTED"]).optional(),
  });

export type UpdateMedicineCategoryFormData = z.infer<
  ReturnType<typeof updateMedicineCategorySchema>
>;
export type UpdateMedicineCategoryFormInput = z.input<
  ReturnType<typeof updateMedicineCategorySchema>
>;
