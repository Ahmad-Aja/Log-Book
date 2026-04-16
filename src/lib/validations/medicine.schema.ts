import { z } from "zod";

const optionalText = (t: (key: string, opts?: any) => string) =>
  z.string().max(2000, t("maxLength", { max: 2000 })).optional();

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
    arDescription: optionalText(t),
    enDescription: optionalText(t),
    arIndications: optionalText(t),
    enIndications: optionalText(t),
    arAdministration: optionalText(t),
    enAdministration: optionalText(t),
    arContraindications: optionalText(t),
    enContraindications: optionalText(t),
    arMedicineDosages: optionalText(t),
    enMedicineDosages: optionalText(t),
    arNotes: optionalText(t),
    enNotes: optionalText(t),
  });

export type CreateMedicineFormData = z.infer<
  ReturnType<typeof createMedicineSchema>
>;

export const updateMedicineSchema = (
  t: (key: string, opts?: any) => string,
) =>
  createMedicineSchema(t).partial().extend({
    status: z.enum(["APPROVED", "REJECTED"]).optional(),
  });

export type UpdateMedicineFormData = z.infer<
  ReturnType<typeof updateMedicineSchema>
>;
