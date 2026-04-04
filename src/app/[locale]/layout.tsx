import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/utils/locale";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "../globals.css";
import AppNProgress from "@/components/ui/NProgress";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Book",
  description:
    "Digital logbook for students at Al-Mouasat Hospital to document clinical rotations, procedures performed, and educational milestones.",
};

export const dynamic = "force-static";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale: locale }));
}

const itfQomraArabic = localFont({
  src: [
    {
      path: "../../assets/fonts/itfQomraArabic-Regular.woff2",
      weight: "500",
    },
    {
      path: "../../assets/fonts/itfQomraArabic-Medium.woff2",
      weight: "600",
    },
    {
      path: "../../assets/fonts/itfQomraArabic-Bold.woff2",
      weight: "700",
    },
    {
      path: "../../assets/fonts/itfQomraArabic-Bold.woff2",
      weight: "800",
    },
    {
      path: "../../assets/fonts/itfQomraArabic-Black.woff2",
      weight: "900",
    },
  ],
  style: "normal",
  variable: "--font-itfQomraArabic",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const arabicFont = itfQomraArabic;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${itfQomraArabic.variable} ${poppins.variable}`}
    >
      <body>
        <QueryProvider>
          <NextIntlClientProvider messages={messages}>
            <AppNProgress />
            <ToastProvider direction={dir} />
            {children}
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
