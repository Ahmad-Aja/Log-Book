"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, Megaphone, Calendar, CalendarDays } from "lucide-react";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { APP_CONFIG } from "@/constants/app-config";
import { StatusCard } from "@/components/ui/StatusCard";
import { AnnouncementTable } from "@/components/tables/AnnouncementTable";
import { AddAnnouncementModal } from "@/components/modals/announcements/AddAnnouncementModal";
import { Button } from "@/components/ui/Button";
import { AnnouncementFilters } from "@/types/http/announcement.types";
import {
  useAnnouncements,
  useAnnouncementStatistics,
} from "@/hooks/http/useAnnouncements";

export default function AnnouncementsPage() {
  const t = useTranslations("announcements");
  const { setTitle } = usePageTitle();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState<AnnouncementFilters>({
    page: 1,
    limit: APP_CONFIG.defaultPageSize,
  });

  const { announcements, total, isLoading, error } = useAnnouncements(filters);
  const { statistics, isLoading: isLoadingStats, error: statsError } =
    useAnnouncementStatistics();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title={t("statistics.total")}
            count={statistics?.total || 0}
            icon={Megaphone}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("statistics.thisMonth")}
            count={statistics?.thisMonth || 0}
            icon={Calendar}
            iconColor="text-wheat"
            bgColor="bg-amber-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("statistics.thisWeek")}
            count={statistics?.thisWeek || 0}
            icon={CalendarDays}
            iconColor="text-green-600"
            bgColor="bg-green-50"
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
              {t("addAnnouncement")}
            </Button>
          </div>

          <AnnouncementTable
            data={announcements}
            total={total}
            filters={filters}
            onFiltersChange={setFilters}
            loading={isLoading}
            error={!!error}
          />
        </div>
      </div>

      <AddAnnouncementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
