import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { medicineCategoryService } from "@/services/medicine-category-service";
import {
  MedicineCategory,
  CreateMedicineCategoryDto,
  UpdateMedicineCategoryDto,
  MedicineCategoryFilters,
  MedicineCategoryStatistics,
} from "@/types/http/medicine-category.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useMedicineCategories(filters: MedicineCategoryFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    items: MedicineCategory[];
    total: number;
  }>(
    ["medicineCategories", filters],
    () => medicineCategoryService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    medicineCategories: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useMedicineCategoryStatistics() {
  const { data, isLoading, error } = useApiQuery<MedicineCategoryStatistics>(
    ["medicineCategories", "statistics"],
    () => medicineCategoryService.getStatistics(),
    { staleTime: 5 * 60 * 1000 },
  );

  return {
    statistics: data,
    isLoading,
    error,
  };
}

export function useCreateMedicineCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicineCategories");

  const { mutate, isPending } = useApiMutation<
    MedicineCategory,
    CreateMedicineCategoryDto
  >((dto) => medicineCategoryService.create(dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicineCategories"] });
      toast.success(t("addSuccess"));
    },
  });

  return {
    createMedicineCategoryMutate: mutate,
    createMedicineCategoryPending: isPending,
  };
}

export function useUpdateMedicineCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicineCategories");

  const { mutate, isPending } = useApiMutation<
    MedicineCategory,
    { id: number; data: UpdateMedicineCategoryDto }
  >(({ id, data }) => medicineCategoryService.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicineCategories"] });
      toast.success(t("updateSuccess"));
    },
  });

  return {
    updateMedicineCategoryMutate: mutate,
    updateMedicineCategoryPending: isPending,
  };
}

export function useDeleteMedicineCategory() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicineCategories");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => medicineCategoryService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicineCategories"] });
        toast.success(t("deleteSuccess"));
      },
    },
  );

  return {
    deleteMedicineCategoryMutate: mutate,
    deleteMedicineCategoryPending: isPending,
  };
}
