"use client";

import { useTranslations } from "next-intl";
import { Supervisor, SupervisorStatus } from "@/types/http/supervisor.types";
import { StatusBadge, StatusBadgeColor } from "../../ui/StatusBadge";

const supervisorStatusColor: Record<SupervisorStatus, StatusBadgeColor> = {
  [SupervisorStatus.ACTIVE]: "green",
  [SupervisorStatus.PENDING]: "yellow",
  [SupervisorStatus.REJECTED]: "red",
  [SupervisorStatus.SUSPENDED]: "gray",
  [SupervisorStatus.RETIRED]: "gray",
};
import { DetailViewModal } from "../../ui/DetailViewModal";
import { MixedText } from "@/components/ui/MixedText";

interface ViewSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervisor: Supervisor | null;
}

export function ViewSupervisorModal({
  isOpen,
  onClose,
  supervisor,
}: ViewSupervisorModalProps) {
  const t = useTranslations("supervisors.viewModal");
  const tCommon = useTranslations("supervisors.modal");
  const tStatus = useTranslations("supervisors.status");

  if (!supervisor) return null;

  const fields = [
    {
      label: tCommon("username"),
      value: supervisor.username,
      colSpan: 2 as const,
    },
    {
      label: tCommon("fullName"),
      value: <MixedText text={supervisor.fullName} />,
      colSpan: 2 as const,
    },
    {
      label: tCommon("phone"),
      value: supervisor.phone,
      className: "ltr:font-mono",
    },
    {
      label: tCommon("status"),
      value: (
        <StatusBadge
          color={supervisorStatusColor[supervisor.status]}
          label={tStatus(supervisor.status.toLowerCase())}
          size="md"
        />
      ),
    },
  ];

  if (supervisor.blockedAt) {
    fields.push({
      label: t("blockedAt"),
      value: new Date(supervisor.blockedAt).toLocaleString(),
      fullWidth: true,
      variant: "danger",
    } as any);
  }

  if (supervisor.notes) {
    fields.push({
      label: t("notes"),
      value: <MixedText text={supervisor.notes} />,
      fullWidth: true,
    } as any);
  }

  return (
    <DetailViewModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      closeButtonText={t("close")}
      showImage={true}
      imageUrl={supervisor.imageUrl}
      imageAlt={supervisor.fullName}
      noImageText={t("noImage")}
      fields={fields}
    />
  );
}
