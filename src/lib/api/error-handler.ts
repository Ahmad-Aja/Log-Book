import { AxiosError } from "axios";
import { toast } from "@/lib/toast";

/**
 * Backend error response structure
 */
interface BackendErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
}

/**
 * Extract error message from backend error response
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorResponse | undefined;

    if (data?.message) {
      // Handle array of messages
      if (Array.isArray(data.message)) {
        return data.message.join(", ");
      }
      // Single message
      return data.message;
    }

    // Fallback to error property
    if (data?.error) {
      return data.error;
    }

    // Fallback to axios error message
    return error.message || "An unexpected error occurred";
  }

  // Unknown error type
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

/**
 * Handle API error and show toast notification
 */
export function handleApiError(error: unknown): void {
  const message = extractErrorMessage(error);
  toast.error(message);
}

/**
 * Handle API success and show toast notification
 */
export function handleApiSuccess(message: string): void {
  toast.success(message);
}

/**
 * Handle API info and show toast notification
 */
export function handleApiInfo(message: string): void {
  toast.info(message);
}
