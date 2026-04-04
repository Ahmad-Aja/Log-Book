"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/Button";
import { FormField } from "@/components/forms/FormField";
import { Modal } from "../ui/Modal";
import { ModalHeader } from "../ui/ModalHeader";
import {
  createProfileUpdateSchema,
  ProfileUpdateFormData,
} from "@/lib/validations/auth.schema";
import { Admin } from "@/types/http/auth.types";
import { useTranslations } from "next-intl";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
  onUpdate: (data: ProfileUpdateFormData) => void;
  isUpdating: boolean;
}

export function ProfileModal({
  isOpen,
  onClose,
  admin,
  onUpdate,
  isUpdating,
}: ProfileModalProps) {
  const t = useTranslations("profile");
  const tValidation = useTranslations("validation");
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(createProfileUpdateSchema(tValidation)),
    defaultValues: {
      fullName: admin?.fullName || "",
      password: "",
    },
  });

  // Reset form when admin data changes or modal opens
  useEffect(() => {
    if (admin && isOpen) {
      reset({
        fullName: admin.fullName,
        password: "",
      });
      setIsEditing(false);
    }
  }, [admin, isOpen, reset]);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const onSubmit = (data: ProfileUpdateFormData) => {
    // Only send password if it's provided
    const updateData: ProfileUpdateFormData = {
      fullName: data.fullName,
    };

    if (data.password && data.password.trim() !== "") {
      updateData.password = data.password;
    }

    onUpdate(updateData);
  };

  if (!admin) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 justify-center">
            <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm font-medium text-wheat bg-wheat/10 hover:bg-wheat/20 rounded-md transition-colors"
              >
                {t("edit")}
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUpdating}
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                {t("username")}
              </label>
              <p className="text-lg text-gray-900 mt-1">{admin.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                {t("fullname")}
              </label>
              <p className="text-lg text-gray-900 mt-1">{admin.fullName}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                {t("username")}
              </label>
              <p className="text-lg text-gray-900 mt-1">{admin.username}</p>
            </div>

            <FormField
              label={t("fullname")}
              placeholder={t("fullnamePlaceholder")}
              type="text"
              registration={register("fullName")}
              error={errors.fullName?.message}
              disabled={isUpdating}
            />

            <FormField
              label={t("password")}
              placeholder={t("passwordPlaceholder")}
              type="password"
              registration={register("password")}
              error={errors.password?.message}
              disabled={isUpdating}
              showPasswordToggle
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  reset({
                    fullName: admin.fullName,
                    password: "",
                  });
                }}
                disabled={isUpdating}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isUpdating ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
