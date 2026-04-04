"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/forms/FormField";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { SearchSelect, SearchSelectOption } from "@/components/ui/SearchSelect";
import { useUpdateMedicine } from "@/hooks/http/useMedicines";
import { useMedicineCategories } from "@/hooks/http/useMedicineCategories";
import {
  updateMedicineSchema,
  UpdateMedicineFormData,
} from "@/lib/validations/medicine.schema";
import { Medicine } from "@/types/http/medicine.types";
import { MedicineCategoryStatus } from "@/types/http/medicine-category.types";

const PAGE_SIZE = 20;

interface EditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

function mapMedicineToFormData(medicine: Medicine): UpdateMedicineFormData {
  return {
    arName: medicine.arName,
    enName: medicine.enName,
    categoryId: medicine.categoryId,
    status:
      medicine.status === "PENDING"
        ? undefined
        : (medicine.status as "APPROVED" | "REJECTED"),
  };
}

export function EditMedicineModal({
  isOpen,
  onClose,
  medicine,
}: EditMedicineModalProps) {
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

  const { updateMedicineMutate, updateMedicinePending } = useUpdateMedicine();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateMedicineFormData>({
    resolver: zodResolver(updateMedicineSchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen && medicine) {
      reset(mapMedicineToFormData(medicine));
      setCategorySearch("");
      setCategoryLimit(PAGE_SIZE);
    }
  }, [isOpen, medicine, reset]);

  const currentCategoryId = watch("categoryId");
  const currentStatus = watch("status");

  const categoryOptions: SearchSelectOption[] = medicineCategories.map((c) => ({
    value: c.id,
    label: locale === "ar" ? c.arName : c.enName,
    sublabel: locale === "ar" ? c.enName : c.arName,
  }));

  const statusOptions = [
    { value: "APPROVED", label: t("statusApproved") },
    { value: "REJECTED", label: t("statusRejected") },
  ];

  const handleFormSubmit = (data: UpdateMedicineFormData) => {
    if (!medicine) return;
    updateMedicineMutate(
      { id: medicine.id, data },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("editTitle")}
      submitText={updateMedicinePending ? t("saving") : t("save")}
      cancelText={t("cancel")}
      isLoading={updateMedicinePending}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("arName")}
            type="text"
            registration={register("arName")}
            error={errors.arName?.message}
            disabled={updateMedicinePending}
          />
          <FormField
            label={t("enName")}
            type="text"
            registration={register("enName")}
            error={errors.enName?.message}
            disabled={updateMedicinePending}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>
    </FormModal>
  );
}
