import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { handleApiError } from "@/lib/api/error-handler";

export interface ApiError {
  message: string;
  statusCode?: number;
}

export function useApiQuery<TData, TError = ApiError>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, TError>({ queryKey, queryFn, ...options });
}

export function useApiMutation<
  TData,
  TVariables,
  TError = AxiosError,
  TContext = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>,
) {
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onError: (error, variables, onMutateResult, context) => {
      // Automatically show error toast
      handleApiError(error);
      // Call user's onError if provided
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}
