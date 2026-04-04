import { z } from "zod";

/**
 * Password validation regex
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/;

/**
 * Create login validation schema with localized messages
 * Matches AdminLoginDto from backend (ignoring fcmToken)
 * @param t - Translation function from useTranslations("validation")
 */
export const createLoginSchema = (t: (key: string) => string) => {
  return z.object({
    username: z.string().min(1, t("usernameRequired")),
    password: z.string().min(1, t("passwordRequired")),
  });
};

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * Create profile update validation schema with localized messages
 * Matches UpdateAdminDto from backend (ignoring fcmToken)
 * @param t - Translation function from useTranslations("validation")
 */
export const createProfileUpdateSchema = (
  t: (key: string, options?: Record<string, any>) => string,
) => {
  return z.object({
    fullName: z
      .string()
      .max(100, t("fullNameMax", { max: 100 }))
      .optional(),
    password: z
      .string()
      .min(8, t("passwordMin", { min: 8 }))
      .max(100, t("passwordMax", { max: 100 }))
      .regex(passwordRegex, t("passwordFormat"))
      .or(z.literal(""))
      .optional(),
  });
};

export type ProfileUpdateFormData = z.infer<
  ReturnType<typeof createProfileUpdateSchema>
>;
