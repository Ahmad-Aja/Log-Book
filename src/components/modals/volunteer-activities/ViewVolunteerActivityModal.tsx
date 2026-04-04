"use client";

import { useTranslations } from "next-intl";
import { MixedText } from "@/components/ui/MixedText";
import { ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { DetailViewGrid } from "@/components/ui/DetailViewGrid";
import { Button } from "@/components/ui/Button";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import {
  VolunteerActivity,
  VolunteerActivityStatus,
} from "@/types/http/volunteer-activity.types";

const activityStatusColor: Record<VolunteerActivityStatus, StatusBadgeColor> =
  {
    [VolunteerActivityStatus.PENDING]: "yellow",
    [VolunteerActivityStatus.APPROVED]: "green",
    [VolunteerActivityStatus.REJECTED]: "red",
  };

interface ViewVolunteerActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: VolunteerActivity | null;
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

export function ViewVolunteerActivityModal({
  isOpen,
  onClose,
  activity,
}: ViewVolunteerActivityModalProps) {
  const t = useTranslations("volunteerActivities.viewDetails");
  const tModal = useTranslations("volunteerActivities.modal");
  const tStatus = useTranslations("volunteerActivities.status");

  if (!activity) return null;

  const statusLabel = {
    [VolunteerActivityStatus.PENDING]: tStatus("pending"),
    [VolunteerActivityStatus.APPROVED]: tStatus("approved"),
    [VolunteerActivityStatus.REJECTED]: tStatus("rejected"),
  }[activity.status];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[720px] h-[95vh] flex flex-col"
    >
      <ModalHeader title={tModal("viewTitle")} onClose={onClose} sticky />

      <div className="overflow-y-auto flex-1 p-6 space-y-4">
        {/* Activity Info */}
        <Section title={t("activitySection")}>
          <DetailViewGrid
            fields={[
              {
                label: t("id"),
                value: <span className="font-mono">#{activity.id}</span>,
              },
              {
                label: t("status"),
                value: (
                  <StatusBadge
                    color={activityStatusColor[activity.status]}
                    label={statusLabel}
                  />
                ),
              },
              {
                label: t("activityDate"),
                value: new Date(activity.activityDate).toLocaleDateString(),
              },
              {
                label: t("createdAt"),
                value: new Date(activity.createdAt).toLocaleDateString(),
              },
            ]}
          />
        </Section>

        {/* Titles & Descriptions */}
        <Section title={t("titlesSection")}>
          <DetailViewGrid
            fields={[
              {
                label: t("arTitle"),
                value: <MixedText text={activity.arTitle} />,
              },
              {
                label: t("enTitle"),
                value: <MixedText text={activity.enTitle} />,
              },
              {
                label: t("arDescription"),
                value: <MixedText text={activity.arDescription} />,
                colSpan: 2,
                multiline: true,
                clamp: false,
              },
              {
                label: t("enDescription"),
                value: <MixedText text={activity.enDescription} />,
                colSpan: 2,
                multiline: true,
                clamp: false,
              },
            ]}
          />
        </Section>

        {/* Student */}
        <Section title={t("studentSection")}>
          <DetailViewGrid
            fields={[
              {
                label: t("studentFullName"),
                value: <MixedText text={activity.student.fullName} />,
              },
              {
                label: t("studentUniversityId"),
                value: activity.student.universityId,
              },
              {
                label: t("studentPhone"),
                value: activity.student.phone,
              },
            ]}
          />
        </Section>

        {/* Supervisor */}
        <Section title={t("supervisorSection")}>
          <DetailViewGrid
            fields={[
              {
                label: t("supervisorFullName"),
                value: <MixedText text={activity.supervisor.fullName} />,
              },
              {
                label: t("supervisorUsername"),
                value: activity.supervisor.username,
              },
              {
                label: t("supervisorPhone"),
                value: activity.supervisor.phone,
              },
            ]}
          />
        </Section>

        {/* Images */}
        {activity.images && activity.images.length > 0 && (
          <Section title={t("imagesSection")}>
            <div className="p-4 space-y-2">
              {activity.images.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{url}</span>
                </a>
              ))}
            </div>
          </Section>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" className="px-5" onClick={onClose}>
          {tModal("close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
