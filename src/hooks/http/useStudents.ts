import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { studentService } from "@/services/student-service";
import {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilters,
  StudentStatistics,
} from "@/types/http/student.types";
import { PaginationMeta } from "@/types/http/auth.types";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export function useUploadStudentImage() {
  const { mutate, isPending, error } = useApiMutation<string, File>((file) =>
    studentService.uploadImage(file),
  );

  return {
    uploadImageMutate: mutate,
    uploadImagePending: isPending,
    uploadImageError: error,
  };
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("students");

  const { mutate, isPending, error } = useApiMutation<
    Student,
    CreateStudentDto
  >((data) => studentService.createStudent(data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(t("addSuccess"));
    },
  });

  return {
    createStudentMutate: mutate,
    createStudentPending: isPending,
    createStudentError: error,
  };
}

export function useStudents(filters?: StudentFilters) {
  const { data, isLoading, error, refetch } = useApiQuery<{
    data: Student[];
    pagination: PaginationMeta;
  }>(["students", filters], () => studentService.getStudents(filters), {
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    students: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}

export function useStudent(id: number) {
  const { data, isLoading, error } = useApiQuery<Student>(
    ["students", id],
    () => studentService.getStudentById(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
    },
  );

  return {
    student: data,
    isLoading,
    error,
  };
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("students");

  const { mutate, isPending, error } = useApiMutation<
    Student,
    { id: number; data: UpdateStudentDto }
  >(({ id, data }) => studentService.updateStudent(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(t("updateSuccess"));
    },
  });

  return {
    updateStudentMutate: mutate,
    updateStudentPending: isPending,
    updateStudentError: error,
  };
}

export function useBlockStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("students");

  const { mutate, isPending } = useApiMutation<Student, number>(
    (id) => studentService.blockStudent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["students"] });
        toast.success(t("blockSuccess"));
      },
    },
  );

  return {
    blockStudentMutate: mutate,
    blockStudentPending: isPending,
  };
}

export function useUnblockStudent() {
  const queryClient = useQueryClient();
  const t = useTranslations("students");

  const { mutate, isPending } = useApiMutation<Student, number>(
    (id) => studentService.unblockStudent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["students"] });
        toast.success(t("unblockSuccess"));
      },
    },
  );

  return {
    unblockStudentMutate: mutate,
    unblockStudentPending: isPending,
  };
}

export function useStudentStatistics() {
  const { data, isLoading, error } = useApiQuery<StudentStatistics>(
    ["students", "statistics"],
    () => studentService.getStatistics(),
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
