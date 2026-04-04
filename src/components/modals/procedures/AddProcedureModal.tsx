"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../forms/FormField";
import { TextareaField } from "../../forms/TextareaField";
import { FormModal } from "../../ui/FormModal";
import { useTranslations } from "next-intl";
import { useCreateProcedure } from "@/hooks/http/useProcedures";
import {
  createProcedureSchema,
  CreateProcedureFormData,
} from "@/lib/validations/procedure.schema";

type FormData = CreateProcedureFormData;

interface AddProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProcedureModal({ isOpen, onClose }: AddProcedureModalProps) {
  const t = useTranslations("procedures.modal");
  const tValidation = useTranslations("validation");

  const { createProcedureMutate, createProcedurePending } =
    useCreateProcedure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createProcedureSchema(tValidation)),
    defaultValues: {
      arName: "",
      enName: "",
      arDescription: "",
      enDescription: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: FormData) => {
    createProcedureMutate(
      {
        arName: data.arName,
        enName: data.enName,
        arDescription: data.arDescription || undefined,
        enDescription: data.enDescription || undefined,
        minimumRequired:
          data.minimumRequired !== undefined && !isNaN(data.minimumRequired)
            ? data.minimumRequired
            : undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("title")}
      description={t("description")}
      submitText={t("add")}
      cancelText={t("cancel")}
      isLoading={createProcedurePending}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={t("arName")}
          placeholder={t("arNamePlaceholder")}
          type="text"
          registration={register("arName")}
          error={errors.arName?.message}
          disabled={createProcedurePending}
        />

        <FormField
          label={t("enName")}
          placeholder={t("enNamePlaceholder")}
          type="text"
          registration={register("enName")}
          error={errors.enName?.message}
          disabled={createProcedurePending}
        />
      </div>

      <div className="mt-4">
        <TextareaField
          label={t("arDescription")}
          placeholder={t("arDescriptionPlaceholder")}
          registration={register("arDescription")}
          error={errors.arDescription?.message}
          disabled={createProcedurePending}
        />
      </div>

      <div className="mt-4">
        <TextareaField
          label={t("enDescription")}
          placeholder={t("enDescriptionPlaceholder")}
          registration={register("enDescription")}
          error={errors.enDescription?.message}
          disabled={createProcedurePending}
        />
      </div>

      <div className="mt-4 w-1/2 ltr:pr-2 rtl:pl-2">
        <FormField
          label={t("minimumRequired")}
          placeholder={t("minimumRequiredPlaceholder")}
          type="number"
          registration={register("minimumRequired", { valueAsNumber: true })}
          error={errors.minimumRequired?.message}
          disabled={createProcedurePending}
        />
      </div>
    </FormModal>
  );
}
