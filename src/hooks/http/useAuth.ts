import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import { authService } from "@/services/auth-service";
import { LoginRequest, LoginResponse, Admin } from "@/types/http/auth.types";
import { useLocale, useTranslations } from "next-intl";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useRouterWithLoader } from "../useRouterWithLoader";

export function useLogin() {
  const router = useRouterWithLoader();
  const locale = useLocale();

  const { mutate, isPending, error } = useApiMutation<
    LoginResponse,
    LoginRequest,
    AxiosError<{ message: string }>
  >((data) => authService.login(data), {
    onSuccess: () => {
      router.replace(`/${locale}/dashboard`);
    },
  });

  return {
    loginMutate: mutate,
    loginPending: isPending,
    loginError: error,
  };
}

export function useLogout() {
  const router = useRouterWithLoader();
  const locale = useLocale();

  const { mutate, isPending } = useApiMutation<void, void>(
    () => authService.logout(),
    {
      onSuccess: () => router.replace(`/${locale}/login`),
    },
  );

  return { logoutMutate: mutate, logoutPending: isPending };
}

export function useMe() {
  const { data, isLoading, error } = useApiQuery<Admin>(
    ["admin", "me"],
    () => authService.me(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  );

  return {
    admin: data,
    isLoading,
    error,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const t = useTranslations("profile");

  const { mutate, isPending } = useApiMutation<
    Admin,
    { fullName?: string; password?: string }
  >((data) => authService.updateProfile(data), {
    onSuccess: (updatedAdmin) => {
      // Update the cache with the new admin data
      queryClient.setQueryData(["admin", "me"], updatedAdmin);
      toast.success(t("updateSuccess"));
    },
  });

  return {
    updateProfileMutate: mutate,
    updateProfilePending: isPending,
  };
}
