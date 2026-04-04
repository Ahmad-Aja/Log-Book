"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { APP_CONFIG } from "@/constants/app-config";
import { StatusCard } from "@/components/ui/StatusCard";
import { ProtocolTable } from "@/components/tables/ProtocolTable";
import { AddProtocolModal } from "@/components/modals/protocols/AddProtocolModal";
import { ProtocolFilters } from "@/types/http/protocol.types";
import { useProtocols, useProtocolStatistics } from "@/hooks/http/useProtocols";
import { Button } from "@/components/ui/Button";

export default function ProtocolsPage() {
  const t = useTranslations("protocols");
  const { setTitle } = usePageTitle();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState<ProtocolFilters>({
    page: 1,
    limit: APP_CONFIG.defaultPageSize,
  });

  const { protocols, total, isLoading, error } = useProtocols(filters);
  const { statistics, isLoading: isLoadingStats, error: statsError } =
    useProtocolStatistics();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title={t("statistics.total")}
          count={statistics?.totalCount ?? 0}
          icon={BookOpen}
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

        <ProtocolTable
          data={protocols}
          total={total}
          filters={filters}
          onFiltersChange={setFilters}
          loading={isLoading}
          error={!!error}
        />
      </div>

      <AddProtocolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
