"use client";

import { useTranslations, useLocale } from "next-intl";
import { MixedText } from "@/components/ui/MixedText";
import { Medicine, MedicineStatus } from "@/types/http/medicine.types";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { DetailViewModal } from "@/components/ui/DetailViewModal";

const medicineStatusColor: Record<MedicineStatus, StatusBadgeColor> = {
  [MedicineStatus.PENDING]: "yellow",
  [MedicineStatus.APPROVED]: "green",
  [MedicineStatus.REJECTED]: "red",
};

interface ViewMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export function ViewMedicineModal({
  isOpen,
  onClose,
  medicine,
}: ViewMedicineModalProps) {
  const t = useTranslations("medicines.viewModal");
  const tModal = useTranslations("medicines.modal");
  const tStatus = useTranslations("medicines.status");
  const locale = useLocale();

  if (!medicine) return null;

  const statusLabelMap: Record<MedicineStatus, string> = {
    [MedicineStatus.PENDING]: tStatus("pending"),
    [MedicineStatus.APPROVED]: tStatus("approved"),
    [MedicineStatus.REJECTED]: tStatus("rejected"),
  };

  const fields = [
    { label: tModal("arName"), value: <MixedText text={medicine.arName} /> },
    { label: tModal("enName"), value: <MixedText text={medicine.enName} /> },
    {
      label: tModal("category"),
      value: (
        <MixedText text={locale === "ar" ? medicine.category.arName : medicine.category.enName} />
      ),
    },
    {
      label: tModal("status"),
      value: (
        <StatusBadge
          color={medicineStatusColor[medicine.status]}
          label={statusLabelMap[medicine.status]}
          size="md"
        />
      ),
    },
    ...(medicine.arDescription
      ? [
          {
            label: tModal("arDescription"),
            value: <MixedText text={medicine.arDescription} />,
            colSpan: 2 as const,
          },
        ]
      : []),
    ...(medicine.enDescription
      ? [
          {
            label: tModal("enDescription"),
            value: <MixedText text={medicine.enDescription} />,
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
