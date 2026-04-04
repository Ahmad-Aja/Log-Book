"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { MedicalCaseTable } from "@/components/tables/MedicalCaseTable";
import { AddMedicalCaseModal } from "@/components/modals/medical-cases/AddMedicalCaseModal";
import { Button } from "@/components/ui/Button";
import { MedicalCaseFilters } from "@/types/http/medical-case.types";
import { useMedicalCases } from "@/hooks/http/useMedicalCases";
import { APP_CONFIG } from "@/constants/app-config";

export default function MedicalCasesPage() {
  const t = useTranslations("medicalCases");
  const { setTitle } = usePageTitle();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState<MedicalCaseFilters>({
    page: 1,
    limit: APP_CONFIG.defaultPageSize,
  });

  const { medicalCases, total, isLoading, error } = useMedicalCases(filters);

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("tableTitle")}
            </h2>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3"
            >
              <Plus className="w-4 h-4" />
              {t("addCase")}
            </Button>
          </div>

          <MedicalCaseTable
            data={medicalCases}
            total={total}
            filters={filters}
            onFiltersChange={setFilters}
            loading={isLoading}
            error={!!error}
          />
        </div>
      </div>

      <AddMedicalCaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
