"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  error,
}: ImageUploadProps) {
  const t = useTranslations("common.imageUpload");
  const [preview, setPreview] = useState<string | null>(value || null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onChange(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
          isDragActive
            ? "border-wheat bg-wheat/10"
            : error
              ? "border-red-500 bg-red-50/50"
              : "border-wheat hover:border-wheat-dark bg-gray-50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDragActive ? "bg-wheat/20" : "bg-wheat/10"
              }`}
            >
              {isDragActive ? (
                <Upload className="w-8 h-8 text-wheat" />
              ) : (
                <ImageIcon className="w-8 h-8 text-wheat" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragActive ? t("dropHere") : t("dragAndDrop")}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t("or")}</p>
              <p className="text-xs text-wheat font-medium">{t("browse")}</p>
            </div>
            <p className="text-xs text-gray-400">{t("formats")}</p>
          </div>
        )}
      </div>
      {error && (
        <span className="text-[13px] text-red-600 mt-1 block">{error}</span>
      )}
    </div>
  );
}
