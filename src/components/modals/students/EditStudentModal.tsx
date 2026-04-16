"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../forms/FormField";
import { StatusDropdown } from "../../ui/StatusDropdown";
import { ImageUpload } from "../../ui/ImageUpload";
import { FormModal } from "../../ui/FormModal";
import { useTranslations } from "next-intl";
import { Student, StudentStatus } from "@/types/http/student.types";
import {
  useUploadStudentImage,
  useUpdateStudent,
} from "@/hooks/http/useStudents";
import {
  updateStudentSchema,
  UpdateStudentFormData,
} from "@/lib/validations/student.schema";

type FormData = UpdateStudentFormData;

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
}: EditStudentModalProps) {
  const t = useTranslations("students.editModal");
  const tModal = useTranslations("students.modal");
  const tValidation = useTranslations("validation");
  const tStatus = useTranslations("students.status");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();

  const { uploadImageMutate, uploadImagePending } = useUploadStudentImage();
  const { updateStudentMutate, updateStudentPending } = useUpdateStudent();

  const isLoading = uploadImagePending || updateStudentPending;

  const ALLOWED_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
    [StudentStatus.PENDING]: [StudentStatus.ACTIVE, StudentStatus.REJECTED, StudentStatus.SUSPENDED],
    [StudentStatus.ACTIVE]: [StudentStatus.SUSPENDED, StudentStatus.GRADUATED, StudentStatus.WITHDRAWN],
    [StudentStatus.REJECTED]: [StudentStatus.PENDING],
    [StudentStatus.SUSPENDED]: [StudentStatus.ACTIVE, StudentStatus.WITHDRAWN],
    [StudentStatus.GRADUATED]: [],
    [StudentStatus.WITHDRAWN]: [StudentStatus.PENDING],
  };

  const allStatusOptions = useMemo(
    () => [
      { value: StudentStatus.PENDING, label: tStatus("pending") },
      { value: StudentStatus.ACTIVE, label: tStatus("active") },
      { value: StudentStatus.REJECTED, label: tStatus("rejected") },
      { value: StudentStatus.SUSPENDED, label: tStatus("suspended") },
      { value: StudentStatus.GRADUATED, label: tStatus("graduated") },
      { value: StudentStatus.WITHDRAWN, label: tStatus("withdrawn") },
    ],
    [tStatus],
  );

  const statusOptions = useMemo(() => {
    const currentStatus = student?.status;
    if (!currentStatus) return allStatusOptions;
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    return allStatusOptions.filter(
      (opt) => opt.value === currentStatus || allowed.includes(opt.value),
    );
  }, [student?.status, allStatusOptions]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(updateStudentSchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen && student) {
      reset({
        universityId: student.universityId,
        password: "",
        fullName: student.fullName,
        phone: student.phone,
        status: student.status,
      });
      setCurrentImageUrl(student.imageUrl);
      setSelectedImage(null);
    }
  }, [isOpen, student, reset]);

  const handleFormSubmit = async (data: FormData) => {
    if (!student) return;

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
      universityId: data.universityId,
      fullName: data.fullName,
      phone: data.phone,
      status: data.status,
      imageUrl,
    };

    // Only include password if it was changed
    if (data.password && data.password.length > 0) {
      updateData.password = data.password;
    }

    updateStudentMutate(
      {
        id: student.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  if (!student) return null;

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
          label={tModal("universityId")}
          placeholder={tModal("universityIdPlaceholder")}
          type="text"
          registration={register("universityId")}
          error={errors.universityId?.message}
          disabled={isLoading}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <StatusDropdown
              label={tModal("status")}
              placeholder={tModal("statusPlaceholder")}
              value={field.value || StudentStatus.PENDING}
              onChange={field.onChange}
              options={statusOptions}
              disabled={isLoading || ALLOWED_TRANSITIONS[student?.status ?? StudentStatus.PENDING].length === 0}
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

      <div>
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
    </FormModal>
  );
}
