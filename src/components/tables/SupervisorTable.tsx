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
  Supervisor,
  SupervisorStatus,
  SupervisorFilters,
} from "@/types/http/supervisor.types";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { FilterInput } from "../ui/FilterInput";
import { MixedText } from "@/components/ui/MixedText";
import { StatusDropdown } from "../ui/StatusDropdown";
import { StatusBadge, StatusBadgeColor } from "../ui/StatusBadge";

const supervisorStatusColor: Record<SupervisorStatus, StatusBadgeColor> = {
  [SupervisorStatus.ACTIVE]: "green",
  [SupervisorStatus.PENDING]: "yellow",
  [SupervisorStatus.REJECTED]: "red",
  [SupervisorStatus.SUSPENDED]: "gray",
  [SupervisorStatus.RETIRED]: "purple",
};
import { ViewSupervisorModal } from "../modals/supervisors/ViewSupervisorModal";
import { EditSupervisorModal } from "../modals/supervisors/EditSupervisorModal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import {
  useBlockSupervisor,
  useUnblockSupervisor,
} from "@/hooks/http/useSupervisors";

interface SupervisorTableProps {
  data: Supervisor[];
  pagination?: PaginationMeta;
  filters: SupervisorFilters;
  onFiltersChange: (filters: SupervisorFilters) => void;
  onViewProcedures: (supervisor: Supervisor) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<Supervisor>();

export function SupervisorTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onViewProcedures,
  loading = false,
  error = false,
}: SupervisorTableProps) {
  const t = useTranslations("supervisors.table");
  const tStatus = useTranslations("supervisors.status");
  const tBlock = useTranslations("supervisors.blockConfirm");
  const tUnblock = useTranslations("supervisors.unblockConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  // Local filter state (before applying)
  const [localFilters, setLocalFilters] = useState<SupervisorFilters>(filters);

  // Modal states
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);

  // Hooks
  const { blockSupervisorMutate, blockSupervisorPending } =
    useBlockSupervisor();
  const { unblockSupervisorMutate, unblockSupervisorPending } =
    useUnblockSupervisor();

  const statusOptions = useMemo(
    () => [
      { value: SupervisorStatus.PENDING, label: tStatus("pending") },
      { value: SupervisorStatus.ACTIVE, label: tStatus("active") },
      { value: SupervisorStatus.REJECTED, label: tStatus("rejected") },
      { value: SupervisorStatus.SUSPENDED, label: tStatus("suspended") },
      { value: SupervisorStatus.RETIRED, label: tStatus("retired") },
    ],
    [tStatus],
  );

  // Action handlers
  const handleView = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsViewModalOpen(true);
  };

  const handleEdit = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsEditModalOpen(true);
  };

  const handleBlockClick = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsBlockDialogOpen(true);
  };

  const handleBlockConfirm = () => {
    if (selectedSupervisor) {
      blockSupervisorMutate(selectedSupervisor.id, {
        onSuccess: () => {
          setIsBlockDialogOpen(false);
          setSelectedSupervisor(null);
        },
      });
    }
  };

  const handleUnblockClick = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsUnblockDialogOpen(true);
  };

  const handleUnblockConfirm = () => {
    if (selectedSupervisor) {
      unblockSupervisorMutate(selectedSupervisor.id, {
        onSuccess: () => {
          setIsUnblockDialogOpen(false);
          setSelectedSupervisor(null);
        },
      });
    }
  };

  // Filter handlers
  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1, limit: filters.limit });
  };

  const handleClearFilters = () => {
    const clearedFilters: SupervisorFilters = {
      username: "",
      status: [],
      page: 1,
      limit: filters.limit,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const columns = useMemo<ColumnDef<Supervisor, any>[]>(
    () => [
      columnHelper.accessor("username", {
        header: t("username"),
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
        size: 150,
      }),
      columnHelper.accessor("fullName", {
        header: t("fullName"),
        cell: (info) => (
          <div className="font-medium text-gray-900 max-w-[200px]">
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
          const status = info.getValue() as SupervisorStatus;
          return (
            <StatusBadge
              color={supervisorStatusColor[status]}
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
          const supervisor = info.row.original;
          const isBlocked = !!supervisor.blockedAt;
          return (
            <div className="flex justify-center gap-1">
              <button
                onClick={() => handleView(supervisor)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(supervisor)}
                className="p-1.5 text-wheat hover:bg-wheat/10 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewProcedures(supervisor)}
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                title={t("viewProcedures")}
              >
                <ClipboardList className="w-4 h-4" />
              </button>
              {isBlocked ? (
                <button
                  onClick={() => handleUnblockClick(supervisor)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title={t("unblock")}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleBlockClick(supervisor)}
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
              label={t("filterUsername")}
              placeholder={t("filterUsernamePlaceholder")}
              value={localFilters.username || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, username: value })
              }
              onEnter={handleApplyFilters}
            />

            <StatusDropdown
              label={t("filterStatus")}
              placeholder={t("filterStatusPlaceholder")}
              value={localFilters.status?.[0] || ""}
              onChange={(value) => {
                const newStatus = value ? [value as SupervisorStatus] : [];
                const newFilters = { ...localFilters, status: newStatus, page: 1, limit: filters.limit };
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
      <ViewSupervisorModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        supervisor={selectedSupervisor}
      />

      <EditSupervisorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        supervisor={selectedSupervisor}
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
        isLoading={blockSupervisorPending}
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
        isLoading={unblockSupervisorPending}
      />
    </>
  );
}
