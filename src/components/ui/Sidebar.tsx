"use client";

import { useState } from "react";
import {
  Home,
  Users,
  UserCheck,
  FileText,
  ClipboardCheck,
  Activity,
  Megaphone,
  HandHeart,
  Zap,
  Pin,
  PinOff,
  X,
  MessageSquare,
  Package2,
  FlaskConical,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

interface NavItem {
  icon: LucideIcon;
  labelKey: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, labelKey: "dashboard", href: "/dashboard" },
  { icon: Users, labelKey: "students", href: "/dashboard/students" },
  { icon: UserCheck, labelKey: "supervisors", href: "/dashboard/supervisors" },
  { icon: FileText, labelKey: "procedures", href: "/dashboard/procedures" },
  { icon: ClipboardCheck, labelKey: "studentProcedures", href: "/dashboard/student-procedures" },
  {
    icon: Activity,
    labelKey: "medicalCases",
    href: "/dashboard/medical-cases",
  },
  {
    icon: Megaphone,
    labelKey: "announcements",
    href: "/dashboard/announcements",
  },
  {
    icon: HandHeart,
    labelKey: "volunteerActivities",
    href: "/dashboard/volunteer-activities",
  },
  {
    icon: MessageSquare,
    labelKey: "complaints",
    href: "/dashboard/complaints",
  },
  {
    icon: Package2,
    labelKey: "medicineCategories",
    href: "/dashboard/medicine-categories",
  },
  {
    icon: FlaskConical,
    labelKey: "medicines",
    href: "/dashboard/medicines",
  },
  {
    icon: BookOpen,
    labelKey: "protocols",
    href: "/dashboard/protocols",
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [pinned, setPinned] = useState(true);
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("sidebar");

  const isDesktopExpanded = pinned || hovered;

  const getLocalizedHref = (href: string) => `/${locale}${href}`;

  const isActive = (href: string) => {
    const localizedHref = getLocalizedHref(href);
    return pathname === localizedHref;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => !pinned && setHovered(true)}
        onMouseLeave={() => !pinned && setHovered(false)}
        className={`hidden lg:flex h-screen bg-forest-deep text-wheat-light flex-col transition-all duration-300 overflow-hidden
          ${isDesktopExpanded ? "w-64" : "w-16"}
        `}
      >
        <div
          className={`p-4 flex items-center ${isDesktopExpanded ? "justify-between" : "justify-center"}`}
        >
          <div className="flex items-center gap-3 mt-5">
            <div className="w-8 h-8 rounded-lg bg-wheat flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-forest-deep" />
            </div>
            {isDesktopExpanded && (
              <>
                <span className="font-bold text-lg whitespace-nowrap transition-opacity duration-300">
                  {t("appName")}
                </span>
                <button
                  onClick={() => setPinned(!pinned)}
                  className={`p-1.5 rounded-md transition-all duration-300 ltr:ml-auto rtl:mr-auto ${
                    pinned
                      ? "bg-wheat/20 text-wheat-light"
                      : "hover:bg-wheat/10 text-wheat-light/60"
                  }`}
                  title={pinned ? t("unpinSidebar") : t("pinSidebar")}
                >
                  {pinned ? (
                    <Pin className="w-4 h-4" />
                  ) : (
                    <PinOff className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const label = t(item.labelKey);
              return (
                <li
                  key={item.labelKey}
                  className={`${isDesktopExpanded ? "" : "flex justify-center"}`}
                >
                  <Link
                    href={getLocalizedHref(item.href)}
                    className={`flex items-center gap-3 py-2.5 text-sm rounded-xl transition-all ${
                      active
                        ? "bg-wheat text-forest-deep font-medium shadow-sm"
                        : "text-wheat-light/70 hover:bg-wheat/10 hover:text-wheat-light"
                    }
                    ${isDesktopExpanded ? "px-3 w-full" : "justify-center w-10 px-0"}
                    `}
                    title={!isDesktopExpanded ? label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span
                      className={`whitespace-nowrap transition-opacity duration-300 ${
                        isDesktopExpanded ? "opacity-100" : "opacity-0 hidden"
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar - Overlay */}
      <aside
        className={`lg:hidden fixed top-0 ${locale === "ar" ? "right-0" : "left-0"} h-screen bg-forest-deep text-wheat-light flex flex-col transition-transform duration-300 z-50 w-64 ${
          mobileOpen
            ? "translate-x-0"
            : locale === "ar"
              ? "translate-x-full"
              : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-wheat flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-forest-deep" />
            </div>
            <span className="font-bold text-lg whitespace-nowrap">
              {t("appName")}
            </span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md hover:bg-wheat/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const label = t(item.labelKey);
              return (
                <li key={item.labelKey}>
                  <Link
                    href={getLocalizedHref(item.href)}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all w-full ${
                      active
                        ? "bg-wheat text-forest-deep font-medium shadow-sm"
                        : "text-wheat-light/70 hover:bg-wheat/10 hover:text-wheat-light"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
