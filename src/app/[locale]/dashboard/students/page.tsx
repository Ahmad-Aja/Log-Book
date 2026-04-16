"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePageTitle } from "@/providers/PageTitleProvider";
import {
  UserCheck,
  UserX,
  Clock,
  Ban,
  Plus,
  GraduationCap,
  UserMinus,
} from "lucide-react";
import { StatusCard } from "@/components/ui/StatusCard";
import { StudentTable } from "@/components/tables/StudentTable";
import { AddStudentModal } from "@/components/modals/students/AddStudentModal";
import { Button } from "@/components/ui/Button";
import { Student, StudentFilters, StudentStatus } from "@/types/http/student.types";
import { useStudents, useStudentStatistics } from "@/hooks/http/useStudents";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";

export default function StudentsPage() {
  const t = useTranslations("students");
  const { setTitle } = usePageTitle();
  const locale = useLocale();
  const router = useRouterWithLoader();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [filters, setFilters] = useState<StudentFilters>({
    universityId: "",
    status: [],
    page: 1,
    limit: 10,
  });

  const handleFiltersChange = useCallback((newFilters: StudentFilters) => {
    setFilters(newFilters);
  }, []);

  const handleViewProcedures = useCallback(
    (student: Student) => {
      router.push(
        `/${locale}/dashboard/student-procedures?studentId=${student.id}&studentFullname=${encodeURIComponent(student.fullName)}`,
      );
    },
    [router, locale],
  );

  const handleViewVolunteerActivities = useCallback(
    (student: Student) => {
      router.push(
        `/${locale}/dashboard/volunteer-activities?studentId=${student.id}`,
      );
    },
    [router, locale],
  );

  const {
    students,
    pagination,
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useStudents(filters);

  const {
    statistics,
    isLoading: isLoadingStats,
    error: statsError,
  } = useStudentStatistics();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  const statusCounts = {
    pending: statistics?.statusBreakdown[StudentStatus.PENDING] || 0,
    active: statistics?.statusBreakdown[StudentStatus.ACTIVE] || 0,
    rejected: statistics?.statusBreakdown[StudentStatus.REJECTED] || 0,
    suspended: statistics?.statusBreakdown[StudentStatus.SUSPENDED] || 0,
    graduated: statistics?.statusBreakdown[StudentStatus.GRADUATED] || 0,
    withdrawn: statistics?.statusBreakdown[StudentStatus.WITHDRAWN] || 0,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            title={t("status.suspended")}
            count={statusCounts.suspended}
            icon={Ban}
            iconColor="text-gray-600"
            bgColor="bg-gray-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("status.graduated")}
            count={statusCounts.graduated}
            icon={GraduationCap}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            loading={isLoadingStats}
            error={!!statsError}
          />
          <StatusCard
            title={t("status.withdrawn")}
            count={statusCounts.withdrawn}
            icon={UserMinus}
            iconColor="text-orange-600"
            bgColor="bg-orange-50"
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
              {t("addStudent")}
            </Button>
          </div>

          <StudentTable
            data={students}
            pagination={pagination}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onViewProcedures={handleViewProcedures}
            onViewVolunteerActivities={handleViewVolunteerActivities}
            loading={isLoadingStudents}
            error={!!studentsError}
          />
        </div>
      </div>

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
