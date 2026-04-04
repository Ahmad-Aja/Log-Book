import { z } from "zod";

export const createMedicineSchema = (
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
    categoryId: z
      .number({ error: t("required") })
      .min(1, t("required")),
  });

export type CreateMedicineFormData = z.infer<
  ReturnType<typeof createMedicineSchema>
>;

export const updateMedicineSchema = (
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
    categoryId: z.number().min(1, t("required")).optional(),
    status: z.enum(["APPROVED", "REJECTED"]).optional(),
  });

export type UpdateMedicineFormData = z.infer<
  ReturnType<typeof updateMedicineSchema>
>;
