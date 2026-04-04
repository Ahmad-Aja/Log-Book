import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { protocolService } from "@/services/protocol-service";
import {
  Protocol,
  ProtocolStatistics,
  ProtocolFilters,
  CreateProtocolDto,
  UpdateProtocolDto,
  CreateProtocolStepDto,
  UpdateProtocolStepDto,
  CreateProtocolMedicineDto,
  ProtocolStep,
  ProtocolMedicineItem,
} from "@/types/http/protocol.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useProtocols(filters: ProtocolFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    items: Protocol[];
    total: number;
  }>(
    ["protocols", filters],
    () => protocolService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    protocols: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useProtocolStatistics() {
  const { data, isLoading, error } = useApiQuery<ProtocolStatistics>(
    ["protocols", "statistics"],
    () => protocolService.getStatistics(),
    { staleTime: 5 * 60 * 1000 },
  );

  return { statistics: data, isLoading, error };
}

export function useProtocol(id: number | null) {
  const { data, isLoading, error, refetch } = useApiQuery<Protocol>(
    ["protocols", id],
    () => protocolService.getById(id!),
    { staleTime: 1 * 60 * 1000, enabled: id !== null },
  );

  return { protocol: data ?? null, isLoading, error, refetch };
}

export function useCreateProtocol() {
  const queryClient = useQueryClient();
  const t = useTranslations("protocols");

  const { mutate, isPending } = useApiMutation<Protocol, CreateProtocolDto>(
    (dto) => protocolService.create(dto),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["protocols"] });
        toast.success(t("addSuccess"));
      },
    },
  );

  return { createProtocolMutate: mutate, createProtocolPending: isPending };
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient();
  const t = useTranslations("protocols");

  const { mutate, isPending } = useApiMutation<
    Protocol,
    { id: number; dto: UpdateProtocolDto }
  >(({ id, dto }) => protocolService.update(id, dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] });
      toast.success(t("updateSuccess"));
    },
  });

  return { updateProtocolMutate: mutate, updateProtocolPending: isPending };
}

export function useDeleteProtocol() {
  const queryClient = useQueryClient();
  const t = useTranslations("protocols");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => protocolService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["protocols"] });
        toast.success(t("deleteSuccess"));
      },
    },
  );

  return { deleteProtocolMutate: mutate, deleteProtocolPending: isPending };
}

export function useCreateProtocolStep() {
  const queryClient = useQueryClient();
  const t = useTranslations("protocols");

  const { mutate, isPending } = useApiMutation<ProtocolStep, CreateProtocolStepDto>(
    (dto) => protocolService.createStep(dto),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["protocols"] });
        toast.success(t("stepAddSuccess"));
      },
    },
  );

  return {
    createProtocolStepMutate: mutate,
    createProtocolStepPending: isPending,
  };
}

export function useUpdateProtocolStep() {
  const queryClient = useQueryClient();
  const t = useTranslations("protocols");

  const { mutate, isPending } = useApiMutation<
    ProtocolStep,
    { id: number; dto: UpdateProtocolStepDto }
  >(({ id, dto }) => protocolService.updateStep(id, dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] });
      toast.success(t("stepUpdateSuccess"));
    },
  });

  return {
    updateProtocolStepMutate: mutate,
    updateProtocolStepPending: isPending,
  };
}

export function useDeleteProtocolStep() {
  const queryClient = useQueryClient();
  const t = useTranslations("protocols");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => protocolService.deleteStep(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["protocols"] });
        toast.success(t("stepDeleteSuccess"));
      },
    },
  );

  return {
    deleteProtocolStepMutate: mutate,
    deleteProtocolStepPending: isPending,
  };
}

export function useCreateProtocolMedicine() {
  const queryClient = useQueryClient();
  const t = useTranslations("protocols");

  const { mutate, isPending } = useApiMutation<
    ProtocolMedicineItem,
    CreateProtocolMedicineDto
  >((dto) => protocolService.createProtocolMedicine(dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] });
      toast.success(t("medicineAddSuccess"));
    },
  });

  return {
    createProtocolMedicineMutate: mutate,
    createProtocolMedicinePending: isPending,
  };
}

export function useDeleteProtocolMedicine() {
  const queryClient = useQueryClient();
  const t = useTranslations("protocols");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => protocolService.deleteProtocolMedicine(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["protocols"] });
        toast.success(t("medicineDeleteSuccess"));
      },
    },
  );

  return {
    deleteProtocolMedicineMutate: mutate,
    deleteProtocolMedicinePending: isPending,
  };
}
