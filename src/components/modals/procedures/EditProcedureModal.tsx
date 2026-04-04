"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../forms/FormField";
import { TextareaField } from "../../forms/TextareaField";
import { FormModal } from "../../ui/FormModal";
import { useTranslations } from "next-intl";
import { Procedure } from "@/types/http/procedure.types";
import { useUpdateProcedure } from "@/hooks/http/useProcedures";
import {
  updateProcedureSchema,
  UpdateProcedureFormData,
} from "@/lib/validations/procedure.schema";

type FormData = UpdateProcedureFormData;

interface EditProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure: Procedure | null;
}

export function EditProcedureModal({
  isOpen,
  onClose,
  procedure,
}: EditProcedureModalProps) {
  const t = useTranslations("procedures.editModal");
  const tModal = useTranslations("procedures.modal");
  const tValidation = useTranslations("validation");

  const { updateProcedureMutate, updateProcedurePending } =
    useUpdateProcedure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(updateProcedureSchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen && procedure) {
      reset({
        arName: procedure.arName,
        enName: procedure.enName,
        arDescription: procedure.arDescription || "",
        enDescription: procedure.enDescription || "",
        minimumRequired: procedure.minimumRequired,
      });
    }
  }, [isOpen, procedure, reset]);

  const handleFormSubmit = (data: FormData) => {
    if (!procedure) return;

    updateProcedureMutate(
      {
        id: procedure.id,
        data: {
          arName: data.arName,
          enName: data.enName,
          arDescription: data.arDescription || undefined,
          enDescription: data.enDescription || undefined,
          minimumRequired:
            data.minimumRequired !== undefined && !isNaN(data.minimumRequired)
              ? data.minimumRequired
              : undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  if (!procedure) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("title")}
      description={t("description")}
      submitText={t("save")}
      cancelText={tModal("cancel")}
      isLoading={updateProcedurePending}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={tModal("arName")}
          placeholder={tModal("arNamePlaceholder")}
          type="text"
          registration={register("arName")}
          error={errors.arName?.message}
          disabled={updateProcedurePending}
        />

        <FormField
          label={tModal("enName")}
          placeholder={tModal("enNamePlaceholder")}
          type="text"
          registration={register("enName")}
          error={errors.enName?.message}
          disabled={updateProcedurePending}
        />
      </div>

      <div className="mt-4 w-1/2 ltr:pr-2 rtl:pl-2">
        <FormField
          label={tModal("minimumRequired")}
          placeholder={tModal("minimumRequiredPlaceholder")}
          type="number"
          registration={register("minimumRequired", { valueAsNumber: true })}
          error={errors.minimumRequired?.message}
          disabled={updateProcedurePending}
        />
      </div>

      <div className="mt-4">
        <TextareaField
          label={tModal("arDescription")}
          placeholder={tModal("arDescriptionPlaceholder")}
          registration={register("arDescription")}
          error={errors.arDescription?.message}
          disabled={updateProcedurePending}
        />
      </div>

      <div className="mt-4">
        <TextareaField
          label={tModal("enDescription")}
          placeholder={tModal("enDescriptionPlaceholder")}
          registration={register("enDescription")}
          error={errors.enDescription?.message}
          disabled={updateProcedurePending}
        />
      </div>
    </FormModal>
  );
}
