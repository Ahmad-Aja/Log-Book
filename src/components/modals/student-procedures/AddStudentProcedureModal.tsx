"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { FormModal } from "@/components/ui/FormModal";
import { TextareaField } from "@/components/forms/TextareaField";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { SearchSelect, SearchSelectOption } from "@/components/ui/SearchSelect";
import { useCreateStudentProcedure } from "@/hooks/http/useStudentProcedures";
import { useStudents } from "@/hooks/http/useStudents";
import { useProcedures } from "@/hooks/http/useProcedures";
import { useSupervisors } from "@/hooks/http/useSupervisors";
import {
  createStudentProcedureSchema,
  CreateStudentProcedureFormData,
  CreateStudentProcedureFormInput,
} from "@/lib/validations/student-procedure.schema";
import { APP_CONFIG } from "@/constants/app-config";

const PAGE_SIZE = 20;

interface AddStudentProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddStudentProcedureModal({ isOpen, onClose }: AddStudentProcedureModalProps) {
  const t = useTranslations("studentProcedures.modal");
  const tValidation = useTranslations("validation");
  const locale = useLocale();

  const { createStudentProcedureMutate, createStudentProcedurePending } = useCreateStudentProcedure();

  const [studentSearch, setStudentSearch] = useState("");
  const [studentLimit, setStudentLimit] = useState(PAGE_SIZE);
  const [procedureSearch, setProcedureSearch] = useState("");
  const [procedureLimit, setProcedureLimit] = useState(PAGE_SIZE);
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [supervisorLimit, setSupervisorLimit] = useState(PAGE_SIZE);

  const { students, pagination: studentPag } = useStudents({ fullName: studentSearch || undefined, page: 1, limit: studentLimit });
  const { procedures, pagination: procedurePag } = useProcedures({ nameSearch: procedureSearch || undefined, page: 1, limit: procedureLimit });
  const { supervisors, pagination: supervisorPag } = useSupervisors({ fullName: supervisorSearch || undefined, page: 1, limit: supervisorLimit });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateStudentProcedureFormInput, unknown, CreateStudentProcedureFormData>({
    resolver: zodResolver(createStudentProcedureSchema(tValidation)),
    defaultValues: {
      studentId: undefined,
      procedureId: undefined,
      supervisorId: undefined,
      evaluationScore: undefined,
      supervisorNote: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setStudentSearch("");
      setStudentLimit(PAGE_SIZE);
      setProcedureSearch("");
      setProcedureLimit(PAGE_SIZE);
      setSupervisorSearch("");
      setSupervisorLimit(PAGE_SIZE);
    }
  }, [isOpen, reset]);

  const evaluationScore = watch("evaluationScore") as number | undefined;
  const studentId = watch("studentId") as number | undefined;
  const procedureId = watch("procedureId") as number | undefined;
  const supervisorId = watch("supervisorId") as number | undefined;

  const studentOptions: SearchSelectOption[] = students.map((s) => ({
    value: s.id,
    label: s.fullName,
    sublabel: s.universityId,
  }));

  const procedureOptions: SearchSelectOption[] = procedures.map((p) => ({
    value: p.id,
    label: locale === "ar" ? p.arName : p.enName,
    sublabel: locale === "ar" ? p.enName : p.arName,
  }));

  const supervisorOptions: SearchSelectOption[] = supervisors.map((s) => ({
    value: s.id,
    label: s.fullName,
    sublabel: s.username,
  }));

  const scoreOptions = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }));

  const handleFormSubmit = (data: CreateStudentProcedureFormData) => {
    createStudentProcedureMutate(
      {
        studentId: data.studentId,
        procedureId: data.procedureId,
        supervisorId: data.supervisorId,
        evaluationScore: data.evaluationScore,
        supervisorNote: data.supervisorNote || undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("addTitle")}
      submitText={createStudentProcedurePending ? t("adding") : t("add")}
      cancelText={t("cancel")}
      isLoading={createStudentProcedurePending}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchSelect
          label={t("studentId")}
          placeholder={t("studentIdPlaceholder")}
          searchPlaceholder={t("searchStudentPlaceholder")}
          value={studentId ?? null}
          onChange={(val) => setValue("studentId", val as number, { shouldValidate: true })}
          options={studentOptions}
          onSearch={setStudentSearch}
          hasMore={students.length < (studentPag?.total ?? 0)}
          onLoadMore={() => setStudentLimit((l) => l + PAGE_SIZE)}
          showMoreLabel={t("showMore")}
          error={errors.studentId?.message}
        />
        <SearchSelect
          label={t("procedureId")}
          placeholder={t("procedureIdPlaceholder")}
          searchPlaceholder={t("searchProcedurePlaceholder")}
          value={procedureId ?? null}
          onChange={(val) => setValue("procedureId", val as number, { shouldValidate: true })}
          options={procedureOptions}
          onSearch={setProcedureSearch}
          hasMore={procedures.length < (procedurePag?.total ?? 0)}
          onLoadMore={() => setProcedureLimit((l) => l + PAGE_SIZE)}
          showMoreLabel={t("showMore")}
          error={errors.procedureId?.message}
        />
        <SearchSelect
          label={t("supervisorId")}
          placeholder={t("supervisorIdPlaceholder")}
          searchPlaceholder={t("searchSupervisorPlaceholder")}
          value={supervisorId ?? null}
          onChange={(val) => setValue("supervisorId", val as number, { shouldValidate: true })}
          options={supervisorOptions}
          onSearch={setSupervisorSearch}
          hasMore={supervisors.length < (supervisorPag?.total ?? 0)}
          onLoadMore={() => setSupervisorLimit((l) => l + PAGE_SIZE)}
          showMoreLabel={t("showMore")}
          error={errors.supervisorId?.message}
        />
        <StatusDropdown
          label={t("evaluationScore")}
          placeholder={t("evaluationScorePlaceholder")}
          value={evaluationScore !== undefined ? String(evaluationScore) : ""}
          onChange={(val) => setValue("evaluationScore", val ? Number(val) : (undefined as unknown as number))}
          options={scoreOptions}
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
