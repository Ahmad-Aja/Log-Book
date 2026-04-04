"use client";

import { ReactNode, FormEvent } from "react";
import { Modal } from "./Modal";
import { ModalHeader } from "./ModalHeader";
import { ModalFooter } from "./ModalFooter";
import { Button } from "./Button";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title: string;
  description?: string;
  children: ReactNode;
  submitText: string;
  cancelText: string;
  isLoading?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText,
  cancelText,
  isLoading = false,
  maxWidth = "2xl",
}: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      className="max-h-[90vh] overflow-y-auto"
    >
      <ModalHeader
        title={title}
        description={description}
        onClose={onClose}
        disabled={isLoading}
        sticky
      />

      <form onSubmit={onSubmit}>
        <div className="p-6">{children}</div>

        <ModalFooter sticky>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button type="submit" loading={isLoading} className="flex-1">
            {submitText}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
