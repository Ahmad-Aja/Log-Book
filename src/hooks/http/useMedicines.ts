import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { medicineService } from "@/services/medicine-service";
import {
  Medicine,
  CreateMedicineDto,
  UpdateMedicineDto,
  MedicineFilters,
  MedicineStatistics,
} from "@/types/http/medicine.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useMedicines(filters: MedicineFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    items: Medicine[];
    total: number;
  }>(
    ["medicines", filters],
    () => medicineService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    medicines: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useMedicineStatistics() {
  const { data, isLoading, error } = useApiQuery<MedicineStatistics>(
    ["medicines", "statistics"],
    () => medicineService.getStatistics(),
    { staleTime: 5 * 60 * 1000 },
  );

  return { statistics: data, isLoading, error };
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicines");

  const { mutate, isPending } = useApiMutation<Medicine, CreateMedicineDto>(
    (dto) => medicineService.create(dto),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicines"] });
        toast.success(t("addSuccess"));
      },
    },
  );

  return { createMedicineMutate: mutate, createMedicinePending: isPending };
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicines");

  const { mutate, isPending } = useApiMutation<
    Medicine,
    { id: number; data: UpdateMedicineDto }
  >(({ id, data }) => medicineService.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success(t("updateSuccess"));
    },
  });

  return { updateMedicineMutate: mutate, updateMedicinePending: isPending };
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicines");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => medicineService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicines"] });
        toast.success(t("deleteSuccess"));
      },
    },
  );

  return { deleteMedicineMutate: mutate, deleteMedicinePending: isPending };
}
