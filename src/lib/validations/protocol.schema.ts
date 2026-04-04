import { z } from "zod";

export const createProtocolSchema = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    arTitle: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 })),
    enTitle: z
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
    procedureId: z
      .number({ error: t("required") })
      .min(1, t("required")),
  });

export type CreateProtocolFormData = z.infer<
  ReturnType<typeof createProtocolSchema>
>;
export type CreateProtocolFormInput = z.input<
  ReturnType<typeof createProtocolSchema>
>;

export const updateProtocolSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    arTitle: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 }))
      .optional(),
    enTitle: z
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

export type UpdateProtocolFormData = z.infer<
  ReturnType<typeof updateProtocolSchema>
>;
export type UpdateProtocolFormInput = z.input<
  ReturnType<typeof updateProtocolSchema>
>;

export const createStepSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    stepNumber: z
      .number({ error: t("required") })
      .min(1, t("required")),
    arTitle: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 })),
    enTitle: z
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

export type CreateStepFormData = z.infer<ReturnType<typeof createStepSchema>>;
export type CreateStepFormInput = z.input<ReturnType<typeof createStepSchema>>;
