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
  MedicalCase,
  MedicalCaseFilters,
  MedicalCaseStatus,
  MedicalCasePublisherRole,
} from "@/types/http/medical-case.types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
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
import { ViewMedicalCaseModal } from "@/components/modals/medical-cases/ViewMedicalCaseModal";
import { EditMedicalCaseModal } from "@/components/modals/medical-cases/EditMedicalCaseModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useDeleteMedicalCase,
  useUpdateMedicalCaseStatus,
} from "@/hooks/http/useMedicalCases";

const caseStatusColor: Record<MedicalCaseStatus, StatusBadgeColor> = {
  [MedicalCaseStatus.PENDING]: "yellow",
  [MedicalCaseStatus.APPROVED]: "green",
  [MedicalCaseStatus.REJECTED]: "red",
};

interface MedicalCaseTableProps {
  data: MedicalCase[];
  total: number;
  filters: MedicalCaseFilters;
  onFiltersChange: (filters: MedicalCaseFilters) => void;
  loading?: boolean;
  error?: boolean;
}

const columnHelper = createColumnHelper<MedicalCase>();

export function MedicalCaseTable({
  data,
  total,
  filters,
  onFiltersChange,
  loading = false,
  error = false,
}: MedicalCaseTableProps) {
  const t = useTranslations("medicalCases.table");
  const tStatus = useTranslations("medicalCases.status");
  const tRole = useTranslations("medicalCases.publisherRole");
  const tDelete = useTranslations("medicalCases.deleteConfirm");
  const tApprove = useTranslations("medicalCases.approveConfirm");
  const tReject = useTranslations("medicalCases.rejectConfirm");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [localFilters, setLocalFilters] = useState<MedicalCaseFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { deleteMedicalCaseMutate, deleteMedicalCasePending } =
    useDeleteMedicalCase();
  const { updateMedicalCaseStatusMutate, updateMedicalCaseStatusPending } =
    useUpdateMedicalCaseStatus();

  const statusOptions = useMemo(
    () => [
      { value: MedicalCaseStatus.PENDING, label: tStatus("pending") },
      { value: MedicalCaseStatus.APPROVED, label: tStatus("approved") },
      { value: MedicalCaseStatus.REJECTED, label: tStatus("rejected") },
    ],
    [tStatus],
  );

  const roleOptions = useMemo(
    () => [
      { value: MedicalCasePublisherRole.STUDENT, label: tRole("student") },
      {
        value: MedicalCasePublisherRole.SUPERVISOR,
        label: tRole("supervisor"),
      },
      { value: MedicalCasePublisherRole.ADMIN, label: tRole("admin") },
    ],
    [tRole],
  );

  const handleApplyFilters = () => {
    onFiltersChange({ ...localFilters, page: 1 });
  };

  const handleClearFilters = () => {
    const cleared: MedicalCaseFilters = { page: 1, limit: filters.limit };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const handleDeleteConfirm = () => {
    if (selectedCase) {
      deleteMedicalCaseMutate(selectedCase.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedCase(null);
        },
      });
    }
  };

  const handleApproveConfirm = () => {
    if (selectedCase) {
      updateMedicalCaseStatusMutate(
        { id: selectedCase.id, dto: { status: "APPROVED" } },
        {
          onSuccess: () => {
            setIsApproveDialogOpen(false);
            setSelectedCase(null);
          },
        },
      );
    }
  };

  const handleRejectConfirm = () => {
    if (selectedCase) {
      updateMedicalCaseStatusMutate(
        { id: selectedCase.id, dto: { status: "REJECTED" } },
        {
          onSuccess: () => {
            setIsRejectDialogOpen(false);
            setSelectedCase(null);
          },
        },
      );
    }
  };

  const columns = useMemo<ColumnDef<MedicalCase, any>[]>(
    () => [
      columnHelper.accessor("title", {
        header: t("title"),
        cell: (info) => (
          <div className="text-sm font-medium text-gray-900 max-w-[300px]">
            <MixedText text={info.getValue() as string} />
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor("publisherRole", {
        header: t("publisherRole"),
        cell: (info) => {
          const role = info.getValue() as MedicalCasePublisherRole;
          const label = {
            [MedicalCasePublisherRole.STUDENT]: tRole("student"),
            [MedicalCasePublisherRole.SUPERVISOR]: tRole("supervisor"),
            [MedicalCasePublisherRole.ADMIN]: tRole("admin"),
          }[role];
          return <span className="text-sm text-gray-700">{label}</span>;
        },
        size: 110,
      }),
      columnHelper.accessor("status", {
        header: t("status"),
        cell: (info) => {
          const status = info.getValue() as MedicalCaseStatus;
          const label = {
            [MedicalCaseStatus.PENDING]: tStatus("pending"),
            [MedicalCaseStatus.APPROVED]: tStatus("approved"),
            [MedicalCaseStatus.REJECTED]: tStatus("rejected"),
          }[status];
          return <StatusBadge color={caseStatusColor[status]} label={label} />;
        },
        size: 100,
      }),
      columnHelper.accessor("hospital", {
        header: t("hospital"),
        cell: (info) => {
          const val = info.getValue() as string | undefined;
          return (
            <span className="text-sm text-gray-600">
              {val ? <MixedText text={val} /> : "—"}
            </span>
          );
        },
        size: 140,
      }),
      columnHelper.accessor("caseDate", {
        header: t("caseDate"),
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
        size: 110,
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
                  setSelectedCase(record);
                  setIsViewModalOpen(true);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={t("view")}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedCase(record);
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-wheat hover:bg-wheat/10 rounded-md transition-colors"
                title={t("edit")}
              >
                <Pencil className="w-4 h-4" />
              </button>
              {record.status === MedicalCaseStatus.PENDING && (
                <>
                  <button
                    onClick={() => {
                      setSelectedCase(record);
                      setIsApproveDialogOpen(true);
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title={t("approve")}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCase(record);
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
                  setSelectedCase(record);
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
    [t, tStatus, tRole],
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
            <FilterInput
              label={t("filterHospital")}
              placeholder={t("filterHospitalPlaceholder")}
              value={localFilters.hospital || ""}
              onChange={(value) =>
                setLocalFilters({ ...localFilters, hospital: value })
              }
              onEnter={handleApplyFilters}
            />
            <StatusDropdown
              label={t("filterStatus")}
              placeholder={t("filterStatusPlaceholder")}
              value={localFilters.status ?? ""}
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  status: (value as MedicalCaseStatus) || undefined,
                  page: 1,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={statusOptions}
              showAllOption
              allOptionLabel={t("filterStatusAll")}
            />
            <StatusDropdown
              label={t("filterPublisherRole")}
              placeholder={t("filterPublisherRolePlaceholder")}
              value={localFilters.publisherRole || ""}
              onChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  publisherRole:
                    (value as MedicalCasePublisherRole) || undefined,
                  page: 1,
                };
                setLocalFilters(newFilters);
                onFiltersChange(newFilters);
              }}
              options={roleOptions}
              showAllOption
              allOptionLabel={t("filterPublisherRoleAll")}
            />
            <div className="flex gap-2 items-end md:col-start-3">
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
      <ViewMedicalCaseModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        medicalCase={selectedCase}
      />
      <EditMedicalCaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        medicalCase={selectedCase}
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
        isLoading={deleteMedicalCasePending}
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
        isLoading={updateMedicalCaseStatusPending}
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
        isLoading={updateMedicalCaseStatusPending}
      />
    </>
  );
}
