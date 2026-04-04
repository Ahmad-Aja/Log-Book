"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/forms/FormField";
import { TextareaField } from "@/components/forms/TextareaField";
import { SearchSelect, SearchSelectOption } from "@/components/ui/SearchSelect";
import { useCreateProtocol } from "@/hooks/http/useProtocols";
import { useProcedures } from "@/hooks/http/useProcedures";
import { useMedicines } from "@/hooks/http/useMedicines";
import {
  createProtocolSchema,
  CreateProtocolFormData,
  CreateProtocolFormInput,
} from "@/lib/validations/protocol.schema";
import {
  CreateProtocolStepInput,
  CreateProtocolMedicineInput,
} from "@/types/http/protocol.types";
import { MedicineStatus } from "@/types/http/medicine.types";

const PAGE_SIZE = 20;

interface AddProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptyStep = (): CreateProtocolStepInput => ({
  stepNumber: 1,
  arTitle: "",
  enTitle: "",
  arDescription: "",
  enDescription: "",
});

// Sub-component so each medicine row has its own isolated search state
function MedicineRow({
  med,
  index,
  onRemove,
  onChange,
  t,
  locale,
}: {
  med: CreateProtocolMedicineInput;
  index: number;
  onRemove: (i: number) => void;
  onChange: (i: number, field: keyof CreateProtocolMedicineInput, value: string | number) => void;
  t: (key: string) => string;
  locale: string;
}) {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { medicines, total } = useMedicines({
    search: search || undefined,
    page: 1,
    limit,
    status: MedicineStatus.APPROVED,
  });

  const options: SearchSelectOption[] = medicines.map((m) => ({
    value: m.id,
    label: locale === "ar" ? m.arName : m.enName,
    sublabel: locale === "ar" ? m.enName : m.arName,
  }));

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-2 ltr:right-2 rtl:left-2 text-red-400 hover:text-red-600"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <SearchSelect
        label={t("medicinePlaceholder")}
        placeholder={t("medicinePlaceholder")}
        searchPlaceholder={t("searchMedicinePlaceholder")}
        value={med.medicineId > 0 ? med.medicineId : null}
        onChange={(val) => onChange(index, "medicineId", val ? Number(val) : 0)}
        options={options}
        onSearch={setSearch}
        hasMore={medicines.length < total}
        onLoadMore={() => setLimit((l) => l + PAGE_SIZE)}
        showMoreLabel={t("showMore")}
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            {t("dosageNotes")} (AR)
          </label>
          <input
            type="text"
            value={med.arDosageNotes ?? ""}
            onChange={(e) => onChange(index, "arDosageNotes", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-wheat"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            {t("dosageNotes")} (EN)
          </label>
          <input
            type="text"
            value={med.enDosageNotes ?? ""}
            onChange={(e) => onChange(index, "enDosageNotes", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-wheat"
          />
        </div>
      </div>
    </div>
  );
}

export function AddProtocolModal({ isOpen, onClose }: AddProtocolModalProps) {
  const t = useTranslations("protocols.modal");
  const tValidation = useTranslations("validation");
  const locale = useLocale();

  const { createProtocolMutate, createProtocolPending } = useCreateProtocol();

  const [inlineSteps, setInlineSteps] = useState<CreateProtocolStepInput[]>([]);
  const [inlineMedicines, setInlineMedicines] = useState<CreateProtocolMedicineInput[]>([]);

  const [procedureSearch, setProcedureSearch] = useState("");
  const [procedureLimit, setProcedureLimit] = useState(PAGE_SIZE);

  const { procedures, pagination: procedurePag } = useProcedures({
    nameSearch: procedureSearch || undefined,
    page: 1,
    limit: procedureLimit,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProtocolFormInput, unknown, CreateProtocolFormData>({
    resolver: zodResolver(createProtocolSchema(tValidation)),
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setInlineSteps([]);
      setInlineMedicines([]);
      setProcedureSearch("");
      setProcedureLimit(PAGE_SIZE);
    }
  }, [isOpen, reset]);

  const currentProcedureId = watch("procedureId");

  const procedureOptions: SearchSelectOption[] = procedures.map((p) => ({
    value: p.id,
    label: locale === "ar" ? p.arName : p.enName,
    sublabel: locale === "ar" ? p.enName : p.arName,
  }));

  const handleAddStep = () => {
    setInlineSteps((prev) => [
      ...prev,
      { ...emptyStep(), stepNumber: prev.length + 1 },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setInlineSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (
    index: number,
    field: keyof CreateProtocolStepInput,
    value: string | number,
  ) => {
    setInlineSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const handleAddMedicine = () => {
    setInlineMedicines((prev) => [...prev, { medicineId: 0 }]);
  };

  const handleRemoveMedicine = (index: number) => {
    setInlineMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (
    index: number,
    field: keyof CreateProtocolMedicineInput,
    value: string | number,
  ) => {
    setInlineMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const handleFormSubmit = (data: CreateProtocolFormData) => {
    const validSteps = inlineSteps.filter((s) => s.arTitle && s.enTitle);
    const validMedicines = inlineMedicines.filter((m) => m.medicineId > 0);

    createProtocolMutate(
      {
        ...data,
        steps: validSteps.length > 0 ? validSteps : undefined,
        medicines: validMedicines.length > 0 ? validMedicines : undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(handleFormSubmit)}
      title={t("addTitle")}
      submitText={createProtocolPending ? t("saving") : t("save")}
      cancelText={t("cancel")}
      isLoading={createProtocolPending}
    >
      <div className="space-y-4">
        {/* Main fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t("arTitle")}
            type="text"
            registration={register("arTitle")}
            error={errors.arTitle?.message}
            disabled={createProtocolPending}
          />
          <FormField
            label={t("enTitle")}
            type="text"
            registration={register("enTitle")}
            error={errors.enTitle?.message}
            disabled={createProtocolPending}
          />
        </div>
        <SearchSelect
          label={t("procedure")}
          placeholder={t("procedurePlaceholder")}
          searchPlaceholder={t("searchProcedurePlaceholder")}
          value={currentProcedureId ?? null}
          onChange={(val) =>
            setValue("procedureId", val ? Number(val) : (undefined as unknown as number))
          }
          options={procedureOptions}
          onSearch={setProcedureSearch}
          hasMore={procedures.length < (procedurePag?.total ?? 0)}
          onLoadMore={() => setProcedureLimit((l) => l + PAGE_SIZE)}
          showMoreLabel={t("showMore")}
          error={errors.procedureId?.message}
        />
        <TextareaField
          label={t("arDescription")}
          registration={register("arDescription")}
          rows={2}
          disabled={createProtocolPending}
        />
        <TextareaField
          label={t("enDescription")}
          registration={register("enDescription")}
          rows={2}
          disabled={createProtocolPending}
        />

        {/* Inline Steps */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              {t("stepsTitle")}
            </h4>
            <button
              type="button"
              onClick={handleAddStep}
              className="flex items-center gap-1 text-xs text-wheat-dark hover:text-wheat font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("addStep")}
            </button>
          </div>
          {inlineSteps.map((step, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 space-y-2 relative"
            >
              <button
                type="button"
                onClick={() => handleRemoveStep(index)}
                className="absolute top-2 ltr:right-2 rtl:left-2 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t("stepNumber")}
                  </label>
                  <input
                    type="number"
                    value={step.stepNumber}
                    onChange={(e) =>
                      handleStepChange(index, "stepNumber", Number(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-wheat"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t("arTitle")}
                  </label>
                  <input
                    type="text"
                    value={step.arTitle}
                    onChange={(e) =>
                      handleStepChange(index, "arTitle", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-wheat"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t("enTitle")}
                  </label>
                  <input
                    type="text"
                    value={step.enTitle}
                    onChange={(e) =>
                      handleStepChange(index, "enTitle", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-wheat"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t("arDescription")}
                  </label>
                  <textarea
                    value={step.arDescription ?? ""}
                    onChange={(e) =>
                      handleStepChange(index, "arDescription", e.target.value)
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-wheat resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t("enDescription")}
                  </label>
                  <textarea
                    value={step.enDescription ?? ""}
                    onChange={(e) =>
                      handleStepChange(index, "enDescription", e.target.value)
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-wheat resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          {inlineSteps.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              {t("noStepsYet")}
            </p>
          )}
        </div>

        {/* Inline Medicines */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              {t("medicinesTitle")}
            </h4>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="flex items-center gap-1 text-xs text-wheat-dark hover:text-wheat font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("addMedicine")}
            </button>
          </div>
          {inlineMedicines.map((med, index) => (
            <MedicineRow
              key={index}
              med={med}
              index={index}
              onRemove={handleRemoveMedicine}
              onChange={handleMedicineChange}
              t={t}
              locale={locale}
            />
          ))}
          {inlineMedicines.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              {t("noMedicinesYet")}
            </p>
          )}
        </div>
      </div>
    </FormModal>
  );
}
