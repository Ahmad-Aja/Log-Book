import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { supervisorService } from "@/services/supervisor-service";
import {
  Supervisor,
  CreateSupervisorDto,
  UpdateSupervisorDto,
  SupervisorFilters,
  SupervisorStatistics,
} from "@/types/http/supervisor.types";
import { PaginationMeta } from "@/types/http/auth.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useUploadSupervisorImage() {
  const { mutate, isPending, error } = useApiMutation<string, File>((file) =>
    supervisorService.uploadImage(file),
  );

  return {
    uploadImageMutate: mutate,
    uploadImagePending: isPending,
    uploadImageError: error,
  };
}

export function useCreateSupervisor() {
  const queryClient = useQueryClient();
  const t = useTranslations("supervisors");

  const { mutate, isPending, error } = useApiMutation<
    Supervisor,
    CreateSupervisorDto
  >((data) => supervisorService.createSupervisor(data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      toast.success(t("addSuccess"));
    },
  });

  return {
    createSupervisorMutate: mutate,
    createSupervisorPending: isPending,
    createSupervisorError: error,
  };
}

export function useSupervisors(filters?: SupervisorFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    data: Supervisor[];
    pagination: PaginationMeta;
  }>(
    ["supervisors", filters],
    () => supervisorService.getSupervisors(filters),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  );

  return {
    supervisors: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

export function useSupervisor(id: number) {
  const { data, isLoading, error } = useApiQuery<Supervisor>(
    ["supervisors", id],
    () => supervisorService.getSupervisorById(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    },
  );

  return {
    supervisor: data,
    isLoading,
    error,
  };
}

export function useUpdateSupervisor() {
  const queryClient = useQueryClient();
  const t = useTranslations("supervisors");

  const { mutate, isPending, error } = useApiMutation<
    Supervisor,
    { id: number; data: UpdateSupervisorDto }
  >(({ id, data }) => supervisorService.updateSupervisor(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      toast.success(t("updateSuccess"));
    },
  });

  return {
    updateSupervisorMutate: mutate,
    updateSupervisorPending: isPending,
    updateSupervisorError: error,
  };
}

export function useBlockSupervisor() {
  const queryClient = useQueryClient();
  const t = useTranslations("supervisors");

  const { mutate, isPending } = useApiMutation<Supervisor, number>(
    (id) => supervisorService.blockSupervisor(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["supervisors"] });
        toast.success(t("blockSuccess"));
      },
    },
  );

  return {
    blockSupervisorMutate: mutate,
    blockSupervisorPending: isPending,
  };
}

export function useUnblockSupervisor() {
  const queryClient = useQueryClient();
  const t = useTranslations("supervisors");

  const { mutate, isPending } = useApiMutation<Supervisor, number>(
    (id) => supervisorService.unblockSupervisor(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["supervisors"] });
        toast.success(t("unblockSuccess"));
      },
    },
  );

  return {
    unblockSupervisorMutate: mutate,
    unblockSupervisorPending: isPending,
  };
}

export function useSupervisorStatistics() {
  const { data, isLoading, error } = useApiQuery<SupervisorStatistics>(
    ["supervisors", "statistics"],
    () => supervisorService.getStatistics(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  return {
    statistics: data,
    isLoading,
    error,
  };
}
