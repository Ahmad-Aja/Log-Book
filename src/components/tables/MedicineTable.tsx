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
  Medicine,
  MedicineFilters,
  MedicineStatus,
} from "@/types/http/medicine.types";
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
import { ViewMedicineModal } from "@/components/modals/medicines/ViewMedicineModal";
import { EditMedicineModal } from "@/components/modals/medicines/EditMedicineModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteMedicine } from "@/hooks/http/useMedicines";

const statusColor: Record<MedicineStatus, StatusBadgeColor> = {
  [MedicineStatus.PENDING]: "yellow",
  [MedicineStatus.APPROVED]: "green",
  [MedicineStatus.REJECTED]: "red",
};

interface ApprovedCategory {
  id: number;
  arName: string;
  enName: string;
}

interface MedicineTableProps {
  data: Medicine[];
  total: number;
  filters: MedicineFilters;
  onFiltersChange: (filters: MedicineFilters) => void;
  loading?: boolean;
  error?: boolean;
  approvedCategories: ApprovedCategory[];
}

const columnHelper = createColumnHelper<Medicine>();

export function MedicineTable({
  data,
  total,
  filters,
  onFiltersChange,
  loading = false,
  error = false,
  approvedCategories,
}: MedicineTableProps) {
  const t = useTranslations("medicines.table");
  const tStatus = useTranslations("medicines.status");
  const tDelete = useTranslations("medicines.deleteConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [localFilters, setLocalFilters] = useState<MedicineFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deleteMedicineMutate, deleteMedicinePending } = useDeleteMedicine();

  const statusOptions = useMemo(
    () => [
      { value: MedicineStatus.PENDING, label: tStatus("pending") },
      { value: MedicineStatus.APPROVED, label: tStatus("approved") },
      { value: MedicineStatus.REJECTED, label: tStatus("rejected") },
    ],
    [tStatus],
  );

  const categoryOptions = useMemo(
    () =>
      approvedCategories.map((c) => ({
        value: String(c.id),
        label: locale === "ar" ? c.arName : c.enName,
      })),
    [approvedCategories, locale],
  );

  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1 });
  };

  const handleClearFilters = () => {
    const cleared: MedicineFilters = { page: 1, limit: filters.limit };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const handleDeleteConfirm = () => {
    if (selectedMedicine) {
      deleteMedicineMutate(selectedMedicine.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedMedicine(null);
        },
      });
    }
  };

  const columns = useMemo<ColumnDef<Medicine, any>[]>(
    () => [
      columnHelper.display({
        id: "name",
        header: t("arName"),
        cell: (info) => {
          const record = info.row.original;
          const name = locale === "ar" ? record.arName : record.enName;
          const subName = locale === "ar" ? record.enName : record.arName;
          return (
            <div className="w-full min-w-[100px] text-center">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                <MixedText text={name} />
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                <MixedText text={subName} />
              </p>
            </div>
          );
        },
        size: 180,
      }),
      columnHelper.display({
        id: "category",
        header: t("category"),
        cell: (info) => {
          const { category } = info.row.original;
          return (
            <span className="text-sm text-gray-700">
              <MixedText
                text={locale === "ar" ? category.arName : category.enName}
              />
            </span>
          );
        },
        size: 150,
      }),
      columnHelper.accessor("status", {
        header: t("status"),
        cell: (info) => {
          const status = info.getValue() as MedicineStatus;
          const labelMap: Record<MedicineStatus, string> = {
            [MedicineStatus.PENDING]: tStatus("pending"),
            [MedicineStatus.APPROVED]: tStatus("approved"),
            [MedicineStatus.REJECTED]: tStatus("rejected"),
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
                  setSelectedMedicine(record);
                  setIsViewModalOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedMedicine(record);
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedMedicine(record);
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
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              label={t("categoryLabel")}
              placeholder={t("categoryPlaceholder")}
              value={
                localFilters.categoryId ? String(localFilters.categoryId) : ""
              }
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  categoryId: value ? Number(value) : undefined,
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
              label={t("statusLabel")}
              placeholder={t("statusPlaceholder")}
              value={localFilters.status || ""}
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  status: (value as MedicineStatus) || undefined,
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

      <ViewMedicineModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        medicine={selectedMedicine}
      />
      <EditMedicineModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        medicine={selectedMedicine}
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
        isLoading={deleteMedicinePending}
      />
    </>
  );
}
