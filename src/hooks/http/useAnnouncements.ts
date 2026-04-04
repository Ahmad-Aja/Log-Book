import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { announcementService } from "@/services/announcement-service";
import {
  Announcement,
  AnnouncementFilters,
  AnnouncementStatistics,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "@/types/http/announcement.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useAnnouncements(filters: AnnouncementFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    items: Announcement[];
    total: number;
  }>(
    ["announcements", filters],
    () => announcementService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    announcements: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useAnnouncementStatistics() {
  const { data, isLoading, error } = useApiQuery<AnnouncementStatistics>(
    ["announcements", "statistics"],
    () => announcementService.getStatistics(),
    { staleTime: 5 * 60 * 1000 },
  );

  return { statistics: data, isLoading, error };
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const t = useTranslations("announcements");

  const { mutate, isPending, error } = useApiMutation<
    Announcement,
    CreateAnnouncementDto
  >((dto) => announcementService.create(dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success(t("addSuccess"));
    },
  });

  return {
    createAnnouncementMutate: mutate,
    createAnnouncementPending: isPending,
    createAnnouncementError: error,
  };
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  const t = useTranslations("announcements");

  const { mutate, isPending, error } = useApiMutation<
    Announcement,
    { id: number; dto: UpdateAnnouncementDto }
  >(({ id, dto }) => announcementService.update(id, dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success(t("updateSuccess"));
    },
  });

  return {
    updateAnnouncementMutate: mutate,
    updateAnnouncementPending: isPending,
    updateAnnouncementError: error,
  };
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  const t = useTranslations("announcements");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => announcementService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["announcements"] });
        toast.success(t("deleteSuccess"));
      },
    },
  );

  return {
    deleteAnnouncementMutate: mutate,
    deleteAnnouncementPending: isPending,
  };
}
