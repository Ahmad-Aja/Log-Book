"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Clock, Activity, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { APP_CONFIG } from "@/constants/app-config";
import { StatusCard } from "@/components/ui/StatusCard";
import { ComplaintTable } from "@/components/tables/ComplaintTable";
import { ComplaintFilters } from "@/types/http/complaint.types";
import { useComplaints, useComplaintStatistics } from "@/hooks/http/useComplaints";

export default function ComplaintsPage() {
  const t = useTranslations("complaints");
  const { setTitle } = usePageTitle();
  const [filters, setFilters] = useState<ComplaintFilters>({
    page: 1,
    limit: APP_CONFIG.defaultPageSize,
  });

  const { complaints, total, isLoading, error } = useComplaints(filters);
  const { statistics, isLoading: isLoadingStats, error: statsError } =
    useComplaintStatistics();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title={t("statistics.total")}
          count={statistics?.totalComplaints ?? 0}
          icon={MessageSquare}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.pending")}
          count={statistics?.statusBreakdown?.pending ?? 0}
          icon={Clock}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.inProgress")}
          count={statistics?.statusBreakdown?.in_progress ?? 0}
          icon={Activity}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
        <StatusCard
          title={t("statistics.resolved")}
          count={statistics?.statusBreakdown?.resolved ?? 0}
          icon={CheckCircle}
          iconColor="text-green-600"
          bgColor="bg-green-50"
          loading={isLoadingStats}
          error={!!statsError}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("tableTitle")}
          </h2>
        </div>

        <ComplaintTable
          data={complaints}
          total={total}
          filters={filters}
          onFiltersChange={setFilters}
          loading={isLoading}
          error={!!error}
        />
      </div>
    </div>
  );
}
