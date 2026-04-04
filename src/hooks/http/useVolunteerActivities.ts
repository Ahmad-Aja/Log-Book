import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { volunteerActivityService } from "@/services/volunteer-activity-service";
import {
  VolunteerActivity,
  VolunteerActivityFilters,
  VolunteerActivityStatistics,
  UpdateVolunteerActivityStatusDto,
} from "@/types/http/volunteer-activity.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useVolunteerActivities(filters: VolunteerActivityFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    items: VolunteerActivity[];
    total: number;
  }>(
    ["volunteerActivities", filters],
    () => volunteerActivityService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    volunteerActivities: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useVolunteerActivityStatistics() {
  const { data, isLoading, error } =
    useApiQuery<VolunteerActivityStatistics>(
      ["volunteerActivities", "statistics"],
      () => volunteerActivityService.getStatistics(),
      { staleTime: 5 * 60 * 1000 },
    );

  return { statistics: data, isLoading, error };
}

export function useUpdateVolunteerActivityStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("volunteerActivities");

  const { mutate, isPending } = useApiMutation<
    VolunteerActivity,
    { id: number; dto: UpdateVolunteerActivityStatusDto }
  >(({ id, dto }) => volunteerActivityService.updateStatus(id, dto), {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["volunteerActivities"] });
      let key: string;
      if (variables.dto.status === "approved") {
        key = "approveSuccess";
      } else if (variables.dto.status === "rejected") {
        key = "rejectSuccess";
      } else {
        key = "updateSuccess";
      }
      toast.success(t(key));
    },
  });

  return {
    updateVolunteerActivityStatusMutate: mutate,
    updateVolunteerActivityStatusPending: isPending,
  };
}

export function useDeleteVolunteerActivity() {
  const queryClient = useQueryClient();
  const t = useTranslations("volunteerActivities");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => volunteerActivityService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["volunteerActivities"] });
        toast.success(t("deleteSuccess"));
      },
    },
  );

  return {
    deleteVolunteerActivityMutate: mutate,
    deleteVolunteerActivityPending: isPending,
  };
}
