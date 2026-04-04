import { z } from "zod";
import { SupervisorStatus } from "@/types/http/supervisor.types";

/**
 * Syria phone number regex
 * Matches: 09xxxxxxxx, +963xxxxxxxxx, 00963xxxxxxxxx
 */
const syriaPhoneRegex = /^(09|(\+|00)9639)(3|4|5|6|8|9)[0-9]{7}$/;

/**
 * Username validation regex
 * Can only contain letters, numbers, underscores, dots, and hyphens
 */
const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

/**
 * Password validation regex
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Minimum 8 characters
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/;

/**
 * Create supervisor validation schema with localized messages
 * Matches CreateSupervisorDto from backend
 * @param t - Translation function from useTranslations("validation")
 */
export const createSupervisorSchema = (
  t: (key: string, options?: Record<string, any>) => string,
) => {
  return z.object({
    username: z
      .string()
      .min(1, t("usernameRequired"))
      .min(6, t("usernameMin", { min: 6 }))
      .max(50, t("usernameMax", { max: 50 }))
      .regex(usernameRegex, t("usernameFormat")),
    fullName: z
      .string()
      .min(1, t("fullNameRequired"))
      .min(2, t("fullNameMin", { min: 2 }))
      .max(100, t("fullNameMax", { max: 100 })),
    phone: z
      .string()
      .regex(syriaPhoneRegex, t("phoneInvalid"))
      .or(z.literal(""))
      .optional(),
    password: z
      .string()
      .min(1, t("passwordRequired"))
      .min(8, t("passwordMin", { min: 8 }))
      .max(100, t("passwordMax", { max: 100 }))
      .regex(passwordRegex, t("passwordFormat")),
    imageUrl: z
      .string()
      .max(500, t("imageUrlMax", { max: 500 }))
      .optional(),
  });
};

export type CreateSupervisorFormData = z.infer<
  ReturnType<typeof createSupervisorSchema>
>;

/**
 * Update supervisor validation schema with localized messages
 * Matches UpdateSupervisorAdminDto from backend (all fields optional)
 * @param t - Translation function from useTranslations("validation")
 */
export const updateSupervisorSchema = (
  t: (key: string, options?: Record<string, any>) => string,
) => {
  return z.object({
    username: z
      .string()
      .min(6, t("usernameMin", { min: 6 }))
      .max(50, t("usernameMax", { max: 50 }))
      .regex(usernameRegex, t("usernameFormat"))
      .optional(),
    fullName: z
      .string()
      .min(2, t("fullNameMin", { min: 2 }))
      .max(100, t("fullNameMax", { max: 100 }))
      .optional(),
    phone: z
      .string()
      .regex(syriaPhoneRegex, t("phoneInvalid"))
      .or(z.literal(""))
      .optional(),
    password: z
      .string()
      .min(8, t("passwordMin", { min: 8 }))
      .max(100, t("passwordMax", { max: 100 }))
      .regex(passwordRegex, t("passwordFormat"))
      .or(z.literal(""))
      .optional(),
    imageUrl: z
      .string()
      .max(500, t("imageUrlMax", { max: 500 }))
      .optional(),
    status: z.nativeEnum(SupervisorStatus).optional(),
    notes: z.string().optional(),
  });
};

export type UpdateSupervisorFormData = z.infer<
  ReturnType<typeof updateSupervisorSchema>
>;
