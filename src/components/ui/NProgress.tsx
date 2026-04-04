"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import { locales } from "@/utils/locale";

const createNProgressStyles = () => {
  return `
    /* NProgress */
    #nprogress {
      pointer-events: none;
    }

    #nprogress .bar {
      background: #b9a779 !important;
      position: fixed;
      z-index: 10;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
    }

    /* Fancy blur effect */
    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px #b9a779, 0 0 5px #b9a779;
      opacity: 1.0;
      transform: rotate(3deg) translate(0px, -4px);
    }

    /* Remove the default spinner */
    #nprogress .spinner {
      display: none;
    }

    /* Remove spinner on mobile */
    #nprogress .spinner-icon {
      display: none;
    }
  `;
};

const AppNProgress = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      speed: 500,
      minimum: 0.3,
      easing: "ease-out",
      trickleSpeed: 800,
    });

    const styleId = "nprogress-custom-styles";
    const existingStyle = document.getElementById(styleId);

    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = createNProgressStyles();
    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => NProgress.start();

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href && !link.href.startsWith("#") && !link.target) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
          handleStart();

          // Get current lang prefix from pathname (e.g., "/en")
          const currentLangPrefix = pathname.split("/")[1];

          const targetPathLangPrefix = url.pathname.split("/")[1];
          let targetPath = url.pathname;
          const targetPathHasLang = locales.some(
            (lang) => targetPathLangPrefix === lang,
          );

          if (!targetPathHasLang) {
            targetPath = `/${currentLangPrefix}${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;
          }

          if (targetPath === pathname) {
            setTimeout(() => {
              NProgress.done();
            }, 0);
          }
        }
      }
    };

    document.addEventListener("click", handleLinkClick);

    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, [pathname]);

  return null;
};

export default AppNProgress;
