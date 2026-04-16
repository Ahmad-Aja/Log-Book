"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { getStorageUrl } from "@/utils/storage";

interface ImageSliderProps {
  images: string[];
}

export function ImageSlider({ images }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const locale = useLocale();
  const isRTL = locale === "ar";

  if (images.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="relative w-full select-none">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-video">
        <img
          key={index}
          src={getStorageUrl(images[index])}
          alt={`${index + 1}`}
          className="w-full h-full object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={isRTL ? next : prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={isRTL ? prev : next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {index + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                i === index ? "border-wheat" : "border-transparent"
              }`}
            >
              <img
                src={getStorageUrl(img)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
