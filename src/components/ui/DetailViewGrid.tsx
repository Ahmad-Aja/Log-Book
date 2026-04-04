"use client";

import { ReactNode } from "react";
import { DetailViewSlot } from "./DetailViewSlot";
import { getStorageUrl } from "@/utils/storage";

interface Field {
  label: string;
  value: ReactNode;
  className?: string;
  fullWidth?: boolean;
  colSpan?: 1 | 2;
  variant?: "default" | "danger";
  multiline?: boolean;
  clamp?: boolean;
}

interface DetailViewGridProps {
  showImage?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  noImageText?: string;
  fields: Field[];
}

export function DetailViewGrid({
  showImage = false,
  imageUrl,
  imageAlt,
  noImageText,
  fields,
}: DetailViewGridProps) {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image - Left Side (only if showImage is true) */}
        {showImage && (
          <div className="flex-shrink-0">
            {imageUrl ? (
              <img
                src={getStorageUrl(imageUrl)}
                alt={imageAlt || ""}
                className="w-40 h-40 object-cover border-2 border-wheat shadow-md"
              />
            ) : (
              <div className="w-40 h-40 border-2 border-wheat/50 flex items-center justify-center bg-wheat/10">
                <p className="text-sm text-wheat-dark text-center px-2">
                  {noImageText || "No Image"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Details - Table-like Grid Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 h-fit auto-rows-auto">
          {fields.map((field, index) => (
            <DetailViewSlot
              key={index}
              label={field.label}
              value={field.value}
              className={field.className}
              fullWidth={field.fullWidth}
              colSpan={field.colSpan}
              variant={field.variant}
              multiline={field.multiline}
              clamp={field.clamp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
