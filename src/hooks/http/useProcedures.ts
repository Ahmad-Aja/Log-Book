import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { procedureService } from "@/services/procedure-service";
import {
  Procedure,
  CreateProcedureDto,
  UpdateProcedureDto,
  ProcedureFilters,
  ProcedureStatistics,
} from "@/types/http/procedure.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";
import { PaginationMeta } from "@/types/http/auth.types";

export function useCreateProcedure() {
  const queryClient = useQueryClient();
  const t = useTranslations("procedures");

  const { mutate, isPending, error } = useApiMutation<
    Procedure,
    CreateProcedureDto
  >((data) => procedureService.createProcedure(data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      toast.success(t("addSuccess"));
    },
  });

  return {
    createProcedureMutate: mutate,
    createProcedurePending: isPending,
    createProcedureError: error,
  };
}

export function useProcedures(filters?: ProcedureFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    data: Procedure[];
    pagination: PaginationMeta;
  }>(["procedures", filters], () => procedureService.getProcedures(filters), {
    staleTime: 2 * 60 * 1000,
  });

  return {
    procedures: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

export function useProcedure(id: number) {
  const { data, isLoading, error } = useApiQuery<Procedure>(
    ["procedures", id],
    () => procedureService.getProcedureById(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    },
  );

  return {
    procedure: data,
    isLoading,
    error,
  };
}

export function useUpdateProcedure() {
  const queryClient = useQueryClient();
  const t = useTranslations("procedures");

  const { mutate, isPending, error } = useApiMutation<
    Procedure,
    { id: number; data: UpdateProcedureDto }
  >(({ id, data }) => procedureService.updateProcedure(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      toast.success(t("updateSuccess"));
    },
  });

  return {
    updateProcedureMutate: mutate,
    updateProcedurePending: isPending,
    updateProcedureError: error,
  };
}

export function useEnableProcedure() {
  const queryClient = useQueryClient();
  const t = useTranslations("procedures");

  const { mutate, isPending } = useApiMutation<Procedure, number>(
    (id) => procedureService.updateProcedure(id, { isActive: true }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
        toast.success(t("enableSuccess"));
      },
    },
  );

  return {
    enableProcedureMutate: mutate,
    enableProcedurePending: isPending,
  };
}

export function useDisableProcedure() {
  const queryClient = useQueryClient();
  const t = useTranslations("procedures");

  const { mutate, isPending } = useApiMutation<Procedure, number>(
    (id) => procedureService.updateProcedure(id, { isActive: false }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
        toast.success(t("disableSuccess"));
      },
    },
  );

  return {
    disableProcedureMutate: mutate,
    disableProcedurePending: isPending,
  };
}

export function useDeleteProcedure() {
  const queryClient = useQueryClient();
  const t = useTranslations("procedures");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => procedureService.deleteProcedure(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
        toast.success(t("deleteSuccess"));
      },
    },
  );

  return {
    deleteProcedureMutate: mutate,
    deleteProcedurePending: isPending,
  };
}

export function useProcedureStatistics() {
  const { data, isLoading, error } = useApiQuery<ProcedureStatistics>(
    ["procedures", "statistics"],
    () => procedureService.getStatistics(),
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  return {
    statistics: data,
    isLoading,
    error,
  };
}
