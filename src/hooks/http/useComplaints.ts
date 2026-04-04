import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { complaintService } from "@/services/complaint-service";
import {
  AddComplaintMessageDto,
  Complaint,
  ComplaintFilters,
  ComplaintMessage,
  ComplaintStatistics,
  ComplaintSummary,
  UpdateComplaintStatusDto,
} from "@/types/http/complaint.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useComplaints(filters: ComplaintFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    items: ComplaintSummary[];
    total: number;
  }>(
    ["complaints", filters],
    () => complaintService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    complaints: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useComplaintStatistics() {
  const { data, isLoading, error } = useApiQuery<ComplaintStatistics>(
    ["complaints", "statistics"],
    () => complaintService.getStatistics(),
    { staleTime: 5 * 60 * 1000 },
  );

  return { statistics: data, isLoading, error };
}

export function useComplaint(id: number | null) {
  const { data, isLoading, error, refetch } = useApiQuery<Complaint>(
    ["complaints", id],
    () => complaintService.getById(id!),
    {
      staleTime: 1 * 60 * 1000,
      enabled: id !== null,
    },
  );

  return {
    complaint: data ?? null,
    isLoading,
    error,
    refetch,
  };
}

export function useAddComplaintMessage() {
  const queryClient = useQueryClient();
  const t = useTranslations("complaints");

  const { mutate, isPending } = useApiMutation<
    ComplaintMessage,
    { id: number; dto: AddComplaintMessageDto }
  >(({ id, dto }) => complaintService.addMessage(id, dto), {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["complaints", variables.id] });
      toast.success(t("replySuccess"));
    },
  });

  return {
    addComplaintMessageMutate: mutate,
    addComplaintMessagePending: isPending,
  };
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations("complaints");

  const { mutate, isPending } = useApiMutation<
    ComplaintSummary,
    { id: number; dto: UpdateComplaintStatusDto }
  >(({ id, dto }) => complaintService.updateStatus(id, dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(t("statusUpdateSuccess"));
    },
  });

  return {
    updateComplaintStatusMutate: mutate,
    updateComplaintStatusPending: isPending,
  };
}
