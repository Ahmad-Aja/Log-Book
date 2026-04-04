"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import { useTranslations, useLocale } from "next-intl";
import {
  StudentProcedure,
  StudentProcedureFilters,
  StudentProcedureStatus,
  StudentProcedureSortOrder,
} from "@/types/http/student-procedure.types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterInput } from "@/components/ui/FilterInput";
import { MixedText } from "@/components/ui/MixedText";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";

const procedureStatusColor: Record<StudentProcedureStatus, StatusBadgeColor> = {
  [StudentProcedureStatus.PENDING]: "yellow",
  [StudentProcedureStatus.APPROVED]: "green",
  [StudentProcedureStatus.REJECTED]: "red",
};
import { ViewStudentProcedureModal } from "@/components/modals/student-procedures/ViewStudentProcedureModal";
import { EditStudentProcedureModal } from "@/components/modals/student-procedures/EditStudentProcedureModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteStudentProcedure } from "@/hooks/http/useStudentProcedures";

interface StudentProcedureTableProps {
  data: StudentProcedure[];
  total: number;
  filters: StudentProcedureFilters;
  onFiltersChange: (filters: StudentProcedureFilters) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<StudentProcedure>();

export function StudentProcedureTable({
  data,
  total,
  filters,
  onFiltersChange,
  loading = false,
  error = false,
}: StudentProcedureTableProps) {
  const t = useTranslations("studentProcedures.table");
  const tStatus = useTranslations("studentProcedures.status");
  const tDelete = useTranslations("studentProcedures.deleteConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  // Local pre-apply filter state
  const [localFilters, setLocalFilters] =
    useState<StudentProcedureFilters>(filters);

  // Sync local draft when URL-driven filters change (back/forward navigation, pagination)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Modal state
  const [selectedRecord, setSelectedRecord] =
    useState<StudentProcedure | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deleteStudentProcedureMutate, deleteStudentProcedurePending } =
    useDeleteStudentProcedure();

  const statusOptions = useMemo(
    () => [
      { value: StudentProcedureStatus.PENDING, label: tStatus("pending") },
      { value: StudentProcedureStatus.APPROVED, label: tStatus("approved") },
      { value: StudentProcedureStatus.REJECTED, label: tStatus("rejected") },
    ],
    [tStatus],
  );

  const scoreOptions = useMemo(
    () => [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) })),
    [],
  );

  const handleView = (record: StudentProcedure) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEdit = (record: StudentProcedure) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (record: StudentProcedure) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedRecord) {
      deleteStudentProcedureMutate(selectedRecord.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedRecord(null);
        },
      });
    }
  };

  const handleApplyFilters = () => {
    onFiltersChange({
      ...localFilters,
      page: 1,
      // Clear navigation ID filters when user applies their own text filters
      studentId: undefined,
      procedureId: undefined,
      supervisorId: undefined,
    });
  };

  const handleClearFilters = () => {
    const cleared: StudentProcedureFilters = {
      page: 1,
      limit: filters.limit,
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const columns = useMemo<ColumnDef<StudentProcedure, any>[]>(
    () => [
      columnHelper.accessor((row) => row.student.fullName, {
        id: "student",
        header: t("student"),
        cell: (info) => (
          <div className="text-sm">
            <div className="font-medium text-gray-900"><MixedText text={info.getValue() as string} /></div>
            <div className="text-gray-500 text-xs">
              {info.row.original.student.universityId}
            </div>
          </div>
        ),
        size: 180,
      }),
      columnHelper.accessor(
        (row) => (locale === "ar" ? row.procedure.arName : row.procedure.enName),
        {
          id: "procedure",
          header: t("procedure"),
          cell: (info) => (
            <span className="text-sm font-medium text-gray-900">
              <MixedText text={info.getValue() as string} />
            </span>
          ),
          size: 160,
        },
      ),
      columnHelper.accessor((row) => row.supervisor.fullName, {
        id: "supervisor",
        header: t("supervisor"),
        cell: (info) => (
          <span className="text-sm text-gray-700"><MixedText text={info.getValue() as string} /></span>
        ),
        size: 150,
      }),
      columnHelper.accessor("evaluationScore", {
        header: t("evaluationScore"),
        cell: (info) => (
          <span className="font-semibold text-wheat">{info.getValue()} / 5</span>
        ),
        size: 80,
      }),
      columnHelper.accessor("status", {
        header: t("status"),
        cell: (info) => {
          const status = info.getValue() as StudentProcedureStatus;
          const label = {
            [StudentProcedureStatus.PENDING]: tStatus("pending"),
            [StudentProcedureStatus.APPROVED]: tStatus("approved"),
            [StudentProcedureStatus.REJECTED]: tStatus("rejected"),
          }[status];
          return <StatusBadge color={procedureStatusColor[status]} label={label} />;
        },
        size: 110,
      }),
      columnHelper.accessor("createdAt", {
        header: t("createdAt"),
        cell: (info) => (
          <span className="text-gray-600 text-xs">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
        size: 100,
      }),
      columnHelper.display({
        id: "actions",
        header: t("actions"),
        cell: (info) => {
          const record = info.row.original;
          return (
            <div className="flex justify-center gap-1">
              <button
                onClick={() => handleView(record)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(record)}
                className="p-1.5 text-wheat hover:bg-wheat/10 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClick(record)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title={t("delete")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 120,
      }),
    ],
    [t, tStatus, locale],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentPage = filters.page || 1;
  const totalPages = Math.max(1, Math.ceil(total / (filters.limit || 10)));
  const limit = filters.limit || 10;
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = Math.min(currentPage * limit, total);

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterInput
              label={t("filterStudentName")}
              placeholder={t("filterStudentNamePlaceholder")}
              value={localFilters.studentFullname || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, studentFullname: value })
              }
              onEnter={handleApplyFilters}
            />
            <FilterInput
              label={t("filterProcedureName")}
              placeholder={t("filterProcedureNamePlaceholder")}
              value={localFilters.procedureName || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, procedureName: value })
              }
              onEnter={handleApplyFilters}
            />
            <FilterInput
              label={t("filterSupervisorName")}
              placeholder={t("filterSupervisorNamePlaceholder")}
              value={localFilters.supervisorFullname || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, supervisorFullname: value })
              }
              onEnter={handleApplyFilters}
            />
            <StatusDropdown
              label={t("filterStatus")}
              placeholder={t("filterStatusPlaceholder")}
              value={localFilters.status || ""}
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  status: (value as StudentProcedureStatus) || undefined,
                  page: 1,
                  studentId: undefined,
                  procedureId: undefined,
                  supervisorId: undefined,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={statusOptions}
              showAllOption={true}
              allOptionLabel={t("filterStatusAll")}
            />
            <StatusDropdown
              label={t("filterScore")}
              placeholder={t("filterScorePlaceholder")}
              value={
                localFilters.evaluationScore !== undefined
                  ? String(localFilters.evaluationScore)
                  : ""
              }
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  evaluationScore: value ? Number(value) : undefined,
                  page: 1,
                  studentId: undefined,
                  procedureId: undefined,
                  supervisorId: undefined,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={scoreOptions}
              showAllOption={true}
              allOptionLabel={t("filterScoreAll")}
            />
            <div className="flex gap-2 items-end">
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
              <Button
                variant="secondary"
                onClick={() => onFiltersChange({ ...filters, page: 1 })}
                disabled={currentPage <= 1}
                className="p-2 hidden md:flex"
              >
                {isRTL ? (
                  <ChevronsRight className="w-4 h-4" />
                ) : (
                  <ChevronsLeft className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  onFiltersChange({ ...filters, page: currentPage - 1 })
                }
                disabled={currentPage <= 1}
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
              <Button
                variant="secondary"
                onClick={() =>
                  onFiltersChange({ ...filters, page: currentPage + 1 })
                }
                disabled={currentPage >= totalPages}
                className="p-2"
              >
                {isRTL ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => onFiltersChange({ ...filters, page: totalPages })}
                disabled={currentPage >= totalPages}
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
      <ViewStudentProcedureModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        record={selectedRecord}
      />
      <EditStudentProcedureModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={selectedRecord}
      />
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={tDelete("title")}
        message={tDelete("message")}
        confirmText={tDelete("confirm")}
        cancelText={tDelete("cancel")}
        variant="danger"
        isLoading={deleteStudentProcedurePending}
      />
    </>
  );
}
