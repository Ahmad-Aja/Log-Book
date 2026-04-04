"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FormModal } from "@/components/ui/FormModal";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { TextareaField } from "@/components/forms/TextareaField";
import { useUpdateStudentProcedure } from "@/hooks/http/useStudentProcedures";
import {
  updateStudentProcedureSchema,
  UpdateStudentProcedureFormData,
  UpdateStudentProcedureFormInput,
} from "@/lib/validations/student-procedure.schema";
import { StudentProcedure } from "@/types/http/student-procedure.types";

interface EditStudentProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentProcedure | null;
}

function mapToFormData(record: StudentProcedure): UpdateStudentProcedureFormInput {
  return {
    status: record.status === "PENDING" ? undefined : (record.status as "APPROVED" | "REJECTED"),
    evaluationScore: record.evaluationScore,
    supervisorNote: record.supervisorNote ?? "",
  };
}

export function EditStudentProcedureModal({
  isOpen,
  onClose,
  record,
}: EditStudentProcedureModalProps) {
  const t = useTranslations("studentProcedures.modal");
  const tValidation = useTranslations("validation");

  const { updateStudentProcedureMutate, updateStudentProcedurePending } =
    useUpdateStudentProcedure();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateStudentProcedureFormInput, unknown, UpdateStudentProcedureFormData>({
    resolver: zodResolver(updateStudentProcedureSchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen && record) reset(mapToFormData(record));
  }, [isOpen, record, reset]);

  const statusOptions = [
    { value: "APPROVED", label: t("statusApproved") },
    { value: "REJECTED", label: t("statusRejected") },
  ];

  const scoreOptions = [1, 2, 3, 4, 5].map((n) => ({
    value: String(n),
    label: String(n),
  }));

  const currentStatus = watch("status");
  const currentScore = watch("evaluationScore");

  const handleFormSubmit = (data: UpdateStudentProcedureFormData) => {
    if (!record) return;
    updateStudentProcedureMutate(
      { id: record.id, dto: data },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("editTitle")}
      submitText={updateStudentProcedurePending ? t("saving") : t("save")}
      cancelText={t("cancel")}
      isLoading={updateStudentProcedurePending}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusDropdown
          label={t("status")}
          placeholder={t("statusPlaceholder")}
          value={currentStatus ?? ""}
          onChange={(val) =>
            setValue("status", (val as "APPROVED" | "REJECTED") || undefined)
          }
          options={statusOptions}
          showAllOption={true}
          allOptionLabel={t("statusKeep")}
          error={errors.status?.message}
        />
        <StatusDropdown
          label={t("evaluationScore")}
          placeholder={t("evaluationScorePlaceholder")}
          value={currentScore !== undefined ? String(currentScore) : ""}
          onChange={(val) =>
            setValue(
              "evaluationScore",
              val ? (Number(val) as unknown as undefined) : undefined,
            )
          }
          options={scoreOptions}
          showAllOption={true}
          allOptionLabel={t("scoreKeep")}
          error={errors.evaluationScore?.message}
        />
        <div className="md:col-span-2">
          <TextareaField
            label={t("supervisorNote")}
            placeholder={t("supervisorNotePlaceholder")}
            registration={register("supervisorNote")}
            rows={3}
          />
        </div>
      </div>
    </FormModal>
  );
}
