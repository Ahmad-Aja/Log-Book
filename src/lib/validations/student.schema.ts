import { z } from "zod";
import { StudentStatus } from "@/types/http/student.types";

/**
 * Syria phone number regex
 * Matches: 09xxxxxxxx, +963xxxxxxxxx, 00963xxxxxxxxx
 */
const syriaPhoneRegex = /^(09|(\+|00)9639)(3|4|5|6|8|9)[0-9]{7}$/;

/**
 * Password validation regex
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Minimum 8 characters
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/;

/**
 * Create student validation schema with localized messages
 * Matches CreateStudentDto from backend
 * @param t - Translation function from useTranslations("validation")
 */
export const createStudentSchema = (
  t: (key: string, options?: Record<string, any>) => string,
) => {
  return z.object({
    universityId: z
      .string()
      .min(1, t("universityIdRequired"))
      .min(5, t("universityIdMin", { min: 5 }))
      .max(20, t("universityIdMax", { max: 20 }))
      .regex(/^\d+$/, t("universityIdOnlyNumbers")),
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

export type CreateStudentFormData = z.infer<
  ReturnType<typeof createStudentSchema>
>;

/**
 * Update student validation schema with localized messages
 * Matches UpdateStudentAdminDto from backend (all fields optional)
 * @param t - Translation function from useTranslations("validation")
 */
export const updateStudentSchema = (
  t: (key: string, options?: Record<string, any>) => string,
) => {
  return z.object({
    universityId: z
      .string()
      .min(5, t("universityIdMin", { min: 5 }))
      .max(20, t("universityIdMax", { max: 20 }))
      .regex(/^\d+$/, t("universityIdOnlyNumbers"))
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
    status: z.nativeEnum(StudentStatus).optional(),
    notes: z.string().optional(),
  });
};

export type UpdateStudentFormData = z.infer<
  ReturnType<typeof updateStudentSchema>
>;
