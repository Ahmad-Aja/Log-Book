"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  MedicineCategory,
  MedicineCategoryFilters,
  MedicineCategoryStatus,
} from "@/types/http/medicine-category.types";
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
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterInput } from "@/components/ui/FilterInput";
import { MixedText } from "@/components/ui/MixedText";
import { StatusDropdown } from "@/components/ui/StatusDropdown";
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { ViewMedicineCategoryModal } from "@/components/modals/medicine-categories/ViewMedicineCategoryModal";
import { EditMedicineCategoryModal } from "@/components/modals/medicine-categories/EditMedicineCategoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteMedicineCategory } from "@/hooks/http/useMedicineCategories";
import { useLocale } from "next-intl";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";

const statusColor: Record<MedicineCategoryStatus, StatusBadgeColor> = {
  [MedicineCategoryStatus.PENDING]: "yellow",
  [MedicineCategoryStatus.APPROVED]: "green",
  [MedicineCategoryStatus.REJECTED]: "red",
};

interface MedicineCategoryTableProps {
  data: MedicineCategory[];
  total: number;
  filters: MedicineCategoryFilters;
  onFiltersChange: (filters: MedicineCategoryFilters) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<MedicineCategory>();

export function MedicineCategoryTable({
  data,
  total,
  filters,
  onFiltersChange,
  loading = false,
  error = false,
}: MedicineCategoryTableProps) {
  const t = useTranslations("medicineCategories.table");
  const tStatus = useTranslations("medicineCategories.status");
  const tDelete = useTranslations("medicineCategories.deleteConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouterWithLoader();

  const [localFilters, setLocalFilters] =
    useState<MedicineCategoryFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const [selectedCategory, setSelectedCategory] =
    useState<MedicineCategory | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deleteMedicineCategoryMutate, deleteMedicineCategoryPending } =
    useDeleteMedicineCategory();

  const statusOptions = useMemo(
    () => [
      { value: MedicineCategoryStatus.PENDING, label: tStatus("pending") },
      { value: MedicineCategoryStatus.APPROVED, label: tStatus("approved") },
      { value: MedicineCategoryStatus.REJECTED, label: tStatus("rejected") },
    ],
    [tStatus],
  );

  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1 });
  };

  const handleClearFilters = () => {
    const cleared: MedicineCategoryFilters = { page: 1, limit: filters.limit };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const handleDeleteConfirm = () => {
    if (selectedCategory) {
      deleteMedicineCategoryMutate(selectedCategory.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedCategory(null);
        },
      });
    }
  };

  const columns = useMemo<ColumnDef<MedicineCategory, any>[]>(
    () => [
      columnHelper.accessor("arName", {
        header: t("arName"),
        cell: (info) => (
          <span className="text-sm font-medium text-gray-900 block text-center">
            <MixedText text={info.getValue() as string} />
          </span>
        ),
        size: 180,
      }),
      columnHelper.accessor("enName", {
        header: t("enName"),
        cell: (info) => (
          <span className="text-sm text-gray-700"><MixedText text={info.getValue() as string} /></span>
        ),
        size: 180,
      }),
      columnHelper.accessor("status", {
        header: t("status"),
        cell: (info) => {
          const status = info.getValue() as MedicineCategoryStatus;
          const labelMap: Record<MedicineCategoryStatus, string> = {
            [MedicineCategoryStatus.PENDING]: tStatus("pending"),
            [MedicineCategoryStatus.APPROVED]: tStatus("approved"),
            [MedicineCategoryStatus.REJECTED]: tStatus("rejected"),
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
                onClick={() =>
                  router.push(
                    `/${locale}/dashboard/medicines?categoryId=${record.id}`,
                  )
                }
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                title={t("seeMedicines")}
              >
                <FlaskConical className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(record);
                  setIsViewModalOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(record);
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(record);
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
    [t, tStatus],
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
                  status: (value as MedicineCategoryStatus) || undefined,
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
      <ViewMedicineCategoryModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        category={selectedCategory}
      />
      <EditMedicineCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={selectedCategory}
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
        isLoading={deleteMedicineCategoryPending}
      />
    </>
  );
}
