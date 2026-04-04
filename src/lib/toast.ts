import { toast as hotToast } from "react-toastify";

export const toast = {
  success: (message: string) => {
    hotToast.success(message, {});
  },

  error: (message: string) => {
    hotToast.error(message);
  },

  info: (message: string) => {
    hotToast(message);
  },

  loading: (message: string) => {
    return hotToast.loading(message);
  },

  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },
};
