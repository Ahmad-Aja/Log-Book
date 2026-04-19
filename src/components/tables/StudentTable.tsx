"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import { useTranslations, useLocale } from "next-intl";
import {
  Student,
  StudentStatus,
  StudentFilters,
} from "@/types/http/student.types";

import { PaginationMeta } from "@/types/http/auth.types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Ban,
  CheckCircle,
  ClipboardList,
  HandHeart,
  Loader2,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { Button } from "../ui/Button";
import { FilterInput } from "../ui/FilterInput";
import { MixedText } from "@/components/ui/MixedText";
import { StatusDropdown } from "../ui/StatusDropdown";
import { StatusBadge, StatusBadgeColor } from "../ui/StatusBadge";

const studentStatusColor: Record<StudentStatus, StatusBadgeColor> = {
  [StudentStatus.ACTIVE]: "green",
  [StudentStatus.PENDING]: "yellow",
  [StudentStatus.REJECTED]: "red",
  [StudentStatus.SUSPENDED]: "gray",
  [StudentStatus.GRADUATED]: "blue",
  [StudentStatus.WITHDRAWN]: "orange",
};
import { ViewStudentModal } from "../modals/students/ViewStudentModal";
import { EditStudentModal } from "../modals/students/EditStudentModal";
import { StudentReportModal } from "../modals/students/StudentReportModal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useBlockStudent, useUnblockStudent } from "@/hooks/http/useStudents";

interface StudentTableProps {
  data: Student[];
  pagination?: PaginationMeta;
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  onViewProcedures: (student: Student) => void;
  onViewVolunteerActivities: (student: Student) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<Student>();

export function StudentTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onViewProcedures,
  onViewVolunteerActivities,
  loading = false,
  error = false,
}: StudentTableProps) {
  const t = useTranslations("students.table");
  const tStatus = useTranslations("students.status");
  const tBlock = useTranslations("students.blockConfirm");
  const tUnblock = useTranslations("students.unblockConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  // Local filter state (before applying)
  const [localFilters, setLocalFilters] = useState<StudentFilters>(filters);

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);

  // Hooks
  const { blockStudentMutate, blockStudentPending } = useBlockStudent();
  const { unblockStudentMutate, unblockStudentPending } = useUnblockStudent();

  const statusOptions = useMemo(
    () => [
      { value: StudentStatus.PENDING, label: tStatus("pending") },
      { value: StudentStatus.ACTIVE, label: tStatus("active") },
      { value: StudentStatus.REJECTED, label: tStatus("rejected") },
      { value: StudentStatus.SUSPENDED, label: tStatus("suspended") },
      { value: StudentStatus.GRADUATED, label: tStatus("graduated") },
      { value: StudentStatus.WITHDRAWN, label: tStatus("withdrawn") },
    ],
    [tStatus],
  );

  const handleViewReport = (student: Student) => {
    setSelectedStudent(student);
    setIsReportModalOpen(true);
  };

  // Action handlers
  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleBlockClick = (student: Student) => {
    setSelectedStudent(student);
    setIsBlockDialogOpen(true);
  };

  const handleBlockConfirm = () => {
    if (selectedStudent) {
      blockStudentMutate(selectedStudent.id, {
        onSuccess: () => {
          setIsBlockDialogOpen(false);
          setSelectedStudent(null);
        },
      });
    }
  };

  const handleUnblockClick = (student: Student) => {
    setSelectedStudent(student);
    setIsUnblockDialogOpen(true);
  };

  const handleUnblockConfirm = () => {
    if (selectedStudent) {
      unblockStudentMutate(selectedStudent.id, {
        onSuccess: () => {
          setIsUnblockDialogOpen(false);
          setSelectedStudent(null);
        },
      });
    }
  };

  // Filter handlers
  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1, limit: filters.limit });
  };

  const handleClearFilters = () => {
    const clearedFilters: StudentFilters = {
      universityId: "",
      status: [],
      page: 1,
      limit: filters.limit,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const columns = useMemo<ColumnDef<Student, any>[]>(
    () => [
      columnHelper.accessor("universityId", {
        header: t("universityId"),
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
        size: 150,
      }),
      columnHelper.accessor("fullName", {
        header: t("fullName"),
        cell: (info) => (
          <div className="font-medium text-gray-900 text-sm max-w-[200px]">
            <MixedText text={info.getValue()} truncate />
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor("phone", {
        header: t("phone"),
        cell: (info) => (
          <span className="text-gray-600 text-sm">{info.getValue()}</span>
        ),
        size: 150,
      }),
      columnHelper.accessor("status", {
        header: t("status"),
        cell: (info) => {
          const status = info.getValue() as StudentStatus;
          return (
            <StatusBadge
              color={studentStatusColor[status]}
              label={tStatus(status.toLowerCase())}
            />
          );
        },
        size: 120,
      }),
      columnHelper.accessor("blockedAt", {
        header: t("blockedAt"),
        cell: (info) => {
          const date = info.getValue() as string | undefined;
          return date ? (
            <span className="text-gray-600 text-sm">
              {new Date(date).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          );
        },
        size: 120,
      }),
      columnHelper.display({
        id: "actions",
        header: t("actions"),
        cell: (info) => {
          const student = info.row.original;
          const isBlocked = !!student.blockedAt;
          return (
            <div className="w-full flex justify-center gap-1.5">
              <button
                onClick={() => handleView(student)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(student)}
                className="p-1.5 text-wheat hover:bg-wheat/10 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewProcedures(student)}
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                title={t("viewProcedures")}
              >
                <ClipboardList className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewVolunteerActivities(student)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                title={t("viewVolunteerActivities")}
              >
                <HandHeart className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewReport(student)}
                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                title={t("viewReport")}
              >
                <FileDown className="w-4 h-4" />
              </button>
              {isBlocked ? (
                <button
                  onClick={() => handleUnblockClick(student)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title={t("unblock")}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleBlockClick(student)}
                  className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                  title={t("block")}
                >
                  <Ban className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        },
        size: 160,
      }),
    ],
    [t, tStatus],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentPage = filters.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;
  const limit = filters.limit || 10;
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = Math.min(currentPage * limit, total);

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <FilterInput
              label={t("filterUniversityId")}
              placeholder={t("filterUniversityIdPlaceholder")}
              value={localFilters.universityId || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, universityId: value })
              }
              onEnter={handleApplyFilters}
            />

            <StatusDropdown
              label={t("filterStatus")}
              placeholder={t("filterStatusPlaceholder")}
              value={localFilters.status?.[0] || ""}
              onChange={(value) => {
                const newStatus = value ? [value as StudentStatus] : [];
                const newFilters = {
                  ...localFilters,
                  status: newStatus,
                  page: 1,
                  limit: filters.limit,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={statusOptions}
              showAllOption={true}
              allOptionLabel={t("filterStatusAll")}
            />

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                className="flex-1"
              >
                {t("clearFilters")}
              </Button>
              <Button onClick={handleApplyFilters} className="flex-1">
                {t("applyFilters")}
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center justify-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="text-gray-500">{t("loading")}</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <span className="text-red-500">{t("error")}</span>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {t("noData")}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-center"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 md:px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-700 hidden md:block">
              {t("showing")} {showingFrom} {t("to")} {showingTo} {t("of")}{" "}
              {total} {t("results")}
            </div>

            <div className="flex items-center gap-2 mx-auto md:mx-0">
              {/* First page button - Hidden on mobile */}
              <Button
                variant="secondary"
                onClick={() => onFiltersChange({ ...filters, page: 1 })}
                disabled={!pagination?.hasPrevPage}
                className="p-2 hidden md:flex"
              >
                {isRTL ? (
                  <ChevronsRight className="w-4 h-4" />
                ) : (
                  <ChevronsLeft className="w-4 h-4" />
                )}
              </Button>

              {/* Previous page button */}
              <Button
                variant="secondary"
                onClick={() =>
                  onFiltersChange({ ...filters, page: currentPage - 1 })
                }
                disabled={!pagination?.hasPrevPage}
                className="p-2"
              >
                {isRTL ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>

              <span className="text-sm text-gray-700 min-w-[80px] text-center">
                {t("page")} {currentPage} {t("of")} {totalPages}
              </span>

              {/* Next page button */}
              <Button
                variant="secondary"
                onClick={() =>
                  onFiltersChange({ ...filters, page: currentPage + 1 })
                }
                disabled={!pagination?.hasNextPage}
                className="p-2"
              >
                {isRTL ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>

              {/* Last page button - Hidden on mobile */}
              <Button
                variant="secondary"
                onClick={() =>
                  onFiltersChange({ ...filters, page: totalPages })
                }
                disabled={!pagination?.hasNextPage}
                className="p-2 hidden md:flex"
              >
                {isRTL ? (
                  <ChevronsLeft className="w-4 h-4" />
                ) : (
                  <ChevronsRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        student={selectedStudent}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
      />

      <StudentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        student={selectedStudent}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isBlockDialogOpen}
        onClose={() => setIsBlockDialogOpen(false)}
        onConfirm={handleBlockConfirm}
        title={tBlock("title")}
        message={tBlock("message")}
        confirmText={tBlock("confirm")}
        cancelText={tBlock("cancel")}
        variant="danger"
        isLoading={blockStudentPending}
      />

      <ConfirmDialog
        isOpen={isUnblockDialogOpen}
        onClose={() => setIsUnblockDialogOpen(false)}
        onConfirm={handleUnblockConfirm}
        title={tUnblock("title")}
        message={tUnblock("message")}
        confirmText={tUnblock("confirm")}
        cancelText={tUnblock("cancel")}
        variant="default"
        isLoading={unblockStudentPending}
      />
    </>
  );
}
