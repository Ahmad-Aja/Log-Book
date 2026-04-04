"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../forms/FormField";
import { ImageUpload } from "../../ui/ImageUpload";
import { FormModal } from "../../ui/FormModal";
import { useTranslations } from "next-intl";
import {
  useUploadSupervisorImage,
  useCreateSupervisor,
} from "@/hooks/http/useSupervisors";
import {
  createSupervisorSchema,
  CreateSupervisorFormData,
} from "@/lib/validations/supervisor.schema";

type FormData = CreateSupervisorFormData;

interface AddSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSupervisorModal({
  isOpen,
  onClose,
}: AddSupervisorModalProps) {
  const t = useTranslations("supervisors.modal");
  const tValidation = useTranslations("validation");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { uploadImageMutate, uploadImagePending } = useUploadSupervisorImage();
  const { createSupervisorMutate, createSupervisorPending } =
    useCreateSupervisor();

  const isLoading = uploadImagePending || createSupervisorPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createSupervisorSchema(tValidation)),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setSelectedImage(null);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: FormData) => {
    let imageUrl: string | undefined;

    // Upload image if selected
    if (selectedImage) {
      try {
        imageUrl = await new Promise<string>((resolve, reject) => {
          uploadImageMutate(selectedImage, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      } catch (error) {
        return; // Error is handled by the hook
      }
    }

    // Create supervisor with image URL
    createSupervisorMutate(
      {
        ...data,
        imageUrl,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("title")}
      description={t("description")}
      submitText={t("add")}
      cancelText={t("cancel")}
      isLoading={isLoading}
    >
      <div className="mb-4">
        <label className="text-[13px] text-wheat mb-1 block">
          {t("image")}
        </label>
        <ImageUpload onChange={setSelectedImage} disabled={isLoading} />
      </div>

      <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t("username")}
                placeholder={t("usernamePlaceholder")}
                type="text"
                registration={register("username")}
                error={errors.username?.message}
                disabled={isLoading}
              />

              <FormField
                label={t("fullName")}
                placeholder={t("fullNamePlaceholder")}
                type="text"
                registration={register("fullName")}
                error={errors.fullName?.message}
                disabled={isLoading}
              />

              <FormField
                label={t("phone")}
                placeholder={t("phonePlaceholder")}
                type="text"
                registration={register("phone")}
                error={errors.phone?.message}
                disabled={isLoading}
              />

              <FormField
                label={t("password")}
                placeholder={t("passwordPlaceholder")}
                type="password"
                registration={register("password")}
                error={errors.password?.message}
                disabled={isLoading}
                showPasswordToggle
              />
            </div>
    </FormModal>
  );
}
