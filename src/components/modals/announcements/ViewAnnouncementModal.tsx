"use client";

import { useTranslations } from "next-intl";
import { MixedText } from "@/components/ui/MixedText";
import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { DetailViewGrid } from "@/components/ui/DetailViewGrid";
import { Button } from "@/components/ui/Button";
import {
  Announcement,
  AnnouncementTargetAudience,
} from "@/types/http/announcement.types";

interface ViewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

export function ViewAnnouncementModal({
  isOpen,
  onClose,
  announcement,
}: ViewAnnouncementModalProps) {
  const t = useTranslations("announcements.viewDetails");
  const tModal = useTranslations("announcements.modal");
  const tAudience = useTranslations("announcements.targetAudience");

  if (!announcement) return null;

  const audienceLabel = {
    [AnnouncementTargetAudience.STUDENTS]: tAudience("students"),
    [AnnouncementTargetAudience.SUPERVISORS]: tAudience("supervisors"),
    [AnnouncementTargetAudience.ALL]: tAudience("all"),
  }[announcement.targetAudience];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[680px] max-h-[90vh] flex flex-col"
    >
      <ModalHeader title={tModal("viewTitle")} onClose={onClose} sticky />

      <div className="overflow-y-auto flex-1 p-2 space-y-4">
        <DetailViewGrid
          fields={[
            { label: t("type"), value: <MixedText text={announcement.type} /> },
            { label: t("targetAudience"), value: audienceLabel },
            {
              label: t("createdBy"),
              value: (
                <MixedText text={announcement.createdBy?.fullName ?? "—"} />
              ),
              colSpan: 2,
            },
            {
              label: t("title"),
              value: <MixedText text={announcement.title} />,
              colSpan: 2,
              multiline: true,
              clamp: false,
            },
            {
              label: t("content"),
              value: <MixedText text={announcement.content} />,
              colSpan: 2,
              multiline: true,
              clamp: false,
            },
          ]}
        />
      </div>

      <ModalFooter>
        <Button variant="secondary" className="px-5" onClick={onClose}>
          {tModal("close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
