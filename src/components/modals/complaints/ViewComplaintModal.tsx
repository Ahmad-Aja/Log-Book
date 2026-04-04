"use client";

import { useEffect, useState } from "react";
import { MixedText } from "@/components/ui/MixedText";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { DetailViewSlot } from "@/components/ui/DetailViewSlot";
import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Button } from "@/components/ui/Button";
import { TextareaField } from "@/components/forms/TextareaField";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import {
  useComplaint,
  useAddComplaintMessage,
  useUpdateComplaintStatus,
} from "@/hooks/http/useComplaints";
import {
  ComplaintCategory,
  ComplaintSenderType,
  ComplaintStatus,
} from "@/types/http/complaint.types";
import {
  createComplaintMessageSchema,
  CreateComplaintMessageFormData,
} from "@/lib/validations/complaint.schema";

interface ViewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: number | null;
}

const statusBadgeColor: Record<ComplaintStatus, StatusBadgeColor> = {
  [ComplaintStatus.PENDING]: "yellow",
  [ComplaintStatus.IN_PROGRESS]: "blue",
  [ComplaintStatus.RESOLVED]: "green",
  [ComplaintStatus.CLOSED]: "gray",
};

const categoryBadgeColor: Record<ComplaintCategory, StatusBadgeColor> = {
  [ComplaintCategory.TECHNICAL]: "purple",
  [ComplaintCategory.ADMINISTRATIVE]: "orange",
  [ComplaintCategory.ACADEMIC]: "blue",
  [ComplaintCategory.OTHER]: "gray",
};

type Tab = "details" | "messages";

export function ViewComplaintModal({
  isOpen,
  onClose,
  complaintId,
}: ViewComplaintModalProps) {
  const tModal = useTranslations("complaints.modal");
  const tStatus = useTranslations("complaints.status");
  const tCategory = useTranslations("complaints.category");
  const tValidation = useTranslations("validation");

  const [activeTab, setActiveTab] = useState<Tab>("details");

  const { complaint, isLoading, refetch } = useComplaint(
    isOpen ? complaintId : null,
  );

  const { addComplaintMessageMutate, addComplaintMessagePending } =
    useAddComplaintMessage();
  const { updateComplaintStatusMutate, updateComplaintStatusPending } =
    useUpdateComplaintStatus();

  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(
    ComplaintStatus.PENDING,
  );

  useEffect(() => {
    if (complaint) setSelectedStatus(complaint.status);
  }, [complaint]);

  useEffect(() => {
    if (isOpen) setActiveTab("details");
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateComplaintMessageFormData>({
    resolver: zodResolver(createComplaintMessageSchema(tValidation)),
    defaultValues: { message: "" },
  });

  const handleReply = (data: CreateComplaintMessageFormData) => {
    if (!complaintId) return;
    addComplaintMessageMutate(
      { id: complaintId, dto: { message: data.message } },
      { onSuccess: () => { reset(); refetch(); } },
    );
  };

  const handleStatusUpdate = () => {
    if (!complaintId) return;
    updateComplaintStatusMutate(
      { id: complaintId, dto: { status: selectedStatus } },
      { onSuccess: () => refetch() },
    );
  };

  const statusOptions = [
    { value: ComplaintStatus.PENDING, label: tStatus("pending") },
    { value: ComplaintStatus.IN_PROGRESS, label: tStatus("in_progress") },
    { value: ComplaintStatus.RESOLVED, label: tStatus("resolved") },
    { value: ComplaintStatus.CLOSED, label: tStatus("closed") },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[680px] h-[90vh] flex flex-col"
    >
      <ModalHeader title={tModal("viewTitle")} onClose={onClose} sticky />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-6 shrink-0">
        {(["details", "messages"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-forest text-forest"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tModal(tab === "details" ? "tabDetails" : "tabMessages")}
            {tab === "messages" && complaint && complaint.messages.length > 0 && (
              <span className="ms-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-forest text-white text-[10px] font-bold">
                {complaint.messages.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : !complaint ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
            {tModal("notFound")}
          </div>
        ) : activeTab === "details" ? (
          <div className="space-y-4">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3">
              <DetailViewSlot
                label={tModal("labelId")}
                value={`#${complaint.id}`}
              />
              <DetailViewSlot
                label={tModal("labelCreatorId")}
                value={String(complaint.creatorId)}
              />
              <DetailViewSlot
                label={tModal("labelCreatorType")}
                value={<span className="capitalize">{complaint.creatorType}</span>}
              />
              <DetailViewSlot
                label={tModal("labelCreatedAt")}
                value={new Date(complaint.createdAt).toLocaleDateString()}
              />
              <DetailViewSlot
                label={tModal("labelCategory")}
                value={<StatusBadge color={categoryBadgeColor[complaint.category]} label={tCategory(complaint.category)} />}
              />
              <DetailViewSlot
                label={tModal("labelStatus")}
                value={<StatusBadge color={statusBadgeColor[complaint.status]} label={tStatus(complaint.status)} />}
              />
            </div>

            {/* Status Update */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">{tModal("updateStatusTitle")}</h3>
              </div>
              <div className="p-4 flex items-end gap-3">
                <div className="flex-1">
                  <StatusDropdown
                    label={tModal("statusLabel")}
                    value={selectedStatus}
                    onChange={(val) => setSelectedStatus(val as ComplaintStatus)}
                    options={statusOptions}
                    disabled={updateComplaintStatusPending}
                  />
                </div>
                <Button
                  onClick={handleStatusUpdate}
                  loading={updateComplaintStatusPending}
                  className="px-4 py-2 shrink-0"
                >
                  {tModal("updateStatusBtn")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Messages tab */
          <div className="flex flex-col gap-3 h-full">
            <div className="flex-1 space-y-3">
              {complaint.messages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">{tModal("noMessages")}</p>
              ) : (
                complaint.messages.map((msg) => {
                  const isAdmin = msg.senderType === ComplaintSenderType.ADMIN;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 max-w-[80%] ${isAdmin ? "ms-auto items-end" : "me-auto items-start"}`}
                    >
                      <span className="text-xs text-gray-500 capitalize px-1">{msg.senderType}</span>
                      <div
                        className={`px-4 py-2.5 text-sm text-gray-800 ${
                          isAdmin
                            ? "bg-wheat/20 rounded-tl-xl rounded-bl-xl rounded-tr-xl"
                            : "bg-gray-100 rounded-tr-xl rounded-br-xl rounded-tl-xl"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          <MixedText text={msg.message} />
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400 px-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reply footer — only on messages tab */}
      {activeTab === "messages" && (
        <div className="border-t border-gray-200 p-4 space-y-3 shrink-0">
          <TextareaField
            label={tModal("replyLabel")}
            placeholder={tModal("replyPlaceholder")}
            rows={3}
            registration={register("message")}
            error={errors.message?.message}
            disabled={addComplaintMessagePending || isLoading || !complaint}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit(handleReply)}
              loading={addComplaintMessagePending}
              disabled={isLoading || !complaint}
              className="px-5"
            >
              {tModal("sendReply")}
            </Button>
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <ModalFooter>
          <Button variant="secondary" className="px-5" onClick={onClose}>
            {tModal("close")}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
