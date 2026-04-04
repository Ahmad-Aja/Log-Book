import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { studentProcedureService } from "@/services/student-procedure-service";
import {
  StudentProcedure,
  StudentProcedureFilters,
  StudentProcedureStatistics,
  CreateStudentProcedureDto,
  UpdateStudentProcedureDto,
} from "@/types/http/student-procedure.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useStudentProcedures(filters: StudentProcedureFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    items: StudentProcedure[];
    total: number;
  }>(
    ["studentProcedures", filters],
    () => studentProcedureService.getAll(filters),
    { staleTime: 2 * 60 * 1000 },
  );

  return {
    studentProcedures: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  };
}

export function useStudentProcedureStatistics() {
  const { data, isLoading, error } = useApiQuery<StudentProcedureStatistics>(
    ["studentProcedures", "statistics"],
    () => studentProcedureService.getStatistics(),
    { staleTime: 5 * 60 * 1000 },
  );

  return { statistics: data, isLoading, error };
}

export function useCreateStudentProcedure() {
  const queryClient = useQueryClient();
  const t = useTranslations("studentProcedures");

  const { mutate, isPending, error } = useApiMutation<
    StudentProcedure,
    CreateStudentProcedureDto
  >((dto) => studentProcedureService.create(dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentProcedures"] });
      toast.success(t("addSuccess"));
    },
  });

  return {
    createStudentProcedureMutate: mutate,
    createStudentProcedurePending: isPending,
    createStudentProcedureError: error,
  };
}

export function useUpdateStudentProcedure() {
  const queryClient = useQueryClient();
  const t = useTranslations("studentProcedures");

  const { mutate, isPending, error } = useApiMutation<
    StudentProcedure,
    { id: number; dto: UpdateStudentProcedureDto }
  >(({ id, dto }) => studentProcedureService.update(id, dto), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentProcedures"] });
      toast.success(t("updateSuccess"));
    },
  });

  return {
    updateStudentProcedureMutate: mutate,
    updateStudentProcedurePending: isPending,
    updateStudentProcedureError: error,
  };
}

export function useDeleteStudentProcedure() {
  const queryClient = useQueryClient();
  const t = useTranslations("studentProcedures");

  const { mutate, isPending } = useApiMutation<void, number>(
    (id) => studentProcedureService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["studentProcedures"] });
        toast.success(t("deleteSuccess"));
      },
    },
  );

  return {
    deleteStudentProcedureMutate: mutate,
    deleteStudentProcedurePending: isPending,
  };
}
