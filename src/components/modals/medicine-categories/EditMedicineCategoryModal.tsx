"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { useUpdateMedicineCategory } from "@/hooks/http/useMedicineCategories";
import {
  updateMedicineCategorySchema,
  UpdateMedicineCategoryFormData,
  UpdateMedicineCategoryFormInput,
} from "@/lib/validations/medicine-category.schema";
import { MedicineCategory } from "@/types/http/medicine-category.types";

interface EditMedicineCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: MedicineCategory | null;
}

function mapToFormData(category: MedicineCategory): UpdateMedicineCategoryFormInput {
  return {
    arName: category.arName,
    enName: category.enName,
    arDescription: category.arDescription ?? "",
    enDescription: category.enDescription ?? "",
    status:
      category.status === "PENDING"
        ? undefined
        : (category.status as "APPROVED" | "REJECTED"),
  };
}

export function EditMedicineCategoryModal({
  isOpen,
  onClose,
  category,
}: EditMedicineCategoryModalProps) {
  const t = useTranslations("medicineCategories.modal");
  const tValidation = useTranslations("validation");

  const { updateMedicineCategoryMutate, updateMedicineCategoryPending } =
    useUpdateMedicineCategory();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateMedicineCategoryFormInput, unknown, UpdateMedicineCategoryFormData>({
    resolver: zodResolver(updateMedicineCategorySchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen && category) reset(mapToFormData(category));
  }, [isOpen, category, reset]);

  const currentStatus = watch("status");

  const statusOptions = [
    { value: "APPROVED", label: t("statusApproved") },
    { value: "REJECTED", label: t("statusRejected") },
  ];

  const handleFormSubmit = (data: UpdateMedicineCategoryFormData) => {
    if (!category) return;
    updateMedicineCategoryMutate(
      { id: category.id, data },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("editTitle")}
      submitText={updateMedicineCategoryPending ? t("saving") : t("save")}
      cancelText={t("cancel")}
      isLoading={updateMedicineCategoryPending}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("arName")}
            type="text"
            registration={register("arName")}
            error={errors.arName?.message}
            disabled={updateMedicineCategoryPending}
          />
          <FormField
            label={t("enName")}
            type="text"
            registration={register("enName")}
            error={errors.enName?.message}
            disabled={updateMedicineCategoryPending}
          />
        </div>
        <StatusDropdown
          label={t("status")}
          placeholder={t("statusPlaceholder")}
          value={currentStatus ?? ""}
          onChange={(val) =>
            setValue("status", (val as "APPROVED" | "REJECTED") || undefined)
          }
          options={statusOptions}
          showAllOption={true}
          allOptionLabel={t("statusKeep")}
          error={errors.status?.message}
        />
        <TextareaField
          label={t("arDescription")}
          registration={register("arDescription")}
          error={errors.arDescription?.message}
          rows={3}
          disabled={updateMedicineCategoryPending}
        />
        <TextareaField
          label={t("enDescription")}
          registration={register("enDescription")}
          error={errors.enDescription?.message}
          rows={3}
          disabled={updateMedicineCategoryPending}
        />
      </div>
    </FormModal>
  );
}
