"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../forms/FormField";
import { StatusDropdown } from "../../ui/StatusDropdown";
import { ImageUpload } from "../../ui/ImageUpload";
import { FormModal } from "../../ui/FormModal";
import { useTranslations } from "next-intl";
import { Supervisor, SupervisorStatus } from "@/types/http/supervisor.types";
import {
  useUploadSupervisorImage,
  useUpdateSupervisor,
} from "@/hooks/http/useSupervisors";
import {
  updateSupervisorSchema,
  UpdateSupervisorFormData,
} from "@/lib/validations/supervisor.schema";

type FormData = UpdateSupervisorFormData;

interface EditSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervisor: Supervisor | null;
}

export function EditSupervisorModal({
  isOpen,
  onClose,
  supervisor,
}: EditSupervisorModalProps) {
  const t = useTranslations("supervisors.editModal");
  const tModal = useTranslations("supervisors.modal");
  const tValidation = useTranslations("validation");
  const tStatus = useTranslations("supervisors.status");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();

  const { uploadImageMutate, uploadImagePending } = useUploadSupervisorImage();
  const { updateSupervisorMutate, updateSupervisorPending } =
    useUpdateSupervisor();

  const isLoading = uploadImagePending || updateSupervisorPending;

  const statusOptions = useMemo(
    () => [
      { value: SupervisorStatus.PENDING, label: tStatus("pending") },
      { value: SupervisorStatus.ACTIVE, label: tStatus("active") },
      { value: SupervisorStatus.REJECTED, label: tStatus("rejected") },
      { value: SupervisorStatus.SUSPENDED, label: tStatus("suspended") },
      { value: SupervisorStatus.RETIRED, label: tStatus("retired") },
    ],
    [tStatus],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(updateSupervisorSchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen && supervisor) {
      reset({
        username: supervisor.username,
        password: "",
        fullName: supervisor.fullName,
        phone: supervisor.phone,
        status: supervisor.status,
        notes: supervisor.notes || "",
      });
      setCurrentImageUrl(supervisor.imageUrl);
      setSelectedImage(null);
    }
  }, [isOpen, supervisor, reset]);

  const handleFormSubmit = async (data: FormData) => {
    if (!supervisor) return;

    let imageUrl: string | undefined = currentImageUrl;

    // Upload new image if selected
    if (selectedImage) {
      try {
        imageUrl = await new Promise<string>((resolve, reject) => {
          uploadImageMutate(selectedImage, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      } catch (error) {
        return; // Error is handled by the hook
      }
    }

    // Prepare update data (only include changed fields)
    const updateData: any = {
      username: data.username,
      fullName: data.fullName,
      phone: data.phone,
      status: data.status,
      notes: data.notes,
      imageUrl,
    };

    // Only include password if it was changed
    if (data.password && data.password.length > 0) {
      updateData.password = data.password;
    }

    updateSupervisorMutate(
      {
        id: supervisor.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  if (!supervisor) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("title")}
      description={t("description")}
      submitText={t("save")}
      cancelText={tModal("cancel")}
      isLoading={isLoading}
    >
      <div className="mb-4">
        <label className="text-[13px] text-wheat mb-1 block">
          {tModal("image")}
        </label>
        <ImageUpload
          value={currentImageUrl ? `/${currentImageUrl}` : undefined}
          onChange={setSelectedImage}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormField
          label={tModal("username")}
          placeholder={tModal("usernamePlaceholder")}
          type="text"
          registration={register("username")}
          error={errors.username?.message}
          disabled={isLoading}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <StatusDropdown
              label={tModal("status")}
              placeholder={tModal("statusPlaceholder")}
              value={field.value || SupervisorStatus.PENDING}
              onChange={field.onChange}
              options={statusOptions}
              disabled={isLoading}
              error={errors.status?.message}
            />
          )}
        />

        <FormField
          label={tModal("fullName")}
          placeholder={tModal("fullNamePlaceholder")}
          type="text"
          registration={register("fullName")}
          error={errors.fullName?.message}
          disabled={isLoading}
        />

        <FormField
          label={tModal("phone")}
          placeholder={tModal("phonePlaceholder")}
          type="text"
          registration={register("phone")}
          error={errors.phone?.message}
          disabled={isLoading}
        />
      </div>

      <div className="mb-4">
        <FormField
          label={tModal("password")}
          placeholder={tModal("passwordPlaceholder")}
          type="password"
          registration={register("password")}
          error={errors.password?.message}
          disabled={isLoading}
          showPasswordToggle
        />
        <p className="text-xs text-gray-500 mt-1">{t("passwordOptional")}</p>
      </div>

      <div>
        <label className="text-[13px] text-wheat mb-1 block">
          {tModal("notes")}
        </label>
        <textarea
          {...register("notes")}
          placeholder={tModal("notesPlaceholder")}
          disabled={isLoading}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wheat/20 focus:border-wheat transition-colors disabled:bg-gray-50 disabled:text-gray-500"
        />
        {errors.notes?.message && (
          <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
        )}
      </div>
    </FormModal>
  );
}
