"use client";

import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export function ToastProvider({ direction }: { direction: "rtl" | "ltr" }) {
  return (
    <div className="custom-toast-wrapper">
      <ToastContainer
        position="top-center" // {direction === "rtl" ? "bottom-left" : "bottom-right"}
        rtl={direction === "rtl"}
        autoClose={4000}
        hideProgressBar
        stacked
      />

      <style jsx global>{`
        /* Container Adjustments */
        .Toastify__toast-container {
          padding: 12px;
        }

        /* Responsive override for mobile (replaces useMediaQuery) */
        @media (max-width: 480px) {
          .Toastify__toast-container {
            margin-top: 1rem;
            width: calc(100vw - 1.5rem) !important;
            left: 50% !important;
            transform: translateX(-50%);
          }
        }

        /* The Toast Card */
        .Toastify__toast {
          min-height: 46px;
          border-radius: 8px; /* Standard radius */
          padding: 12px 20px;
          background-color: #ffffff;
          color: #2f2b3d;
          box-shadow: "0px 3px 12px rgb(0,0,0,0.14)";
        }

        /* Body Text */
        .Toastify__toast-body {
          font-size: 0.9375rem; 
          lineHeight: 1.46667,
          margin: 0;
          padding: 0;
        }

        /* Icon Colors (Standard CSS targeting) */
        .Toastify__toast--success .Toastify__toast-icon svg {
          fill: #28c76f;
        }
        .Toastify__toast--error .Toastify__toast-icon svg {
          fill: #ff4c51;
        }
        .Toastify__toast--warning .Toastify__toast-icon svg {
          fill: #ff9f43;
        }
        .Toastify__toast--info .Toastify__toast-icon svg {
          fill: #00bad1;
        }

        .Toastify__toast-icon {
          margin-right: 12px;
          height: 20px;
          width: 20px;
        }

        .Toastify__toast-icon .Toastify__spinner {
          margin: 3px;
          height: 14px;
          width: 14px;
        }

        /* Close Button */
        .Toastify__close-button {
          color: #2f2b3d;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
