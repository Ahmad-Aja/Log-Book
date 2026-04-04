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
  Protocol,
  ProtocolFilters,
  ProtocolStatus,
} from "@/types/http/protocol.types";
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
import { ViewProtocolModal } from "@/components/modals/protocols/ViewProtocolModal";
import { EditProtocolModal } from "@/components/modals/protocols/EditProtocolModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteProtocol } from "@/hooks/http/useProtocols";

const statusColor: Record<ProtocolStatus, StatusBadgeColor> = {
  [ProtocolStatus.PENDING]: "yellow",
  [ProtocolStatus.APPROVED]: "green",
  [ProtocolStatus.REJECTED]: "red",
};

interface ProtocolTableProps {
  data: Protocol[];
  total: number;
  filters: ProtocolFilters;
  onFiltersChange: (filters: ProtocolFilters) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<Protocol>();

export function ProtocolTable({
  data,
  total,
  filters,
  onFiltersChange,
  loading = false,
  error = false,
}: ProtocolTableProps) {
  const t = useTranslations("protocols.table");
  const tStatus = useTranslations("protocols.status");
  const tDelete = useTranslations("protocols.deleteConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [localFilters, setLocalFilters] = useState<ProtocolFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(
    null,
  );
  const [viewProtocolId, setViewProtocolId] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deleteProtocolMutate, deleteProtocolPending } = useDeleteProtocol();

  const statusOptions = useMemo(
    () => [
      { value: ProtocolStatus.PENDING, label: tStatus("pending") },
      { value: ProtocolStatus.APPROVED, label: tStatus("approved") },
      { value: ProtocolStatus.REJECTED, label: tStatus("rejected") },
    ],
    [tStatus],
  );

  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1 });
  };

  const handleClearFilters = () => {
    const cleared: ProtocolFilters = { page: 1, limit: filters.limit };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const handleDeleteConfirm = () => {
    if (selectedProtocol) {
      deleteProtocolMutate(selectedProtocol.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedProtocol(null);
        },
      });
    }
  };

  const columns = useMemo<ColumnDef<Protocol, any>[]>(
    () => [
      columnHelper.display({
        id: "title",
        header: t("arTitle"),
        cell: (info) => {
          const record = info.row.original;
          const title = locale === "ar" ? record.arTitle : record.enTitle;
          const subtitle = locale === "ar" ? record.enTitle : record.arTitle;
          return (
            <div className="min-w-[100px] text-center w-full">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                <MixedText text={title} />
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                <MixedText text={subtitle} />
              </p>
            </div>
          );
        },
        size: 200,
      }),
      columnHelper.accessor("procedureId", {
        header: t("procedure"),
        cell: (info) => (
          <span className="text-sm text-gray-600">#{info.getValue()}</span>
        ),
        size: 100,
      }),
      columnHelper.accessor("status", {
        header: t("status"),
        cell: (info) => {
          const status = info.getValue() as ProtocolStatus;
          const labelMap: Record<ProtocolStatus, string> = {
            [ProtocolStatus.PENDING]: tStatus("pending"),
            [ProtocolStatus.APPROVED]: tStatus("approved"),
            [ProtocolStatus.REJECTED]: tStatus("rejected"),
          };
          return (
            <StatusBadge color={statusColor[status]} label={labelMap[status]} />
          );
        },
        size: 110,
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
                  setViewProtocolId(record.id);
                  setIsViewModalOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedProtocol(record);
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedProtocol(record);
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
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterInput
              label={t("searchLabel")}
              placeholder={t("searchPlaceholder")}
              value={localFilters.search || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, search: value })
              }
              onEnter={handleApplyFilters}
            />
            <StatusDropdown
              label={t("statusLabel")}
              placeholder={t("statusPlaceholder")}
              value={localFilters.status || ""}
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  status: (value as ProtocolStatus) || undefined,
                  page: 1,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={statusOptions}
              showAllOption
              allOptionLabel={t("statusAll")}
            />
            <div className="flex gap-2 items-end">
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                className="flex-1"
              >
                {t("filterClear")}
              </Button>
              <Button onClick={handleApplyFilters} className="flex-1">
                {t("filterApply")}
              </Button>
            </div>
          </div>
        </div>

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

      <ViewProtocolModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewProtocolId(null);
        }}
        protocolId={viewProtocolId}
      />
      <EditProtocolModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        protocol={selectedProtocol}
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
        isLoading={deleteProtocolPending}
      />
    </>
  );
}
