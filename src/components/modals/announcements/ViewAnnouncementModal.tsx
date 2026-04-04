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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  );
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

      <div className="overflow-y-auto flex-1 p-6 space-y-4">
        {/* Meta Info */}
        <Section title={t("title")}>
          <DetailViewGrid
            fields={[
              {
                label: t("id"),
                value: (
                  <span className="font-mono">#{announcement.id}</span>
                ),
              },
              { label: t("type"), value: announcement.type },
              { label: t("targetAudience"), value: audienceLabel },
              {
                label: t("createdBy"),
                value: <MixedText text={announcement.createdBy?.fullName ?? "—"} />,
              },
              {
                label: t("createdAt"),
                value: new Date(announcement.createdAt).toLocaleDateString(),
              },
              {
                label: t("updatedAt"),
                value: new Date(announcement.updatedAt).toLocaleDateString(),
              },
            ]}
          />
        </Section>

        {/* Title */}
        <Section title={t("title")}>
          <div className="p-4">
            <p className="text-sm font-semibold text-gray-900">
              <MixedText text={announcement.title} />
            </p>
          </div>
        </Section>

        {/* Content */}
        <Section title={t("content")}>
          <div className="p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              <MixedText text={announcement.content} />
            </p>
          </div>
        </Section>
      </div>

      <ModalFooter>
        <Button variant="secondary" className="px-5" onClick={onClose}>
          {tModal("close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
