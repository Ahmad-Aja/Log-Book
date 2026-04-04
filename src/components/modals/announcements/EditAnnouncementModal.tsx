"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { useUpdateAnnouncement } from "@/hooks/http/useAnnouncements";
import {
  updateAnnouncementSchema,
  UpdateAnnouncementFormData,
} from "@/lib/validations/announcement.schema";
import {
  Announcement,
  AnnouncementTargetAudience,
} from "@/types/http/announcement.types";

interface EditAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

function mapAnnouncementToFormData(
  announcement: Announcement,
): UpdateAnnouncementFormData {
  return {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    targetAudience: announcement.targetAudience,
  };
}

export function EditAnnouncementModal({
  isOpen,
  onClose,
  announcement,
}: EditAnnouncementModalProps) {
  const t = useTranslations("announcements.modal");
  const tValidation = useTranslations("validation");

  const { updateAnnouncementMutate, updateAnnouncementPending } =
    useUpdateAnnouncement();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateAnnouncementFormData>({
    resolver: zodResolver(updateAnnouncementSchema(tValidation)),
  });

  const targetAudience = watch("targetAudience");

  useEffect(() => {
    if (isOpen && announcement) {
      reset(mapAnnouncementToFormData(announcement));
    }
  }, [isOpen, announcement, reset]);

  const audienceOptions = [
    { value: AnnouncementTargetAudience.STUDENTS, label: t("targetStudents") },
    {
      value: AnnouncementTargetAudience.SUPERVISORS,
      label: t("targetSupervisors"),
    },
    { value: AnnouncementTargetAudience.ALL, label: t("targetAll") },
  ];

  const handleFormSubmit = (data: UpdateAnnouncementFormData) => {
    if (!announcement) return;
    updateAnnouncementMutate(
      { id: announcement.id, dto: data },
      { onSuccess: () => onClose() },
    );
  };

  if (!announcement) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("editTitle")}
      submitText={updateAnnouncementPending ? t("saving") : t("save")}
      cancelText={t("cancel")}
      isLoading={updateAnnouncementPending}
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
