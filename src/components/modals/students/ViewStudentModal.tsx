"use client";

import { useTranslations } from "next-intl";
import { Student, StudentStatus } from "@/types/http/student.types";
import { StatusBadge, StatusBadgeColor } from "../../ui/StatusBadge";

const studentStatusColor: Record<StudentStatus, StatusBadgeColor> = {
  [StudentStatus.ACTIVE]: "green",
  [StudentStatus.PENDING]: "yellow",
  [StudentStatus.REJECTED]: "red",
  [StudentStatus.SUSPENDED]: "gray",
  [StudentStatus.GRADUATED]: "blue",
  [StudentStatus.WITHDRAWN]: "orange",
};
import { DetailViewModal } from "../../ui/DetailViewModal";
import { MixedText } from "@/components/ui/MixedText";

interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export function ViewStudentModal({
  isOpen,
  onClose,
  student,
}: ViewStudentModalProps) {
  const t = useTranslations("students.viewModal");
  const tCommon = useTranslations("students.modal");
  const tStatus = useTranslations("students.status");

  if (!student) return null;

  const fields = [
    {
      label: tCommon("universityId"),
      value: student.universityId,
    },
    {
      label: tCommon("fullName"),
      value: <MixedText text={student.fullName} />,
      colSpan: 2 as const,
    },
    {
      label: tCommon("phone"),
      value: student.phone,
      className: "ltr:font-mono",
    },
    {
      label: tCommon("status"),
      value: (
        <StatusBadge
          color={studentStatusColor[student.status]}
          label={tStatus(student.status.toLowerCase())}
          size="md"
        />
      ),
    },
  ];

  if (student.blockedAt) {
    fields.push({
      label: "Blocked At",
      value: new Date(student.blockedAt).toLocaleString(),
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
      showImage={true}
      imageUrl={student.imageUrl}
      imageAlt={student.fullName}
      noImageText={t("noImage")}
      fields={fields}
    />
  );
}
