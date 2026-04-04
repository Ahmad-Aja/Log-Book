import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { medicalCaseService } from "@/services/medical-case-service";
import {
  MedicalCase,
  MedicalCaseFilters,
  CreateMedicalCaseDto,
  UpdateMedicalCaseDto,
  UpdateMedicalCaseStatusDto,
} from "@/types/http/medical-case.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useMedicalCases(filters: MedicalCaseFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    items: MedicalCase[];
    total: number;
  }>(
    ["medicalCases", filters],
    () => medicalCaseService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    medicalCases: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useCreateMedicalCase() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicalCases");

  const { mutate, isPending, error } = useApiMutation<
    MedicalCase,
    CreateMedicalCaseDto
  >((dto) => medicalCaseService.create(dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalCases"] });
      toast.success(t("addSuccess"));
    },
  });

  return {
    createMedicalCaseMutate: mutate,
    createMedicalCasePending: isPending,
    createMedicalCaseError: error,
  };
}

export function useUpdateMedicalCase() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicalCases");

  const { mutate, isPending, error } = useApiMutation<
    MedicalCase,
    { id: number; dto: UpdateMedicalCaseDto }
  >(({ id, dto }) => medicalCaseService.update(id, dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicalCases"] });
      toast.success(t("updateSuccess"));
    },
  });

  return {
    updateMedicalCaseMutate: mutate,
    updateMedicalCasePending: isPending,
    updateMedicalCaseError: error,
  };
}

export function useUpdateMedicalCaseStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicalCases");

  const { mutate, isPending } = useApiMutation<
    MedicalCase,
    { id: number; dto: UpdateMedicalCaseStatusDto }
  >(({ id, dto }) => medicalCaseService.updateStatus(id, dto), {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medicalCases"] });
      const key =
        variables.dto.status === "APPROVED" ? "approveSuccess" : "rejectSuccess";
      toast.success(t(key));
    },
  });

  return {
    updateMedicalCaseStatusMutate: mutate,
    updateMedicalCaseStatusPending: isPending,
  };
}

export function useDeleteMedicalCase() {
  const queryClient = useQueryClient();
  const t = useTranslations("medicalCases");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => medicalCaseService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicalCases"] });
        toast.success(t("deleteSuccess"));
      },
    },
  );

  return {
    deleteMedicalCaseMutate: mutate,
    deleteMedicalCasePending: isPending,
  };
}
