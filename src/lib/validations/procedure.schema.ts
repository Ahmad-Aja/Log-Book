import { z } from "zod";

export const createProcedureSchema = (
  t: (key: string, options?: Record<string, any>) => string,
) => {
  return z.object({
    arName: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 })),
    enName: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 })),
    arDescription: z.string().optional(),
    enDescription: z.string().optional(),
    minimumRequired: z
      .number()
      .int()
      .min(0, t("minNumber", { min: 0 }))
      .or(z.nan())
      .optional(),
  });
};

export type CreateProcedureFormData = z.infer<
  ReturnType<typeof createProcedureSchema>
>;

export const updateProcedureSchema = (
  t: (key: string, options?: Record<string, any>) => string,
) => {
  return z.object({
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
    arDescription: z.string().optional(),
    enDescription: z.string().optional(),
    minimumRequired: z
      .number()
      .int()
      .min(0, t("minNumber", { min: 0 }))
      .or(z.nan())
      .optional(),
  });
};

export type UpdateProcedureFormData = z.infer<
  ReturnType<typeof updateProcedureSchema>
>;
