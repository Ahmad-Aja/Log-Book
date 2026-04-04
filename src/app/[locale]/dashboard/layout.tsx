"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { DashboardHeader } from "@/components/ui/DashboardHeader";
import { PageTitleProvider } from "@/providers/PageTitleProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <PageTitleProvider>
      <div className="flex h-screen bg-lightBg">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col gap-5 overflow-hidden px-3 py-5 w-full lg:w-auto">
          <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-auto px-3">{children}</main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
