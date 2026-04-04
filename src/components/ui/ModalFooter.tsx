"use client";

import { ReactNode } from "react";

interface ModalFooterProps {
  children: ReactNode;
  sticky?: boolean;
  align?: "left" | "center" | "right" | "between";
}

export function ModalFooter({
  children,
  sticky = false,
  align = "right",
}: ModalFooterProps) {
  const stickyClasses = sticky
    ? "sticky bottom-0 bg-white rounded-b-2xl"
    : "";

  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={`border-t border-gray-200 px-6 py-4 flex gap-3 ${alignClasses[align]} ${stickyClasses}`}
    >
      {children}
    </div>
  );
}
