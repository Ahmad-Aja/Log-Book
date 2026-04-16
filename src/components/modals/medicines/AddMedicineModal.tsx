"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { SearchSelect, SearchSelectOption } from "@/components/ui/SearchSelect";
import { useCreateMedicine } from "@/hooks/http/useMedicines";
import { useMedicineCategories } from "@/hooks/http/useMedicineCategories";
import { MedicineCategoryStatus } from "@/types/http/medicine-category.types";
import {
  createMedicineSchema,
  CreateMedicineFormData,
} from "@/lib/validations/medicine.schema";

const PAGE_SIZE = 20;

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMedicineModal({ isOpen, onClose }: AddMedicineModalProps) {
  const t = useTranslations("medicines.modal");
  const tValidation = useTranslations("validation");
  const locale = useLocale();

  const [categorySearch, setCategorySearch] = useState("");
  const [categoryLimit, setCategoryLimit] = useState(PAGE_SIZE);

  const { medicineCategories, total: totalCategories } = useMedicineCategories({
    search: categorySearch,
    page: 1,
    limit: categoryLimit,
    status: MedicineCategoryStatus.APPROVED,
  });

  const { createMedicineMutate, createMedicinePending } = useCreateMedicine();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMedicineFormData>({
    resolver: zodResolver(createMedicineSchema(tValidation)),
    defaultValues: {
      arName: "",
      enName: "",
      arDescription: "",
      enDescription: "",
      arIndications: "",
      enIndications: "",
      arAdministration: "",
      enAdministration: "",
      arContraindications: "",
      enContraindications: "",
      arMedicineDosages: "",
      enMedicineDosages: "",
      arNotes: "",
      enNotes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setCategorySearch("");
      setCategoryLimit(PAGE_SIZE);
    }
  }, [isOpen, reset]);

  const currentCategoryId = watch("categoryId");

  const categoryOptions: SearchSelectOption[] = medicineCategories.map((c) => ({
    value: c.id,
    label: locale === "ar" ? c.arName : c.enName,
    sublabel: locale === "ar" ? c.enName : c.arName,
  }));

  const handleFormSubmit = (data: CreateMedicineFormData) => {
    createMedicineMutate(data, { onSuccess: () => onClose() });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("addTitle")}
      submitText={createMedicinePending ? t("saving") : t("save")}
      cancelText={t("cancel")}
      isLoading={createMedicinePending}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("arName")}
            type="text"
            registration={register("arName")}
            error={errors.arName?.message}
            disabled={createMedicinePending}
          />
          <FormField
            label={t("enName")}
            type="text"
            registration={register("enName")}
            error={errors.enName?.message}
            disabled={createMedicinePending}
          />
        </div>
        <SearchSelect
          label={t("category")}
          placeholder={t("categoryPlaceholder")}
          searchPlaceholder={t("categorySearchPlaceholder")}
          value={currentCategoryId ?? null}
          onChange={(val) => setValue("categoryId", val as number, { shouldValidate: true })}
          options={categoryOptions}
          onSearch={setCategorySearch}
          hasMore={medicineCategories.length < totalCategories}
          onLoadMore={() => setCategoryLimit((l) => l + PAGE_SIZE)}
          showMoreLabel={t("showMore")}
          error={errors.categoryId?.message}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField label={t("arDescription")} registration={register("arDescription")} disabled={createMedicinePending} />
          <TextareaField label={t("enDescription")} registration={register("enDescription")} disabled={createMedicinePending} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField label={t("arIndications")} registration={register("arIndications")} disabled={createMedicinePending} />
          <TextareaField label={t("enIndications")} registration={register("enIndications")} disabled={createMedicinePending} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField label={t("arAdministration")} registration={register("arAdministration")} disabled={createMedicinePending} />
          <TextareaField label={t("enAdministration")} registration={register("enAdministration")} disabled={createMedicinePending} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField label={t("arContraindications")} registration={register("arContraindications")} disabled={createMedicinePending} />
          <TextareaField label={t("enContraindications")} registration={register("enContraindications")} disabled={createMedicinePending} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField label={t("arMedicineDosages")} registration={register("arMedicineDosages")} disabled={createMedicinePending} />
          <TextareaField label={t("enMedicineDosages")} registration={register("enMedicineDosages")} disabled={createMedicinePending} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField label={t("arNotes")} registration={register("arNotes")} disabled={createMedicinePending} />
          <TextareaField label={t("enNotes")} registration={register("enNotes")} disabled={createMedicinePending} />
        </div>
      </div>
    </FormModal>
  );
}
