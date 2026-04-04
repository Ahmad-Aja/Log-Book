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
import { Procedure, ProcedureFilters } from "@/types/http/procedure.types";
import { PaginationMeta } from "@/types/http/auth.types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ClipboardList,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { FilterInput } from "../ui/FilterInput";
import { MixedText } from "@/components/ui/MixedText";
import { ViewProcedureModal } from "../modals/procedures/ViewProcedureModal";
import { EditProcedureModal } from "../modals/procedures/EditProcedureModal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import {
  useEnableProcedure,
  useDisableProcedure,
  useDeleteProcedure,
} from "@/hooks/http/useProcedures";

interface ProcedureTableProps {
  data: Procedure[];
  pagination?: PaginationMeta;
  filters: ProcedureFilters;
  onFiltersChange: (filters: ProcedureFilters) => void;
  onViewProcedures: (procedure: Procedure) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<Procedure>();

export function ProcedureTable({
  data,
  pagination,
  filters,
  onFiltersChange,
  onViewProcedures,
  loading = false,
  error = false,
}: ProcedureTableProps) {
  const t = useTranslations("procedures.table");
  const tStatus = useTranslations("procedures.status");
  const tDelete = useTranslations("procedures.deleteConfirm");
  const tDisable = useTranslations("procedures.disableConfirm");
  const tEnable = useTranslations("procedures.enableConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  // Local filter state (before applying)
  const [localNameSearch, setLocalNameSearch] = useState(
    filters.nameSearch || "",
  );

  // Modal states
  const [selectedProcedure, setSelectedProcedure] =
    useState<Procedure | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);

  // Hooks
  const { enableProcedureMutate, enableProcedurePending } =
    useEnableProcedure();
  const { disableProcedureMutate, disableProcedurePending } =
    useDisableProcedure();
  const { deleteProcedureMutate, deleteProcedurePending } =
    useDeleteProcedure();

  // Action handlers
  const handleView = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setIsViewModalOpen(true);
  };

  const handleEdit = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProcedure) {
      deleteProcedureMutate(selectedProcedure.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedProcedure(null);
        },
      });
    }
  };

  const handleDisableClick = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setIsDisableDialogOpen(true);
  };

  const handleDisableConfirm = () => {
    if (selectedProcedure) {
      disableProcedureMutate(selectedProcedure.id, {
        onSuccess: () => {
          setIsDisableDialogOpen(false);
          setSelectedProcedure(null);
        },
      });
    }
  };

  const handleEnableClick = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setIsEnableDialogOpen(true);
  };

  const handleEnableConfirm = () => {
    if (selectedProcedure) {
      enableProcedureMutate(selectedProcedure.id, {
        onSuccess: () => {
          setIsEnableDialogOpen(false);
          setSelectedProcedure(null);
        },
      });
    }
  };

  // Filter handlers
  const handleApplyFilters = () => {
    onFiltersChange({ nameSearch: localNameSearch, page: 1, limit: filters.limit });
  };

  const handleClearFilters = () => {
    setLocalNameSearch("");
    onFiltersChange({ nameSearch: "", page: 1, limit: filters.limit });
  };

  const columns = useMemo<ColumnDef<Procedure, any>[]>(
    () => [
      columnHelper.accessor("arName", {
        header: t("arName"),
        cell: (info) => (
          <span className="font-medium text-gray-900"><MixedText text={info.getValue()} /></span>
        ),
        size: 200,
      }),
      columnHelper.accessor("enName", {
        header: t("enName"),
        cell: (info) => (
          <span className="font-medium text-gray-900"><MixedText text={info.getValue()} /></span>
        ),
        size: 200,
      }),
      columnHelper.accessor("minimumRequired", {
        header: t("minimumRequired"),
        cell: (info) => (
          <span className="text-gray-600 text-sm">{info.getValue()}</span>
        ),
        size: 120,
      }),
      columnHelper.accessor("disabledAt", {
        header: t("status"),
        cell: (info) => {
          const isEnabled = !info.getValue();
          return (
            <span
              className={`inline-flex items-center rounded-md font-medium border px-2.5 py-0.5 text-xs ${
                isEnabled
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {tStatus(isEnabled ? "enabled" : "disabled")}
            </span>
          );
        },
        size: 110,
      }),
      columnHelper.display({
        id: "actions",
        header: t("actions"),
        cell: (info) => {
          const procedure = info.row.original;
          const isEnabled = !procedure.disabledAt;
          return (
            <div className="flex justify-center gap-1">
              <button
                onClick={() => handleView(procedure)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(procedure)}
                className="p-1.5 text-wheat hover:bg-wheat/10 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewProcedures(procedure)}
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                title={t("viewProcedures")}
              >
                <ClipboardList className="w-4 h-4" />
              </button>
              {isEnabled ? (
                <button
                  onClick={() => handleDisableClick(procedure)}
                  className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                  title={t("disable")}
                >
                  <ToggleRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleEnableClick(procedure)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title={t("enable")}
                >
                  <ToggleLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDeleteClick(procedure)}
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
              label={t("filterName")}
              placeholder={t("filterNamePlaceholder")}
              value={localNameSearch}
              onChange={setLocalNameSearch}
              onEnter={handleApplyFilters}
            />

            <div className="flex gap-2 md:col-start-3">
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
      <ViewProcedureModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        procedure={selectedProcedure}
      />

      <EditProcedureModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        procedure={selectedProcedure}
      />

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={tDelete("title")}
        message={tDelete("message")}
        confirmText={tDelete("confirm")}
        cancelText={tDelete("cancel")}
        variant="danger"
        isLoading={deleteProcedurePending}
      />

      <ConfirmDialog
        isOpen={isDisableDialogOpen}
        onClose={() => setIsDisableDialogOpen(false)}
        onConfirm={handleDisableConfirm}
        title={tDisable("title")}
        message={tDisable("message")}
        confirmText={tDisable("confirm")}
        cancelText={tDisable("cancel")}
        variant="danger"
        isLoading={disableProcedurePending}
      />

      <ConfirmDialog
        isOpen={isEnableDialogOpen}
        onClose={() => setIsEnableDialogOpen(false)}
        onConfirm={handleEnableConfirm}
        title={tEnable("title")}
        message={tEnable("message")}
        confirmText={tEnable("confirm")}
        cancelText={tEnable("cancel")}
        variant="default"
        isLoading={enableProcedurePending}
      />
    </>
  );
}
