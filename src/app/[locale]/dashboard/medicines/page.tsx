"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FlaskConical, Clock, CheckCircle, XCircle } from "lucide-react";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";
import { StatusCard } from "@/components/ui/StatusCard";
import { MedicineTable } from "@/components/tables/MedicineTable";
import { AddMedicineModal } from "@/components/modals/medicines/AddMedicineModal";
import { MedicineFilters, MedicineStatus } from "@/types/http/medicine.types";
import { MedicineCategoryStatus } from "@/types/http/medicine-category.types";
import { useMedicines, useMedicineStatistics } from "@/hooks/http/useMedicines";
import { useMedicineCategories } from "@/hooks/http/useMedicineCategories";
import { Button } from "@/components/ui/Button";

export default function MedicinesPage() {
  const t = useTranslations("medicines");
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouterWithLoader();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filters = useMemo<MedicineFilters>(
    () => ({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      search: searchParams.get("search") || undefined,
      status: (searchParams.get("status") as MedicineStatus) || undefined,
      categoryId: searchParams.get("categoryId")
        ? Number(searchParams.get("categoryId"))
        : undefined,
    }),
    [searchParams],
  );

  const handleFiltersChange = useCallback(
    (newFilters: MedicineFilters) => {
      const parts: string[] = [];
      const add = (k: string, v: string | number) =>
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
      if (newFilters.page && newFilters.page !== 1) add("page", newFilters.page);
      if (newFilters.limit && newFilters.limit !== 10) add("limit", newFilters.limit);
      if (newFilters.search) add("search", newFilters.search);
      if (newFilters.status) add("status", newFilters.status);
      if (newFilters.categoryId) add("categoryId", newFilters.categoryId);
      const qs = parts.join("&");
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
    },
    [router, pathname],
  );

  const { medicines, total, isLoading, error } = useMedicines(filters);
  const { statistics, isLoading: isLoadingStats, error: statsError } =
    useMedicineStatistics();

  const { medicineCategories: approvedCategories } = useMedicineCategories({
    page: 1,
    limit: 100,
    status: MedicineCategoryStatus.APPROVED,
  });

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title={t("statistics.total")}
          count={statistics?.totalCount ?? 0}
          icon={FlaskConical}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.pending")}
          count={statistics?.pendingCount ?? 0}
          icon={Clock}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.approved")}
          count={statistics?.approvedCount ?? 0}
          icon={CheckCircle}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.rejected")}
          count={statistics?.rejectedCount ?? 0}
          icon={XCircle}
          iconColor="text-red-600"
          bgColor="bg-red-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("tableTitle")}
          </h2>
          <Button onClick={() => setIsAddModalOpen(true)} className="px-3">
            {t("addButton")}
          </Button>
        </div>

        <MedicineTable
          data={medicines}
          total={total}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
          error={!!error}
          approvedCategories={approvedCategories}
        />
      </div>

      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
