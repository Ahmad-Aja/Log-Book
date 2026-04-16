import { z } from "zod";

export const createStudentProcedureSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    studentId: z.coerce
      .number({ error: t("required") })
      .int()
      .min(1, t("minNumber", { min: 1 })),
    procedureId: z.coerce
      .number({ error: t("required") })
      .int()
      .min(1, t("minNumber", { min: 1 })),
    supervisorId: z.coerce
      .number({ error: t("required") })
      .int()
      .min(1, t("minNumber", { min: 1 })),
    evaluationScore: z.coerce
      .number({ error: t("required") })
      .int()
      .min(1, t("minNumber", { min: 1 }))
      .max(5, t("maxNumber", { max: 5 })),
    supervisorNote: z.string().optional(),
  });

export type CreateStudentProcedureFormData = z.infer<
  ReturnType<typeof createStudentProcedureSchema>
>;
export type CreateStudentProcedureFormInput = z.input<
  ReturnType<typeof createStudentProcedureSchema>
>;

export const updateStudentProcedureSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z
    .object({
      status: z.enum(["APPROVED", "REJECTED"]).optional(),
      evaluationScore: z.coerce
        .number()
        .int()
        .min(1, t("minNumber", { min: 1 }))
        .max(5, t("maxNumber", { max: 5 }))
        .optional()
        .or(z.literal(""))
        .transform((v) => (v === "" ? undefined : v)),
      supervisorNote: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.status === "APPROVED" && !data.evaluationScore) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("evaluationScoreRequired"),
          path: ["evaluationScore"],
        });
      }
    });

export type UpdateStudentProcedureFormData = z.infer<
  ReturnType<typeof updateStudentProcedureSchema>
>;
export type UpdateStudentProcedureFormInput = z.input<
  ReturnType<typeof updateStudentProcedureSchema>
>;
