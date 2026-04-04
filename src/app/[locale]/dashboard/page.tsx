"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MixedText } from "@/components/ui/MixedText";
import { Users, UserCheck, FileText, ClipboardList, Stethoscope, Megaphone } from "lucide-react";
import { QuickAccessCard } from "@/components/ui/QuickAccessCard";
import { useMe } from "@/hooks/http/useAuth";
import { usePageTitle } from "@/providers/PageTitleProvider";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tLogin = useTranslations("login");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { admin } = useMe();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(t("pageTitle"));
  }, [setTitle, t]);

  const quickAccessItems = [
    {
      title: t("students.title"),
      description: t("students.description"),
      icon: Users,
      href: "/dashboard/students",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t("supervisors.title"),
      description: t("supervisors.description"),
      icon: UserCheck,
      href: "/dashboard/supervisors",
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: t("procedures.title"),
      description: t("procedures.description"),
      icon: FileText,
      href: "/dashboard/procedures",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: t("studentProcedures.title"),
      description: t("studentProcedures.description"),
      icon: ClipboardList,
      href: "/dashboard/student-procedures",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: t("medicalCases.title"),
      description: t("medicalCases.description"),
      icon: Stethoscope,
      href: "/dashboard/medical-cases",
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: t("announcements.title"),
      description: t("announcements.description"),
      icon: Megaphone,
      href: "/dashboard/announcements",
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-forest-deep via-forest to-forest-light">
        {/* Decorative circles */}
        <div className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -start-8 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-4 end-32 w-24 h-24 rounded-full bg-wheat/10" />

        <div className="relative z-10 px-8 py-8 md:py-10 flex flex-col gap-1">
          <span className="text-wheat/70 text-xs tracking-widest uppercase font-medium">
            <MixedText text={tLogin("ministry")} />
          </span>
          <span className="text-wheat/80 text-sm font-medium">
            <MixedText text={tLogin("hospital")} />
          </span>
          <h1 className="text-white text-xl md:text-2xl font-bold mt-1 leading-snug">
            <MixedText text={tLogin("department")} />
          </h1>
          <span className="text-white/50 text-base md:text-lg mt-2 tracking-wide">
            <MixedText text={isRTL ? "السجل الرقمي" : "Digital Log Book"} />
          </span>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("quickAccess")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccessItems.map((item) => (
            <QuickAccessCard key={item.href} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
