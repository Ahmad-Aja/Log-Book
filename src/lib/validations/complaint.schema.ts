import { z } from "zod";

export const createComplaintMessageSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    message: z
      .string()
      .min(1, t("required"))
      .max(2000, t("maxLength", { max: 2000 })),
  });

export type CreateComplaintMessageFormData = z.infer<
  ReturnType<typeof createComplaintMessageSchema>
>;
