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

  const isAr = locale === "ar";

  const localizedOptional = (
    label: string,
    arValue: string | null,
    enValue: string | null,
    colSpan?: 2,
    multiline?: boolean,
  ) => {
    const value = isAr ? arValue : enValue;
    return value ? [{ label, value: <MixedText text={value} />, colSpan, multiline, clamp: false }] : [];
  };

  const fields = [
    { label: tModal("arName"), value: <MixedText text={medicine.arName} /> },
    { label: tModal("enName"), value: <MixedText text={medicine.enName} /> },
    {
      label: tModal("category"),
      value: (
        <MixedText text={isAr ? medicine.category.arName : medicine.category.enName} />
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
    ...localizedOptional(tModal("description"), medicine.arDescription, medicine.enDescription, 2, true),
    ...localizedOptional(tModal("indications"), medicine.arIndications, medicine.enIndications, 2, true),
    ...localizedOptional(tModal("administration"), medicine.arAdministration, medicine.enAdministration, 2, true),
    ...localizedOptional(tModal("contraindications"), medicine.arContraindications, medicine.enContraindications, 2, true),
    ...localizedOptional(tModal("medicineDosages"), medicine.arMedicineDosages, medicine.enMedicineDosages, 2, true),
    ...localizedOptional(tModal("notes"), medicine.arNotes, medicine.enNotes, 2, true),
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
