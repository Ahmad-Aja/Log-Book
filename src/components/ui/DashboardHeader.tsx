"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useLogout, useMe, useUpdateProfile } from "@/hooks/http/useAuth";
import { Avatar, AvatarFallback } from "./Avatar";
import { ConfirmDialog } from "./ConfirmDialog";
import { ProfileModal } from "../modals/ProfileModal";
import { Globe, User, LogOut, Menu } from "lucide-react";
import { ProfileUpdateFormData } from "@/lib/validations/auth.schema";
import { usePageTitle } from "@/providers/PageTitleProvider";
import { useRouterWithLoader } from "@/hooks/useRouterWithLoader";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const t = useTranslations("header");
  const tSidebar = useTranslations("sidebar");
  const locale = useLocale();
  const router = useRouterWithLoader();
  const pathname = usePathname();
  const { admin } = useMe();
  const { logoutMutate, logoutPending } = useLogout();
  const { updateProfileMutate, updateProfilePending } = useUpdateProfile();
  const { title } = usePageTitle();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isProfileOpen]);

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logoutMutate();
    setIsLogoutDialogOpen(false);
  };

  const handleProfileUpdate = (data: ProfileUpdateFormData) => {
    updateProfileMutate(data, {
      onSuccess: () => {
        setIsProfileModalOpen(false);
      },
    });
  };

  const handleLocaleChange = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const getInitials = (fullName?: string, username?: string) => {
    const name = fullName || username;
    if (!name) return "U";

    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border border-gray-200 rounded-2xl  px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
      {/* Left side - Menu button (mobile) and Page Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu Button - Only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>

        {/* Page Title - Hidden on mobile */}
        <h1 className="hidden lg:block text-xl font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Locale Switcher */}
        <button
          onClick={handleLocaleChange}
          className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center focus:outline-none "
          aria-label={t("language")}
        >
          <Globe className="h-5 w-5 text-gray-700" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <Avatar className="h-10 w-10 cursor-pointer  transition-all">
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(admin?.fullName, admin?.username)}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              <div className="py-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full px-4 py-2 text-sm text-left rtl:text-right hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {t("profile")}
                </button>

                <hr className="my-1 border-gray-200" />

                <button
                  onClick={handleLogoutClick}
                  className="w-full px-4 py-2 text-sm text-left rtl:text-right hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        admin={admin || null}
        onUpdate={handleProfileUpdate}
        isUpdating={updateProfilePending}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
        title={tSidebar("logoutTitle")}
        message={tSidebar("logoutMessage")}
        confirmText={tSidebar("confirm")}
        cancelText={tSidebar("cancel")}
        variant="danger"
        isLoading={logoutPending}
      />
    </header>
  );
}
