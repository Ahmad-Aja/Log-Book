"use client";

import { useTranslations } from "next-intl";
import { MixedText } from "@/components/ui/MixedText";
import { ExternalLink } from "lucide-react";
import { ImageSlider } from "@/components/ui/ImageSlider";
import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { DetailViewGrid } from "@/components/ui/DetailViewGrid";
import { Button } from "@/components/ui/Button";
import {
  MedicalCase,
  MedicalCaseStatus,
  MedicalCasePublisherRole,
} from "@/types/http/medical-case.types";

const caseStatusColor: Record<MedicalCaseStatus, StatusBadgeColor> = {
  [MedicalCaseStatus.PENDING]: "yellow",
  [MedicalCaseStatus.APPROVED]: "green",
  [MedicalCaseStatus.REJECTED]: "red",
};

interface ViewMedicalCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalCase: MedicalCase | null;
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

export function ViewMedicalCaseModal({
  isOpen,
  onClose,
  medicalCase,
}: ViewMedicalCaseModalProps) {
  const t = useTranslations("medicalCases.viewDetails");
  const tModal = useTranslations("medicalCases.modal");
  const tStatus = useTranslations("medicalCases.status");
  const tRole = useTranslations("medicalCases.publisherRole");

  if (!medicalCase) return null;

  const statusLabel = {
    [MedicalCaseStatus.PENDING]: tStatus("pending"),
    [MedicalCaseStatus.APPROVED]: tStatus("approved"),
    [MedicalCaseStatus.REJECTED]: tStatus("rejected"),
  }[medicalCase.status];

  const roleLabel = {
    [MedicalCasePublisherRole.STUDENT]: tRole("student"),
    [MedicalCasePublisherRole.SUPERVISOR]: tRole("supervisor"),
    [MedicalCasePublisherRole.ADMIN]: tRole("admin"),
  }[medicalCase.publisherRole];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[720px] max-h-[90vh] flex flex-col"
    >
      <ModalHeader title={tModal("viewTitle")} onClose={onClose} sticky />

      <div className="overflow-y-auto flex-1 p-2 space-y-4">
        {/* Case Info */}
        <Section title={t("caseSection")}>
          <DetailViewGrid
            fields={[
              {
                label: t("status"),
                value: (
                  <StatusBadge
                    color={caseStatusColor[medicalCase.status]}
                    label={statusLabel}
                  />
                ),
              },
              { label: t("publisherRole"), value: roleLabel },
              {
                label: t("caseDate"),
                value: new Date(medicalCase.caseDate).toLocaleDateString(),
              },
              {
                label: t("hospital"),
                value: medicalCase.hospital ? (
                  <MixedText text={medicalCase.hospital} />
                ) : (
                  <span className="text-gray-400 italic">{t("noHospital")}</span>
                ),
                colSpan: 2,
              },
              {
                label: t("title"),
                value: <MixedText text={medicalCase.title} />,
                colSpan: 2,
                multiline: true,
                clamp: false,
              },
              {
                label: t("description"),
                value: <MixedText text={medicalCase.description} />,
                colSpan: 2,
                multiline: true,
                clamp: false,
              },
            ]}
          />
        </Section>

        {/* Images */}
        {medicalCase.images && medicalCase.images.length > 0 && (
          <Section title={t("images")}>
            <div className="p-4">
              <ImageSlider images={medicalCase.images} />
            </div>
          </Section>
        )}

        {/* URLs */}
        {medicalCase.urls && medicalCase.urls.length > 0 && (
          <Section title={t("urls")}>
            <div className="p-4 space-y-2">
              {medicalCase.urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <MixedText text={url} />
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Contributors */}
        {medicalCase.contributors && medicalCase.contributors.length > 0 && (
          <Section title={t("contributors")}>
            <div className="p-4 flex flex-wrap gap-2">
              {medicalCase.contributors.map((name, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  <MixedText text={name} />
                </span>
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
