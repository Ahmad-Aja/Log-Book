"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { useUpdateProtocol } from "@/hooks/http/useProtocols";
import {
  updateProtocolSchema,
  UpdateProtocolFormData,
  UpdateProtocolFormInput,
} from "@/lib/validations/protocol.schema";
import { Protocol } from "@/types/http/protocol.types";

interface EditProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: Protocol | null;
}

function mapToFormData(protocol: Protocol): UpdateProtocolFormInput {
  return {
    arTitle: protocol.arTitle,
    enTitle: protocol.enTitle,
    arDescription: protocol.arDescription ?? "",
    enDescription: protocol.enDescription ?? "",
    status:
      protocol.status === "PENDING"
        ? undefined
        : (protocol.status as "APPROVED" | "REJECTED"),
  };
}

export function EditProtocolModal({
  isOpen,
  onClose,
  protocol,
}: EditProtocolModalProps) {
  const t = useTranslations("protocols.modal");
  const tValidation = useTranslations("validation");

  const { updateProtocolMutate, updateProtocolPending } = useUpdateProtocol();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProtocolFormInput, unknown, UpdateProtocolFormData>({
    resolver: zodResolver(updateProtocolSchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen && protocol) reset(mapToFormData(protocol));
  }, [isOpen, protocol, reset]);

  const currentStatus = watch("status");

  const statusOptions = [
    { value: "APPROVED", label: t("statusApproved") },
    { value: "REJECTED", label: t("statusRejected") },
  ];

  const handleFormSubmit = (data: UpdateProtocolFormData) => {
    if (!protocol) return;
    updateProtocolMutate(
      { id: protocol.id, dto: data },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("editTitle")}
      submitText={updateProtocolPending ? t("saving") : t("save")}
      cancelText={t("cancel")}
      isLoading={updateProtocolPending}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("arTitle")}
            type="text"
            registration={register("arTitle")}
            error={errors.arTitle?.message}
            disabled={updateProtocolPending}
          />
          <FormField
            label={t("enTitle")}
            type="text"
            registration={register("enTitle")}
            error={errors.enTitle?.message}
            disabled={updateProtocolPending}
          />
        </div>
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
        <TextareaField
          label={t("arDescription")}
          registration={register("arDescription")}
          error={errors.arDescription?.message}
          rows={3}
          disabled={updateProtocolPending}
        />
        <TextareaField
          label={t("enDescription")}
          registration={register("enDescription")}
          error={errors.enDescription?.message}
          rows={3}
          disabled={updateProtocolPending}
        />
      </div>
    </FormModal>
  );
}
