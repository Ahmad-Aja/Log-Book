"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../forms/FormField";
import { ImageUpload } from "../../ui/ImageUpload";
import { FormModal } from "../../ui/FormModal";
import { useTranslations } from "next-intl";
import {
  useUploadStudentImage,
  useCreateStudent,
} from "@/hooks/http/useStudents";
import {
  createStudentSchema,
  CreateStudentFormData,
} from "@/lib/validations/student.schema";

type FormData = CreateStudentFormData;

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const t = useTranslations("students.modal");
  const tValidation = useTranslations("validation");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { uploadImageMutate, uploadImagePending } = useUploadStudentImage();
  const { createStudentMutate, createStudentPending } = useCreateStudent();

  const isLoading = uploadImagePending || createStudentPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createStudentSchema(tValidation)),
    defaultValues: {
      universityId: "",
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

    // Create student with image URL
    createStudentMutate(
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
                label={t("universityId")}
                placeholder={t("universityIdPlaceholder")}
                type="text"
                registration={register("universityId")}
                error={errors.universityId?.message}
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
