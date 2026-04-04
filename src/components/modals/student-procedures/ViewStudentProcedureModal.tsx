"use client";

import { useTranslations } from "next-intl";
import { MixedText } from "@/components/ui/MixedText";
import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DetailViewGrid } from "@/components/ui/DetailViewGrid";
import { Button } from "@/components/ui/Button";
import {
  StudentProcedure,
  StudentProcedureStatus,
} from "@/types/http/student-procedure.types";
import { StatusBadgeColor } from "@/components/ui/StatusBadge";

const procedureStatusColor: Record<StudentProcedureStatus, StatusBadgeColor> = {
  [StudentProcedureStatus.PENDING]: "yellow",
  [StudentProcedureStatus.APPROVED]: "green",
  [StudentProcedureStatus.REJECTED]: "red",
};

interface ViewStudentProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentProcedure | null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function ViewStudentProcedureModal({
  isOpen,
  onClose,
  record,
}: ViewStudentProcedureModalProps) {
  const t = useTranslations("studentProcedures.viewDetails");
  const tModal = useTranslations("studentProcedures.modal");
  const tStatus = useTranslations("studentProcedures.status");

  if (!record) return null;

  const statusLabel = {
    [StudentProcedureStatus.PENDING]: tStatus("pending"),
    [StudentProcedureStatus.APPROVED]: tStatus("approved"),
    [StudentProcedureStatus.REJECTED]: tStatus("rejected"),
  }[record.status];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[680px] max-h-[90vh] flex flex-col"
    >
      <ModalHeader title={tModal("viewTitle")} onClose={onClose} sticky />

      <div className="overflow-y-auto flex-1 p-6 space-y-4">
        {/* Record Info */}
        <Section title={t("recordSection")}>
          <DetailViewGrid
            fields={[
              { label: t("id"), value: <span className="font-mono">#{record.id}</span> },
              { label: t("status"), value: <StatusBadge color={procedureStatusColor[record.status]} label={statusLabel} /> },
              { label: t("evaluationScore"), value: <span className="font-semibold text-wheat">{record.evaluationScore} / 5</span> },
              { label: t("createdAt"), value: new Date(record.createdAt).toLocaleDateString() },
              ...(record.supervisorNote
                ? [{ label: t("supervisorNote"), value: <MixedText text={record.supervisorNote} />, colSpan: 2 as const, multiline: true }]
                : []),
            ]}
          />
        </Section>

        {/* Procedure */}
        <Section title={t("procedureSection")}>
          <DetailViewGrid
            fields={[
              { label: t("arName"), value: <MixedText text={record.procedure.arName} /> },
              { label: t("enName"), value: <MixedText text={record.procedure.enName} /> },
              { label: t("minimumRequired"), value: record.procedure.minimumRequired },
            ]}
          />
        </Section>

        {/* Student */}
        <Section title={t("studentSection")}>
          <DetailViewGrid
            fields={[
              { label: t("fullName"), value: <MixedText text={record.student.fullName} /> },
              { label: t("universityId"), value: record.student.universityId },
              { label: t("phone"), value: record.student.phone },
            ]}
          />
        </Section>

        {/* Supervisor */}
        <Section title={t("supervisorSection")}>
          <DetailViewGrid
            fields={[
              { label: t("fullName"), value: <MixedText text={record.supervisor.fullName} /> },
              { label: t("username"), value: record.supervisor.username },
              { label: t("phone"), value: record.supervisor.phone },
            ]}
          />
        </Section>

        {/* Admin */}
        <Section title={t("adminSection")}>
          {record.admin ? (
            <DetailViewGrid
              fields={[
                { label: t("fullName"), value: <MixedText text={record.admin.fullName} /> },
              ]}
            />
          ) : (
            <p className="p-4 text-sm text-gray-400 italic">
              {t("notReviewedByAdmin")}
            </p>
          )}
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
