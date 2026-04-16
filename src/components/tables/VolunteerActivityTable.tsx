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
  VolunteerActivity,
  VolunteerActivityFilters,
  VolunteerActivityStatus,
} from "@/types/http/volunteer-activity.types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterInput } from "@/components/ui/FilterInput";
import { MixedText } from "@/components/ui/MixedText";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { ViewVolunteerActivityModal } from "@/components/modals/volunteer-activities/ViewVolunteerActivityModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useDeleteVolunteerActivity,
  useUpdateVolunteerActivityStatus,
} from "@/hooks/http/useVolunteerActivities";

const activityStatusColor: Record<VolunteerActivityStatus, StatusBadgeColor> = {
  [VolunteerActivityStatus.PENDING]: "yellow",
  [VolunteerActivityStatus.APPROVED]: "green",
  [VolunteerActivityStatus.REJECTED]: "red",
};

interface VolunteerActivityTableProps {
  data: VolunteerActivity[];
  total: number;
  filters: VolunteerActivityFilters;
  onFiltersChange: (filters: VolunteerActivityFilters) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<VolunteerActivity>();

export function VolunteerActivityTable({
  data,
  total,
  filters,
  onFiltersChange,
  loading = false,
  error = false,
}: VolunteerActivityTableProps) {
  const t = useTranslations("volunteerActivities.table");
  const tStatus = useTranslations("volunteerActivities.status");
  const tDelete = useTranslations("volunteerActivities.deleteConfirm");
  const tApprove = useTranslations("volunteerActivities.approveConfirm");
  const tReject = useTranslations("volunteerActivities.rejectConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [localFilters, setLocalFilters] =
    useState<VolunteerActivityFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const [selectedActivity, setSelectedActivity] =
    useState<VolunteerActivity | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { deleteVolunteerActivityMutate, deleteVolunteerActivityPending } =
    useDeleteVolunteerActivity();
  const {
    updateVolunteerActivityStatusMutate,
    updateVolunteerActivityStatusPending,
  } = useUpdateVolunteerActivityStatus();

  const statusOptions = useMemo(
    () => [
      {
        value: VolunteerActivityStatus.PENDING,
        label: tStatus("pending"),
      },
      {
        value: VolunteerActivityStatus.APPROVED,
        label: tStatus("approved"),
      },
      {
        value: VolunteerActivityStatus.REJECTED,
        label: tStatus("rejected"),
      },
    ],
    [tStatus],
  );

  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1, studentId: undefined });
  };

  const handleClearFilters = () => {
    const cleared: VolunteerActivityFilters = {
      page: 1,
      limit: filters.limit,
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const handleDeleteConfirm = () => {
    if (selectedActivity) {
      deleteVolunteerActivityMutate(selectedActivity.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedActivity(null);
        },
      });
    }
  };

  const handleApproveConfirm = () => {
    if (selectedActivity) {
      updateVolunteerActivityStatusMutate(
        { id: selectedActivity.id, dto: { status: "approved" } },
        {
          onSuccess: () => {
            setIsApproveDialogOpen(false);
            setSelectedActivity(null);
          },
        },
      );
    }
  };

  const handleRejectConfirm = () => {
    if (selectedActivity) {
      updateVolunteerActivityStatusMutate(
        { id: selectedActivity.id, dto: { status: "rejected" } },
        {
          onSuccess: () => {
            setIsRejectDialogOpen(false);
            setSelectedActivity(null);
          },
        },
      );
    }
  };

  const columns = useMemo<ColumnDef<VolunteerActivity, any>[]>(
    () => [
      columnHelper.display({
        id: "title",
        header: t("title"),
        cell: (info) => {
          const record = info.row.original;
          const title = locale === "ar" ? record.arTitle : record.enTitle;
          const subtitle = locale === "ar" ? record.enTitle : record.arTitle;
          return (
            <div className="min-w-[150px] w-full">
              <p className="text-sm font-medium text-gray-900 overflow-hidden whitespace-nowrap text-ellipsis">
                <MixedText text={title} />
              </p>
              <p className="text-xs text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis">
                <MixedText text={subtitle} />
              </p>
            </div>
          );
        },
        size: 200,
      }),
      columnHelper.accessor("status", {
        header: t("status"),
        cell: (info) => {
          const status = info.getValue() as VolunteerActivityStatus;
          const label = {
            [VolunteerActivityStatus.PENDING]: tStatus("pending"),
            [VolunteerActivityStatus.APPROVED]: tStatus("approved"),
            [VolunteerActivityStatus.REJECTED]: tStatus("rejected"),
          }[status];
          return (
            <StatusBadge color={activityStatusColor[status]} label={label} />
          );
        },
        size: 100,
      }),
      columnHelper.accessor("activityDate", {
        header: t("activityDate"),
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
        size: 110,
      }),
      columnHelper.display({
        id: "student",
        header: t("student"),
        cell: (info) => {
          const { student } = info.row.original;
          return (
            <div className="max-w-[160px]">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                <MixedText text={student.fullName} />
              </p>
              <p className="text-xs text-gray-500">{student.universityId}</p>
            </div>
          );
        },
        size: 160,
      }),
      columnHelper.display({
        id: "supervisor",
        header: t("supervisor"),
        cell: (info) => {
          const { supervisor } = info.row.original;
          return (
            <span className="text-sm text-gray-700 line-clamp-1 max-w-[140px] block">
              <MixedText text={supervisor.fullName} />
            </span>
          );
        },
        size: 140,
      }),
      columnHelper.display({
        id: "actions",
        header: t("actions"),
        cell: (info) => {
          const record = info.row.original;
          return (
            <div className="flex justify-center gap-1">
              <button
                onClick={() => {
                  setSelectedActivity(record);
                  setIsViewModalOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              {record.status === VolunteerActivityStatus.PENDING && (
                <>
                  <button
                    onClick={() => {
                      setSelectedActivity(record);
                      setIsApproveDialogOpen(true);
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title={t("approve")}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedActivity(record);
                      setIsRejectDialogOpen(true);
                    }}
                    className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                    title={t("reject")}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setSelectedActivity(record);
                  setIsDeleteDialogOpen(true);
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title={t("delete")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 160,
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
              label={t("filterSearch")}
              placeholder={t("filterSearchPlaceholder")}
              value={localFilters.search || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, search: value })
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
                  status: (value as VolunteerActivityStatus) || undefined,
                  page: 1,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={statusOptions}
              showAllOption
              allOptionLabel={t("filterStatusAll")}
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
                        <td key={cell.id} className="px-6 py-4 text-center">
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
                onClick={() =>
                  onFiltersChange({ ...filters, page: totalPages })
                }
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
      <ViewVolunteerActivityModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        activity={selectedActivity}
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
        isLoading={deleteVolunteerActivityPending}
      />
      <ConfirmDialog
        isOpen={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        onConfirm={handleApproveConfirm}
        title={tApprove("title")}
        message={tApprove("message")}
        confirmText={tApprove("confirm")}
        cancelText={tApprove("cancel")}
        variant="default"
        isLoading={updateVolunteerActivityStatusPending}
      />
      <ConfirmDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleRejectConfirm}
        title={tReject("title")}
        message={tReject("message")}
        confirmText={tReject("confirm")}
        cancelText={tReject("cancel")}
        variant="danger"
        isLoading={updateVolunteerActivityStatusPending}
      />
    </>
  );
}
