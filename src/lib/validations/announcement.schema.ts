import { z } from "zod";
import { AnnouncementTargetAudience } from "@/types/http/announcement.types";

export const createAnnouncementSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    title: z
      .string()
      .min(1, t("required"))
      .max(255, t("maxLength", { max: 255 })),
    content: z.string().min(1, t("required")),
    type: z.string().min(1, t("required")),
    targetAudience: z.nativeEnum(AnnouncementTargetAudience, {
      error: t("required"),
    }),
  });

export type CreateAnnouncementFormData = z.infer<
  ReturnType<typeof createAnnouncementSchema>
>;

export const updateAnnouncementSchema = (
  t: (key: string, opts?: any) => string,
) =>
  z.object({
    title: z
      .string()
      .max(255, t("maxLength", { max: 255 }))
      .optional(),
    content: z.string().optional(),
    type: z.string().optional(),
    targetAudience: z.nativeEnum(AnnouncementTargetAudience).optional(),
  });

export type UpdateAnnouncementFormData = z.infer<
  ReturnType<typeof updateAnnouncementSchema>
>;
