"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { HandHeart, Clock, CheckCircle, XCircle } from "lucide-react";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { APP_CONFIG } from "@/constants/app-config";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";
import { StatusCard } from "@/components/ui/StatusCard";
import { VolunteerActivityTable } from "@/components/tables/VolunteerActivityTable";
import {
  VolunteerActivityFilters,
} from "@/types/http/volunteer-activity.types";
import {
  useVolunteerActivities,
  useVolunteerActivityStatistics,
} from "@/hooks/http/useVolunteerActivities";

export default function VolunteerActivitiesPage() {
  const t = useTranslations("volunteerActivities");
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouterWithLoader();

  const filters = useMemo<VolunteerActivityFilters>(() => ({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || APP_CONFIG.defaultPageSize,
    search: searchParams.get("search") || undefined,
    studentId: searchParams.get("studentId") ? Number(searchParams.get("studentId")) : undefined,
    supervisorId: searchParams.get("supervisorId") ? Number(searchParams.get("supervisorId")) : undefined,
    status: (searchParams.get("status") as VolunteerActivityFilters["status"]) || undefined,
    activityDateFrom: searchParams.get("activityDateFrom") || undefined,
    activityDateTo: searchParams.get("activityDateTo") || undefined,
  }), [searchParams]);

  const handleFiltersChange = useCallback((newFilters: VolunteerActivityFilters) => {
    const params = new URLSearchParams();
    params.set("page", String(newFilters.page || 1));
    params.set("limit", String(newFilters.limit || APP_CONFIG.defaultPageSize));
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.studentId) params.set("studentId", String(newFilters.studentId));
    if (newFilters.supervisorId) params.set("supervisorId", String(newFilters.supervisorId));
    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.activityDateFrom) params.set("activityDateFrom", newFilters.activityDateFrom);
    if (newFilters.activityDateTo) params.set("activityDateTo", newFilters.activityDateTo);
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  const { volunteerActivities, total, isLoading, error } =
    useVolunteerActivities(filters);
  const {
    statistics,
    isLoading: isLoadingStats,
    error: statsError,
  } = useVolunteerActivityStatistics();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title={t("statistics.total")}
          count={statistics?.total ?? 0}
          icon={HandHeart}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.pending")}
          count={statistics?.pending ?? 0}
          icon={Clock}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.approved")}
          count={statistics?.approved ?? 0}
          icon={CheckCircle}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.rejected")}
          count={statistics?.rejected ?? 0}
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
        </div>

        <VolunteerActivityTable
          data={volunteerActivities}
          total={total}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
          error={!!error}
        />
      </div>
    </div>
  );
}
