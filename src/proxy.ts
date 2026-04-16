import { NextResponse, NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/utils/locale";

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

// Public routes - no authentication required
const publicRoutes = ["/login"];

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, "") || "/";
  return publicRoutes.some((route) => pathWithoutLocale.startsWith(route));
}

// Extract locale from pathname
function extractLocale(pathname: string): string {
  const match = pathname.match(/^\/(ar|en)/);
  return match ? match[1] : defaultLocale;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = extractLocale(pathname);
  const accessToken = request.cookies.get("access_token")?.value;

  // Handle public routes (login)
  if (isPublicRoute(pathname)) {
    if (accessToken && !isTokenExpired(accessToken)) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url),
      );
    }
    return intlMiddleware(request);
  }

  // All other routes are protected
  if (!accessToken || isTokenExpired(accessToken)) {
    const response = NextResponse.redirect(
      new URL(`/${locale}/login`, request.url),
    );
    response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
