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
  Announcement,
  AnnouncementFilters,
  AnnouncementTargetAudience,
} from "@/types/http/announcement.types";
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
import { StatusBadge, StatusBadgeColor } from "@/components/ui/StatusBadge";
import { ViewAnnouncementModal } from "@/components/modals/announcements/ViewAnnouncementModal";
import { EditAnnouncementModal } from "@/components/modals/announcements/EditAnnouncementModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteAnnouncement } from "@/hooks/http/useAnnouncements";

interface AnnouncementTableProps {
  data: Announcement[];
  total: number;
  filters: AnnouncementFilters;
  onFiltersChange: (filters: AnnouncementFilters) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<Announcement>();

const audienceBadgeColor: Record<AnnouncementTargetAudience, StatusBadgeColor> =
  {
    [AnnouncementTargetAudience.STUDENTS]: "blue",
    [AnnouncementTargetAudience.SUPERVISORS]: "purple",
    [AnnouncementTargetAudience.ALL]: "green",
  };

export function AnnouncementTable({
  data,
  total,
  filters,
  onFiltersChange,
  loading = false,
  error = false,
}: AnnouncementTableProps) {
  const t = useTranslations("announcements.table");
  const tAudience = useTranslations("announcements.targetAudience");
  const tDelete = useTranslations("announcements.deleteConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [localFilters, setLocalFilters] =
    useState<AnnouncementFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { deleteAnnouncementMutate, deleteAnnouncementPending } =
    useDeleteAnnouncement();

  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1 });
  };

  const handleClearFilters = () => {
    const cleared: AnnouncementFilters = { page: 1, limit: filters.limit };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const handleDeleteConfirm = () => {
    if (selectedAnnouncement) {
      deleteAnnouncementMutate(selectedAnnouncement.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedAnnouncement(null);
        },
      });
    }
  };

  const columns = useMemo<ColumnDef<Announcement, any>[]>(
    () => [
      columnHelper.accessor("title", {
        header: t("title"),
        cell: (info) => (
          <div className="text-sm font-medium text-gray-900 max-w-[350px]">
            <MixedText text={info.getValue() as string} truncate />
          </div>
        ),
        size: 220,
      }),
      columnHelper.accessor("type", {
        header: t("type"),
        cell: (info) => (
          <span className="text-sm text-gray-700">
            <MixedText text={info.getValue() as string} />
          </span>
        ),
        size: 120,
      }),
      columnHelper.accessor("targetAudience", {
        header: t("targetAudience"),
        cell: (info) => {
          const audience = info.getValue() as AnnouncementTargetAudience;
          const label = {
            [AnnouncementTargetAudience.STUDENTS]: tAudience("students"),
            [AnnouncementTargetAudience.SUPERVISORS]: tAudience("supervisors"),
            [AnnouncementTargetAudience.ALL]: tAudience("all"),
          }[audience];
          return (
            <StatusBadge color={audienceBadgeColor[audience]} label={label} />
          );
        },
        size: 120,
      }),
      columnHelper.accessor((row) => row.createdBy?.fullName ?? "—", {
        id: "createdBy",
        header: t("createdBy"),
        cell: (info) => (
          <span className="text-sm text-gray-600">
            <MixedText text={info.getValue() as string} />
          </span>
        ),
        size: 140,
      }),
      columnHelper.accessor("createdAt", {
        header: t("createdAt"),
        cell: (info) => (
          <span className="text-gray-500 text-xs">
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
                onClick={() => {
                  setSelectedAnnouncement(record);
                  setIsViewModalOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedAnnouncement(record);
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-wheat hover:bg-wheat/10 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedAnnouncement(record);
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
        size: 100,
      }),
    ],
    [t, tAudience],
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
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
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
            <FilterInput
              label={t("filterType")}
              placeholder={t("filterTypePlaceholder")}
              value={localFilters.type || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, type: value })
              }
              onEnter={handleApplyFilters}
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
      <ViewAnnouncementModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        announcement={selectedAnnouncement}
      />
      <EditAnnouncementModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        announcement={selectedAnnouncement}
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
        isLoading={deleteAnnouncementPending}
      />
    </>
  );
}
