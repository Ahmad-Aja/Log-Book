"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { useCreateAnnouncement } from "@/hooks/http/useAnnouncements";
import {
  createAnnouncementSchema,
  CreateAnnouncementFormData,
} from "@/lib/validations/announcement.schema";
import { AnnouncementTargetAudience } from "@/types/http/announcement.types";

interface AddAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAnnouncementModal({
  isOpen,
  onClose,
}: AddAnnouncementModalProps) {
  const t = useTranslations("announcements.modal");
  const tValidation = useTranslations("validation");

  const { createAnnouncementMutate, createAnnouncementPending } =
    useCreateAnnouncement();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAnnouncementFormData>({
    resolver: zodResolver(createAnnouncementSchema(tValidation)),
    defaultValues: { title: "", content: "", type: "" },
  });

  const targetAudience = watch("targetAudience");

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const audienceOptions = [
    { value: AnnouncementTargetAudience.STUDENTS, label: t("targetStudents") },
    {
      value: AnnouncementTargetAudience.SUPERVISORS,
      label: t("targetSupervisors"),
    },
    { value: AnnouncementTargetAudience.ALL, label: t("targetAll") },
  ];

  const handleFormSubmit = (data: CreateAnnouncementFormData) => {
    createAnnouncementMutate(
      {
        title: data.title,
        content: data.content,
        type: data.type,
        targetAudience: data.targetAudience,
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
      submitText={createAnnouncementPending ? t("adding") : t("add")}
      cancelText={t("cancel")}
      isLoading={createAnnouncementPending}
    >
      <div className="space-y-4">
        <FormField
          label={t("title")}
          placeholder={t("titlePlaceholder")}
          error={errors.title?.message}
          registration={register("title")}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("type")}
            placeholder={t("typePlaceholder")}
            error={errors.type?.message}
            registration={register("type")}
          />
          <StatusDropdown
            label={t("targetAudience")}
            placeholder={t("targetAudiencePlaceholder")}
            value={targetAudience ?? ""}
            onChange={(val) =>
              setValue(
                "targetAudience",
                val as AnnouncementTargetAudience,
              )
            }
            options={audienceOptions}
            error={errors.targetAudience?.message}
          />
        </div>
        <TextareaField
          label={t("content")}
          placeholder={t("contentPlaceholder")}
          registration={register("content")}
          error={errors.content?.message}
          rows={5}
        />
      </div>
    </FormModal>
  );
}
