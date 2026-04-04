"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { ClipboardList, CheckCircle, XCircle, Plus } from "lucide-react";
import { StatusCard } from "@/components/ui/StatusCard";
import { ProcedureTable } from "@/components/tables/ProcedureTable";
import { AddProcedureModal } from "@/components/modals/procedures/AddProcedureModal";
import { Button } from "@/components/ui/Button";
import { Procedure, ProcedureFilters } from "@/types/http/procedure.types";
import {
  useProcedures,
  useProcedureStatistics,
} from "@/hooks/http/useProcedures";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";

export default function ProceduresPage() {
  const t = useTranslations("procedures");
  const { setTitle } = usePageTitle();
  const locale = useLocale();
  const router = useRouterWithLoader();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [filters, setFilters] = useState<ProcedureFilters>({
    nameSearch: "",
    page: 1,
    limit: 10,
  });

  const handleFiltersChange = useCallback((newFilters: ProcedureFilters) => {
    setFilters(newFilters);
  }, []);

  const handleViewProcedures = useCallback(
    (procedure: Procedure) => {
      const name = locale === "ar" ? procedure.arName : procedure.enName;
      router.push(
        `/${locale}/dashboard/student-procedures?procedureId=${procedure.id}&procedureName=${encodeURIComponent(name)}`,
      );
    },
    [router, locale],
  );

  const {
    procedures,
    pagination,
    isLoading: isLoadingProcedures,
    error: proceduresError,
  } = useProcedures(filters);

  const {
    statistics,
    isLoading: isLoadingStats,
    error: statsError,
  } = useProcedureStatistics();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  return (
    <>
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title={t("tableTitle")}
            count={statistics?.totalCount || 0}
            icon={ClipboardList}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("status.enabled")}
            count={statistics?.enabledCount || 0}
            icon={CheckCircle}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("status.disabled")}
            count={statistics?.disabledCount || 0}
            icon={XCircle}
            iconColor="text-gray-600"
            bgColor="bg-gray-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
        </div>

        {/* Table Section */}
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
              {t("addProcedure")}
            </Button>
          </div>

          <ProcedureTable
            data={procedures}
            pagination={pagination}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onViewProcedures={handleViewProcedures}
            loading={isLoadingProcedures}
            error={!!proceduresError}
          />
        </div>
      </div>

      <AddProcedureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
