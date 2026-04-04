"use client";

import { ReactNode } from "react";
import { Modal } from "./Modal";
import { ModalHeader } from "./ModalHeader";
import { ModalFooter } from "./ModalFooter";
import { DetailViewGrid } from "./DetailViewGrid";
import { Button } from "./Button";

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

interface DetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  closeButtonText: string;
  showImage?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  noImageText?: string;
  fields: Field[];
}

export function DetailViewModal({
  isOpen,
  onClose,
  title,
  closeButtonText,
  showImage = false,
  imageUrl,
  imageAlt,
  noImageText,
  fields,
}: DetailViewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] max-h-[90vh] flex flex-col"
    >
      <ModalHeader title={title} onClose={onClose} sticky />

      <div className="overflow-y-auto flex-1">
        <DetailViewGrid
          showImage={showImage}
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          noImageText={noImageText}
          fields={fields}
        />
      </div>

      <ModalFooter>
        <Button variant="secondary" className="px-5" onClick={onClose}>
          {closeButtonText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
