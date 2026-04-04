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
  ComplaintSummary,
  ComplaintFilters,
  ComplaintStatus,
  ComplaintCategory,
  ComplaintCreatorType,
} from "@/types/http/complaint.types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { ViewComplaintModal } from "@/components/modals/complaints/ViewComplaintModal";

const statusColor: Record<ComplaintStatus, StatusBadgeColor> = {
  [ComplaintStatus.PENDING]: "yellow",
  [ComplaintStatus.IN_PROGRESS]: "blue",
  [ComplaintStatus.RESOLVED]: "green",
  [ComplaintStatus.CLOSED]: "gray",
};

interface ComplaintTableProps {
  data: ComplaintSummary[];
  total: number;
  filters: ComplaintFilters;
  onFiltersChange: (filters: ComplaintFilters) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<ComplaintSummary>();

export function ComplaintTable({
  data,
  total,
  filters,
  onFiltersChange,
  loading = false,
  error = false,
}: ComplaintTableProps) {
  const t = useTranslations("complaints.table");
  const tStatus = useTranslations("complaints.status");
  const tCategory = useTranslations("complaints.category");
  const tCreatorType = useTranslations("complaints.creatorType");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [localFilters, setLocalFilters] = useState<ComplaintFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const statusOptions = useMemo(
    () => [
      { value: ComplaintStatus.PENDING, label: tStatus("pending") },
      { value: ComplaintStatus.IN_PROGRESS, label: tStatus("in_progress") },
      { value: ComplaintStatus.RESOLVED, label: tStatus("resolved") },
      { value: ComplaintStatus.CLOSED, label: tStatus("closed") },
    ],
    [tStatus],
  );

  const categoryOptions = useMemo(
    () => [
      { value: ComplaintCategory.TECHNICAL, label: tCategory("technical") },
      {
        value: ComplaintCategory.ADMINISTRATIVE,
        label: tCategory("administrative"),
      },
      { value: ComplaintCategory.ACADEMIC, label: tCategory("academic") },
      { value: ComplaintCategory.OTHER, label: tCategory("other") },
    ],
    [tCategory],
  );

  const creatorTypeOptions = useMemo(
    () => [
      { value: ComplaintCreatorType.STUDENT, label: tCreatorType("student") },
      {
        value: ComplaintCreatorType.SUPERVISOR,
        label: tCreatorType("supervisor"),
      },
    ],
    [tCreatorType],
  );

  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1 });
  };

  const handleClearFilters = () => {
    const cleared: ComplaintFilters = { page: 1, limit: filters.limit };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const categoryBadgeColor: Record<ComplaintCategory, StatusBadgeColor> = {
    [ComplaintCategory.TECHNICAL]: "purple",
    [ComplaintCategory.ADMINISTRATIVE]: "orange",
    [ComplaintCategory.ACADEMIC]: "blue",
    [ComplaintCategory.OTHER]: "gray",
  };

  const creatorTypeBadgeColor: Record<ComplaintCreatorType, StatusBadgeColor> =
    {
      [ComplaintCreatorType.STUDENT]: "blue",
      [ComplaintCreatorType.SUPERVISOR]: "purple",
    };

  const columns = useMemo<ColumnDef<ComplaintSummary, any>[]>(
    () => [
      columnHelper.display({
        id: "creatorName",
        header: t("creatorName"),
        cell: (info) => (
          <span className="text-sm text-gray-900">
            {info.row.original.creatorDetails?.fullName ?? "—"}
          </span>
        ),
        size: 150,
      }),
      columnHelper.display({
        id: "creatorType",
        header: t("creatorType"),
        cell: (info) => {
          const ct = info.row.original.creatorType;
          return (
            <StatusBadge
              color={creatorTypeBadgeColor[ct]}
              label={tCreatorType(ct)}
            />
          );
        },
        size: 120,
      }),
      columnHelper.display({
        id: "category",
        header: t("category"),
        cell: (info) => {
          const cat = info.row.original.category;
          return (
            <StatusBadge
              color={categoryBadgeColor[cat]}
              label={tCategory(cat)}
            />
          );
        },
        size: 140,
      }),
      columnHelper.display({
        id: "status",
        header: t("status"),
        cell: (info) => {
          const status = info.row.original.status;
          const labelMap: Record<ComplaintStatus, string> = {
            [ComplaintStatus.PENDING]: tStatus("pending"),
            [ComplaintStatus.IN_PROGRESS]: tStatus("in_progress"),
            [ComplaintStatus.RESOLVED]: tStatus("resolved"),
            [ComplaintStatus.CLOSED]: tStatus("closed"),
          };
          return (
            <StatusBadge color={statusColor[status]} label={labelMap[status]} />
          );
        },
        size: 120,
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
                  setSelectedComplaintId(record.id);
                  setIsViewModalOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 80,
      }),
    ],
    [t, tStatus, tCategory, tCreatorType],
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatusDropdown
              label={t("statusLabel")}
              placeholder={t("statusPlaceholder")}
              value={localFilters.status || ""}
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  status: (value as ComplaintStatus) || undefined,
                  page: 1,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={statusOptions}
              showAllOption
              allOptionLabel={t("statusAll")}
            />
            <StatusDropdown
              label={t("categoryLabel")}
              placeholder={t("categoryPlaceholder")}
              value={localFilters.category || ""}
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  category: (value as ComplaintCategory) || undefined,
                  page: 1,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={categoryOptions}
              showAllOption
              allOptionLabel={t("categoryAll")}
            />
            <StatusDropdown
              label={t("creatorTypeLabel")}
              placeholder={t("creatorTypePlaceholder")}
              value={localFilters.creatorType || ""}
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  creatorType: (value as ComplaintCreatorType) || undefined,
                  page: 1,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={creatorTypeOptions}
              showAllOption
              allOptionLabel={t("creatorTypeAll")}
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
      <ViewComplaintModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedComplaintId(null);
        }}
        complaintId={selectedComplaintId}
      />
    </>
  );
}
