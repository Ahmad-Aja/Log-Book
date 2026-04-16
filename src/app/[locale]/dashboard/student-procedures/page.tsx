"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";
import { ClipboardList, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { StatusCard } from "@/components/ui/StatusCard";
import { StudentProcedureTable } from "@/components/tables/StudentProcedureTable";
import { AddStudentProcedureModal } from "@/components/modals/student-procedures/AddStudentProcedureModal";
import { Button } from "@/components/ui/Button";
import {
  StudentProcedureFilters,
  StudentProcedureStatus,
} from "@/types/http/student-procedure.types";
import {
  useStudentProcedures,
  useStudentProcedureStatistics,
} from "@/hooks/http/useStudentProcedures";

export default function StudentProceduresPage() {
  const t = useTranslations("studentProcedures");
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouterWithLoader();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filters = useMemo<StudentProcedureFilters>(
    () => ({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      studentId: searchParams.get("studentId") ? Number(searchParams.get("studentId")) : undefined,
      procedureId: searchParams.get("procedureId") ? Number(searchParams.get("procedureId")) : undefined,
      supervisorId: searchParams.get("supervisorId") ? Number(searchParams.get("supervisorId")) : undefined,
      studentFullname: searchParams.get("studentFullname") || undefined,
      procedureName: searchParams.get("procedureName") || undefined,
      supervisorFullname: searchParams.get("supervisorFullname") || undefined,
      status: (searchParams.get("status") as StudentProcedureStatus) || undefined,
      evaluationScore: searchParams.get("evaluationScore") ? Number(searchParams.get("evaluationScore")) : undefined,
    }),
    [searchParams],
  );

  const handleFiltersChange = useCallback(
    (newFilters: StudentProcedureFilters) => {
      const parts: string[] = [];
      const add = (k: string, v: string | number) =>
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
      if (newFilters.page && newFilters.page !== 1) add("page", newFilters.page);
      if (newFilters.limit && newFilters.limit !== 10) add("limit", newFilters.limit);
      if (newFilters.studentId) add("studentId", newFilters.studentId);
      if (newFilters.procedureId) add("procedureId", newFilters.procedureId);
      if (newFilters.supervisorId) add("supervisorId", newFilters.supervisorId);
      if (newFilters.studentFullname) add("studentFullname", newFilters.studentFullname);
      if (newFilters.procedureName) add("procedureName", newFilters.procedureName);
      if (newFilters.supervisorFullname) add("supervisorFullname", newFilters.supervisorFullname);
      if (newFilters.status) add("status", newFilters.status);
      if (newFilters.evaluationScore !== undefined) add("evaluationScore", newFilters.evaluationScore);
      const qs = parts.join("&");
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
    },
    [router, pathname],
  );

  const { studentProcedures, total, isLoading, error } =
    useStudentProcedures(filters);
  const { statistics, isLoading: isLoadingStats, error: statsError } =
    useStudentProcedureStatistics();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title={t("statistics.total")}
            count={statistics?.totalCount || 0}
            icon={ClipboardList}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("statistics.pending")}
            count={statistics?.pendingCount || 0}
            icon={Clock}
            iconColor="text-yellow-600"
            bgColor="bg-yellow-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("statistics.approved")}
            count={statistics?.approvedCount || 0}
            icon={CheckCircle}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("statistics.rejected")}
            count={statistics?.rejectedCount || 0}
            icon={XCircle}
            iconColor="text-red-600"
            bgColor="bg-red-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("tableTitle")}
            </h2>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3"
            >
              <Plus className="w-4 h-4" />
              {t("addStudentProcedure")}
            </Button>
          </div>

          <StudentProcedureTable
            data={studentProcedures}
            total={total}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loading={isLoading}
            error={!!error}
          />
        </div>
      </div>

      <AddStudentProcedureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
