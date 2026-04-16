"use client";

import { useTranslations } from "next-intl";
import { MixedText } from "@/components/ui/MixedText";
import { MedicineCategory, MedicineCategoryStatus } from "@/types/http/medicine-category.types";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { DetailViewModal } from "@/components/ui/DetailViewModal";

const categoryStatusColor: Record<MedicineCategoryStatus, StatusBadgeColor> = {
  [MedicineCategoryStatus.PENDING]: "yellow",
  [MedicineCategoryStatus.APPROVED]: "green",
  [MedicineCategoryStatus.REJECTED]: "red",
};

interface ViewMedicineCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: MedicineCategory | null;
}

export function ViewMedicineCategoryModal({
  isOpen,
  onClose,
  category,
}: ViewMedicineCategoryModalProps) {
  const t = useTranslations("medicineCategories.viewModal");
  const tModal = useTranslations("medicineCategories.modal");
  const tStatus = useTranslations("medicineCategories.status");

  if (!category) return null;

  const statusLabelMap: Record<MedicineCategoryStatus, string> = {
    [MedicineCategoryStatus.PENDING]: tStatus("pending"),
    [MedicineCategoryStatus.APPROVED]: tStatus("approved"),
    [MedicineCategoryStatus.REJECTED]: tStatus("rejected"),
  };

  const fields = [
    {
      label: tModal("arName"),
      value: <MixedText text={category.arName} />,
      colSpan: 2 as const,
    },
    {
      label: tModal("enName"),
      value: <MixedText text={category.enName} />,
      colSpan: 2 as const,
    },
    {
      label: tModal("status"),
      value: (
        <StatusBadge
          color={categoryStatusColor[category.status]}
          label={statusLabelMap[category.status]}
          size="md"
        />
      ),
    },
    ...(category.arDescription
      ? [
          {
            label: tModal("arDescription"),
            value: <MixedText text={category.arDescription} />,
            colSpan: 2 as const,
          },
        ]
      : []),
    ...(category.enDescription
      ? [
          {
            label: tModal("enDescription"),
            value: <MixedText text={category.enDescription} />,
            colSpan: 2 as const,
          },
        ]
      : []),
  ];

  return (
    <DetailViewModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      closeButtonText={t("close")}
      showImage={false}
      fields={fields}
    />
  );
}
