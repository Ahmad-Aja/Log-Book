"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { UserCheck, UserX, Clock, Ban, Plus, User } from "lucide-react";
import { StatusCard } from "@/components/ui/StatusCard";
import { SupervisorTable } from "@/components/tables/SupervisorTable";
import { AddSupervisorModal } from "@/components/modals/supervisors/AddSupervisorModal";
import { Button } from "@/components/ui/Button";
import {
  Supervisor,
  SupervisorFilters,
  SupervisorStatus,
} from "@/types/http/supervisor.types";
import {
  useSupervisors,
  useSupervisorStatistics,
} from "@/hooks/http/useSupervisors";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";

export default function SupervisorsPage() {
  const t = useTranslations("supervisors");
  const { setTitle } = usePageTitle();
  const locale = useLocale();
  const router = useRouterWithLoader();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [filters, setFilters] = useState<SupervisorFilters>({
    username: "",
    status: [],
    page: 1,
    limit: 10,
  });

  const handleFiltersChange = useCallback((newFilters: SupervisorFilters) => {
    setFilters(newFilters);
  }, []);

  const handleViewProcedures = useCallback(
    (supervisor: Supervisor) => {
      router.push(
        `/${locale}/dashboard/student-procedures?supervisorId=${supervisor.id}&supervisorFullname=${encodeURIComponent(supervisor.fullName)}`,
      );
    },
    [router, locale],
  );

  const {
    supervisors,
    pagination,
    isLoading: isLoadingSupervisors,
    error: supervisorsError,
  } = useSupervisors(filters);

  const {
    statistics,
    isLoading: isLoadingStats,
    error: statsError,
  } = useSupervisorStatistics();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  const statusCounts = {
    pending: statistics?.statusBreakdown[SupervisorStatus.PENDING] || 0,
    active: statistics?.statusBreakdown[SupervisorStatus.ACTIVE] || 0,
    rejected: statistics?.statusBreakdown[SupervisorStatus.REJECTED] || 0,
    suspended: statistics?.statusBreakdown[SupervisorStatus.SUSPENDED] || 0,
    retired: statistics?.statusBreakdown[SupervisorStatus.RETIRED] || 0,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatusCard
            title={t("status.pending")}
            count={statusCounts.pending}
            icon={Clock}
            iconColor="text-yellow-600"
            bgColor="bg-yellow-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("status.active")}
            count={statusCounts.active}
            icon={UserCheck}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("status.rejected")}
            count={statusCounts.rejected}
            icon={UserX}
            iconColor="text-red-600"
            bgColor="bg-red-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("status.retired")}
            count={statusCounts.retired}
            icon={User}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("status.suspended")}
            count={statusCounts.suspended}
            icon={Ban}
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
              {t("addSupervisor")}
            </Button>
          </div>

          <SupervisorTable
            data={supervisors}
            pagination={pagination}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onViewProcedures={handleViewProcedures}
            loading={isLoadingSupervisors}
            error={!!supervisorsError}
          />
        </div>
      </div>

      <AddSupervisorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
