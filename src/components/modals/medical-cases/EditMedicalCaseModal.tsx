"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { X, Plus } from "lucide-react";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { MultiImageUpload, ImageEntry } from "@/components/ui/MultiImageUpload";
import { useUpdateMedicalCase, useUploadMedicalCaseImages } from "@/hooks/http/useMedicalCases";
import {
  updateMedicalCaseSchema,
  UpdateMedicalCaseFormData,
  UpdateMedicalCaseFormInput,
} from "@/lib/validations/medical-case.schema";
import { MedicalCase } from "@/types/http/medical-case.types";

interface EditMedicalCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalCase: MedicalCase | null;
}

function mapMedicalCaseToFormData(
  medicalCase: MedicalCase,
): UpdateMedicalCaseFormInput {
  return {
    title: medicalCase.title,
    description: medicalCase.description,
    caseDate: medicalCase.caseDate
      ? medicalCase.caseDate.split("T")[0]
      : "",
    hospital: medicalCase.hospital ?? "",
  };
}

export function EditMedicalCaseModal({
  isOpen,
  onClose,
  medicalCase,
}: EditMedicalCaseModalProps) {
  const t = useTranslations("medicalCases.modal");
  const tValidation = useTranslations("validation");

  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [contributors, setContributors] = useState<string[]>([]);
  const [contributorInput, setContributorInput] = useState("");

  const { updateMedicalCaseMutate, updateMedicalCasePending } = useUpdateMedicalCase();
  const { uploadImagesMutateAsync, uploadImagesPending } = useUploadMedicalCaseImages();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateMedicalCaseFormInput, unknown, UpdateMedicalCaseFormData>({
    resolver: zodResolver(updateMedicalCaseSchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen && medicalCase) {
      reset(mapMedicalCaseToFormData(medicalCase));
      setImageEntries((medicalCase.images ?? []).map((stored) => ({ stored })));
      setUrls(medicalCase.urls ?? []);
      setUrlInput("");
      setUrlError("");
      setContributors(medicalCase.contributors ?? []);
      setContributorInput("");
    }
  }, [isOpen, medicalCase, reset]);

  const isValidUrl = (value: string) => {
    try {
      new URL(value.includes("://") ? value : `https://${value}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setUrlError(t("urlInvalid"));
      return;
    }
    if (urls.length < 5) {
      setUrls((prev) => [...prev, trimmed]);
      setUrlInput("");
      setUrlError("");
    }
  };

  const handleAddContributor = () => {
    const trimmed = contributorInput.trim();
    if (trimmed && contributors.length < 20) {
      setContributors((prev) => [...prev, trimmed]);
      setContributorInput("");
    }
  };

  const handleFormSubmit = async (data: UpdateMedicalCaseFormData) => {
    if (!medicalCase) return;
    const existingUrls = imageEntries.filter((e) => e.stored).map((e) => e.stored!);
    const newFiles = imageEntries.filter((e) => e.file).map((e) => e.file!);
    let uploadedUrls: string[] = [];
    if (newFiles.length > 0) {
      try {
        uploadedUrls = await uploadImagesMutateAsync(newFiles);
      } catch {
        return;
      }
    }
    updateMedicalCaseMutate(
      {
        id: medicalCase.id,
        dto: {
          title: data.title,
          description: data.description,
          caseDate: data.caseDate,
          hospital: data.hospital || undefined,
          images: [...existingUrls, ...uploadedUrls],
          urls,
          contributors,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  if (!medicalCase) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("editTitle")}
      submitText={updateMedicalCasePending || uploadImagesPending ? t("saving") : t("save")}
      cancelText={t("cancel")}
      isLoading={updateMedicalCasePending || uploadImagesPending}
    >
      <div className="space-y-4">
        <FormField
          label={t("title")}
          placeholder={t("titlePlaceholder")}
          error={errors.title?.message}
          registration={register("title")}
        />
        <TextareaField
          label={t("description")}
          placeholder={t("descriptionPlaceholder")}
          registration={register("description")}
          error={errors.description?.message}
          rows={4}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("caseDate")}
            type="date"
            error={errors.caseDate?.message}
            registration={register("caseDate")}
          />
          <FormField
            label={t("hospital")}
            placeholder={t("hospitalPlaceholder")}
            error={errors.hospital?.message}
            registration={register("hospital")}
          />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{t("images")}</label>
          <MultiImageUpload
            entries={imageEntries}
            onChange={setImageEntries}
            disabled={updateMedicalCasePending || uploadImagesPending}
          />
        </div>

        {/* URLs */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("urls")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
              placeholder={t("urlsPlaceholder")}
              className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-wheat/30 ${urlError ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-wheat"}`}
              disabled={urls.length >= 5}
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput.trim() || urls.length >= 5}
              className="px-3 py-2 bg-wheat text-white rounded-lg hover:bg-wheat-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {urlError && (
            <p className="text-xs text-red-500">{urlError}</p>
          )}
          {urls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {urls.map((url, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full max-w-full"
                >
                  <span className="truncate max-w-[200px]">{url}</span>
                  <button
                    type="button"
                    onClick={() => setUrls((prev) => prev.filter((_, idx) => idx !== i))}
                    className="hover:text-blue-900 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contributors */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("contributors")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={contributorInput}
              onChange={(e) => setContributorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddContributor())}
              placeholder={t("contributorsPlaceholder")}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wheat/30 focus:border-wheat"
              disabled={contributors.length >= 20}
            />
            <button
              type="button"
              onClick={handleAddContributor}
              disabled={!contributorInput.trim() || contributors.length >= 20}
              className="px-3 py-2 bg-wheat text-white rounded-lg hover:bg-wheat-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {contributors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contributors.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() =>
                      setContributors((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}
