"use client";

import { useTranslations } from "next-intl";
import { Procedure } from "@/types/http/procedure.types";
import { DetailViewModal } from "../../ui/DetailViewModal";
import { MixedText } from "@/components/ui/MixedText";

interface ViewProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure: Procedure | null;
}

export function ViewProcedureModal({
  isOpen,
  onClose,
  procedure,
}: ViewProcedureModalProps) {
  const t = useTranslations("procedures.viewModal");
  const tStatus = useTranslations("procedures.status");

  if (!procedure) return null;

  const isEnabled = !procedure.disabledAt;

  const fields = [
    {
      label: t("arName"),
      value: procedure.arName,
      fullWidth: true,
    },
    {
      label: t("enName"),
      value: procedure.enName,
      fullWidth: true,
    },
    {
      label: t("minimumRequired"),
      value: String(procedure.minimumRequired),
    },
    {
      label: t("status"),
      value: (
        <span
          className={`inline-flex items-center rounded-md font-medium border px-3 py-1 text-sm ${
            isEnabled
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-gray-100 text-gray-800 border-gray-200"
          }`}
        >
          {tStatus(isEnabled ? "enabled" : "disabled")}
        </span>
      ),
    },
  ];

  if (procedure.arDescription) {
    fields.push({
      label: t("arDescription"),
      value: procedure.arDescription,
      fullWidth: true,
      multiline: true,
      clamp: false,
    } as any);
  }

  if (procedure.enDescription) {
    fields.push({
      label: t("enDescription"),
      value: procedure.enDescription,
      fullWidth: true,
      multiline: true,
      clamp: false,
    } as any);
  }

  if (procedure.disabledAt) {
    fields.push({
      label: t("disabledAt"),
      value: new Date(procedure.disabledAt).toLocaleString(),
      fullWidth: true,
      variant: "danger",
    } as any);
  }

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
