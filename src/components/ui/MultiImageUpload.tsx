"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { getStorageUrl } from "@/utils/storage";

interface ImageEntry {
  /** Existing stored path (e.g. "medical_special_cases/foo.jpg") */
  stored?: string;
  /** New file selected by the user, not yet uploaded */
  file?: File;
  /** Local preview URL for new files */
  preview?: string;
}

interface MultiImageUploadProps {
  entries: ImageEntry[];
  onChange: (entries: ImageEntry[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export type { ImageEntry };

export function MultiImageUpload({
  entries,
  onChange,
  disabled = false,
  maxFiles = 5,
}: MultiImageUploadProps) {
  const t = useTranslations("common.imageUpload");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = maxFiles - entries.length;
      const toAdd = acceptedFiles.slice(0, remaining).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      onChange([...entries, ...toAdd]);
    },
    [entries, maxFiles, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    disabled: disabled || entries.length >= maxFiles,
    multiple: true,
  });

  const handleRemove = (index: number) => {
    const entry = entries[index];
    if (entry.preview) URL.revokeObjectURL(entry.preview);
    onChange(entries.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Previews */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {entries.map((entry, i) => {
            const src = entry.preview ?? getStorageUrl(entry.stored);
            return (
              <div key={i} className="relative group aspect-square">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dropzone */}
      {entries.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 text-center ${
            isDragActive
              ? "border-wheat bg-wheat/10"
              : "border-wheat hover:border-wheat-dark bg-gray-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-wheat/10 flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-5 h-5 text-wheat" />
              ) : (
                <ImageIcon className="w-5 h-5 text-wheat" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? t("dropHere") : t("dragAndDrop")}
            </p>
            <p className="text-xs text-wheat font-medium">{t("browse")}</p>
            <p className="text-xs text-gray-400">{t("formats")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
