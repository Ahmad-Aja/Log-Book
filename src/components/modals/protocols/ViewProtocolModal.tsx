"use client";

import { useState } from "react";
import { useMedicines } from "@/hooks/http/useMedicines";
import { MedicineStatus } from "@/types/http/medicine.types";
import { MixedText } from "@/components/ui/MixedText";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ModalFooter } from "@/components/ui/ModalFooter";
import { Button } from "@/components/ui/Button";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { SearchSelect, SearchSelectOption } from "@/components/ui/SearchSelect";
import {
  useProtocol,
  useCreateProtocolStep,
  useDeleteProtocolStep,
  useCreateProtocolMedicine,
  useDeleteProtocolMedicine,
} from "@/hooks/http/useProtocols";
import {
  createStepSchema,
  CreateStepFormData,
  CreateStepFormInput,
} from "@/lib/validations/protocol.schema";
import { ProtocolStatus } from "@/types/http/protocol.types";

const protocolStatusColor: Record<ProtocolStatus, StatusBadgeColor> = {
  [ProtocolStatus.PENDING]: "yellow",
  [ProtocolStatus.APPROVED]: "green",
  [ProtocolStatus.REJECTED]: "red",
};

const PAGE_SIZE = 20;

interface ViewProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocolId: number | null;
}

export function ViewProtocolModal({
  isOpen,
  onClose,
  protocolId,
}: ViewProtocolModalProps) {
  const t = useTranslations("protocols.viewModal");
  const tModal = useTranslations("protocols.modal");
  const tStatus = useTranslations("protocols.status");
  const tValidation = useTranslations("validation");
  const locale = useLocale();

  const { protocol, isLoading, error } = useProtocol(
    isOpen ? protocolId : null,
  );

  const { createProtocolStepMutate, createProtocolStepPending } =
    useCreateProtocolStep();
  const { deleteProtocolStepMutate, deleteProtocolStepPending } =
    useDeleteProtocolStep();
  const { createProtocolMedicineMutate, createProtocolMedicinePending } =
    useCreateProtocolMedicine();
  const { deleteProtocolMedicineMutate, deleteProtocolMedicinePending } =
    useDeleteProtocolMedicine();

  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);
  const [medicineNotes, setMedicineNotes] = useState({ en: "", ar: "" });
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineLimit, setMedicineLimit] = useState(PAGE_SIZE);

  const { medicines, total: totalMedicines } = useMedicines({
    search: medicineSearch || undefined,
    page: 1,
    limit: medicineLimit,
    status: MedicineStatus.APPROVED,
  });

  const {
    register,
    handleSubmit,
    reset: resetStepForm,
    formState: { errors: stepErrors },
  } = useForm<CreateStepFormInput, unknown, CreateStepFormData>({
    resolver: zodResolver(createStepSchema(tValidation)),
    defaultValues: { stepNumber: 1, arTitle: "", enTitle: "" },
  });

  const handleAddStep = (data: CreateStepFormData) => {
    if (!protocol) return;
    createProtocolStepMutate(
      { protocolId: protocol.id, ...data },
      {
        onSuccess: () =>
          resetStepForm({
            stepNumber: (protocol.steps?.length ?? 0) + 2,
            arTitle: "",
            enTitle: "",
          }),
      },
    );
  };

  const handleAddMedicine = () => {
    if (!protocol || !selectedMedicineId) return;
    createProtocolMedicineMutate(
      {
        protocolId: protocol.id,
        medicineId: selectedMedicineId,
        enDosageNotes: medicineNotes.en || undefined,
        arDosageNotes: medicineNotes.ar || undefined,
      },
      {
        onSuccess: () => {
          setSelectedMedicineId(null);
          setMedicineNotes({ en: "", ar: "" });
        },
      },
    );
  };

  const medicineOptions: SearchSelectOption[] = medicines.map((m) => ({
    value: m.id,
    label: locale === "ar" ? m.arName : m.enName,
    sublabel: locale === "ar" ? m.enName : m.arName,
  }));

  const statusLabelMap: Record<ProtocolStatus, string> = {
    [ProtocolStatus.PENDING]: tStatus("pending"),
    [ProtocolStatus.APPROVED]: tStatus("approved"),
    [ProtocolStatus.REJECTED]: tStatus("rejected"),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[800px] max-h-[90vh] flex flex-col"
    >
      <ModalHeader title={t("title")} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error || !protocol ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-red-500">{t("error")}</span>
          </div>
        ) : (
          <>
            {/* Protocol Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {tModal("arTitle")}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  <MixedText text={protocol.arTitle} />
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {tModal("enTitle")}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  <MixedText text={protocol.enTitle} />
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{tModal("status")}</p>
                <StatusBadge
                  color={protocolStatusColor[protocol.status]}
                  label={statusLabelMap[protocol.status]}
                  size="md"
                />
              </div>
            </div>

            {/* Steps Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">
                  {t("stepsSection")}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {protocol.steps && protocol.steps.length > 0 ? (
                  protocol.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-start justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">
                          #{step.stepNumber}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          <MixedText
                            text={locale === "ar" ? step.arTitle : step.enTitle}
                          />
                        </p>
                        {(step.arDescription || step.enDescription) && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            <MixedText
                              text={
                                locale === "ar"
                                  ? step.arDescription
                                  : step.enDescription
                              }
                            />
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteProtocolStepMutate(step.id)}
                        disabled={deleteProtocolStepPending}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title={t("deleteStep")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    {t("noSteps")}
                  </p>
                )}

                {/* Add Step Form */}
                <form
                  onSubmit={handleSubmit(handleAddStep)}
                  className="border border-dashed border-gray-300 rounded-lg p-3 space-y-2"
                >
                  <p className="text-xs font-medium text-gray-600">
                    {t("addStep")}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      {...register("stepNumber", { valueAsNumber: true })}
                      placeholder="#"
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-wheat"
                      min={1}
                    />
                    <input
                      type="text"
                      {...register("arTitle")}
                      placeholder={tModal("arTitle")}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-wheat"
                    />
                    <input
                      type="text"
                      {...register("enTitle")}
                      placeholder={tModal("enTitle")}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-wheat"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <textarea
                      {...register("arDescription")}
                      placeholder={`${tModal("arDescription")} (${t("optional")})`}
                      rows={2}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-wheat resize-none"
                    />
                    <textarea
                      {...register("enDescription")}
                      placeholder={`${tModal("enDescription")} (${t("optional")})`}
                      rows={2}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-wheat resize-none"
                    />
                  </div>
                  {(stepErrors.arTitle || stepErrors.enTitle) && (
                    <p className="text-xs text-red-500">
                      {stepErrors.arTitle?.message ||
                        stepErrors.enTitle?.message}
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="secondary"
                    loading={createProtocolStepPending}
                    className="text-xs py-1 px-2 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 me-1" />
                    {t("addStep")}
                  </Button>
                </form>
              </div>
            </div>

            {/* Medicines Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">
                  {t("medicinesSection")}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {protocol.protocolMedicines &&
                protocol.protocolMedicines.length > 0 ? (
                  protocol.protocolMedicines.map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-start justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          <MixedText
                            text={
                              locale === "ar"
                                ? pm.medicine.arName
                                : pm.medicine.enName
                            }
                          />
                        </p>
                        {(pm.arDosageNotes || pm.enDosageNotes) && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            <MixedText
                              text={
                                locale === "ar"
                                  ? pm.arDosageNotes
                                  : pm.enDosageNotes
                              }
                            />
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteProtocolMedicineMutate(pm.id)}
                        disabled={deleteProtocolMedicinePending}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title={t("deleteMedicine")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    {t("noMedicines")}
                  </p>
                )}

                {/* Add Medicine */}
                <div className="border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">
                    {t("addMedicine")}
                  </p>
                  <SearchSelect
                    placeholder={tModal("medicinePlaceholder")}
                    searchPlaceholder={tModal("searchMedicinePlaceholder")}
                    value={selectedMedicineId}
                    onChange={(val) => setSelectedMedicineId(val as number | null)}
                    options={medicineOptions}
                    onSearch={setMedicineSearch}
                    hasMore={medicines.length < totalMedicines}
                    onLoadMore={() => setMedicineLimit((l) => l + PAGE_SIZE)}
                    showMoreLabel={tModal("showMore")}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={medicineNotes.ar}
                      onChange={(e) =>
                        setMedicineNotes((p) => ({ ...p, ar: e.target.value }))
                      }
                      placeholder={`${tModal("dosageNotes")} (AR)`}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-wheat"
                    />
                    <input
                      type="text"
                      value={medicineNotes.en}
                      onChange={(e) =>
                        setMedicineNotes((p) => ({ ...p, en: e.target.value }))
                      }
                      placeholder={`${tModal("dosageNotes")} (EN)`}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-wheat"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddMedicine}
                    disabled={!selectedMedicineId}
                    loading={createProtocolMedicinePending}
                    className="text-xs py-1 px-2 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 me-1" />
                    {t("addMedicine")}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" className="px-5" onClick={onClose}>
          {tModal("close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
