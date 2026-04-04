"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { FormModal } from "@/components/ui/FormModal";
import { useTranslations } from "next-intl";
import { useCreateMedicineCategory } from "@/hooks/http/useMedicineCategories";
import {
  createMedicineCategorySchema,
  CreateMedicineCategoryFormData,
  CreateMedicineCategoryFormInput,
} from "@/lib/validations/medicine-category.schema";

interface AddMedicineCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMedicineCategoryModal({
  isOpen,
  onClose,
}: AddMedicineCategoryModalProps) {
  const t = useTranslations("medicineCategories.modal");
  const tValidation = useTranslations("validation");

  const { createMedicineCategoryMutate, createMedicineCategoryPending } =
    useCreateMedicineCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMedicineCategoryFormInput, unknown, CreateMedicineCategoryFormData>({
    resolver: zodResolver(createMedicineCategorySchema(tValidation)),
    defaultValues: {
      arName: "",
      enName: "",
      arDescription: "",
      enDescription: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: CreateMedicineCategoryFormData) => {
    createMedicineCategoryMutate(
      {
        arName: data.arName,
        enName: data.enName,
        arDescription: data.arDescription,
        enDescription: data.enDescription,
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
      title={t("addTitle")}
      submitText={
        createMedicineCategoryPending ? t("adding") : t("add")
      }
      cancelText={t("cancel")}
      isLoading={createMedicineCategoryPending}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("arName")}
            placeholder={t("arNamePlaceholder")}
            type="text"
            registration={register("arName")}
            error={errors.arName?.message}
            disabled={createMedicineCategoryPending}
          />
          <FormField
            label={t("enName")}
            placeholder={t("enNamePlaceholder")}
            type="text"
            registration={register("enName")}
            error={errors.enName?.message}
            disabled={createMedicineCategoryPending}
          />
        </div>
        <TextareaField
          label={t("arDescription")}
          placeholder={t("arDescriptionPlaceholder")}
          registration={register("arDescription")}
          error={errors.arDescription?.message}
          rows={3}
          disabled={createMedicineCategoryPending}
        />
        <TextareaField
          label={t("enDescription")}
          placeholder={t("enDescriptionPlaceholder")}
          registration={register("enDescription")}
          error={errors.enDescription?.message}
          rows={3}
          disabled={createMedicineCategoryPending}
        />
      </div>
    </FormModal>
  );
}
