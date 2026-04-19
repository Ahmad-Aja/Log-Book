"use client";

import { useEffect, useState, useRef } from "react";
import { Printer, CheckCircle, Copy } from "lucide-react";
import { Modal } from "../../ui/Modal";
import { ModalHeader } from "../../ui/ModalHeader";
import { ModalFooter } from "../../ui/ModalFooter";
import { Button } from "../../ui/Button";
import { Student } from "@/types/http/student.types";
import { useStudentReport } from "@/hooks/http/useStudents";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export function StudentReportModal({
  isOpen,
  onClose,
  student,
}: StudentReportModalProps) {
  const t = useTranslations("students.reportModal");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [printLoader, setPrintLoader] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const {
    generateReport,
    reportContent,
    isLoading,
    error: fetchError,
  } = useStudentReport();

  useEffect(() => {
    if (!isOpen) {
      setHtmlContent(null);
      setCopied(false);
      // Clean up iframe when modal closes
      if (iframeRef.current && document.body.contains(iframeRef.current)) {
        document.body.removeChild(iframeRef.current);
        iframeRef.current = null;
      }
    } else if (student) {
      generateReport(student.id);
    }
  }, [isOpen]);

  useEffect(() => {
    if (reportContent) {
      setHtmlContent(reportContent);
    }
  }, [reportContent]);

  const handlePrint = () => {
    setPrintLoader(true);
    if (!htmlContent) return;

    if (iframeRef.current && document.body.contains(iframeRef.current)) {
      document.body.removeChild(iframeRef.current);
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    const iframeWindow = iframe.contentWindow;

    iframe.onload = async () => {
      try {
        if (iframeWindow?.document?.fonts) {
          await iframeWindow.document.fonts.ready;
        }
        await new Promise((r) => setTimeout(r, 200));
        iframeWindow.focus();
        iframeWindow.print();
      } catch (err) {
        toast.error(t("printFailed"));
      } finally {
        setPrintLoader(false);
      }
    };
  };

  const getFileName = () => {
    if (!student) return "student_report.pdf";
    const sanitizedName = student.fullName.replace(/\s+/g, "_");
    const sanitizedId = student.universityId.replace(/\s+/g, "_");
    return `${sanitizedName}_${sanitizedId}_report.pdf`;
  };

  const handleCopyFileName = async () => {
    const fileName = getFileName();
    try {
      await navigator.clipboard.writeText(fileName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const error = fetchError
    ? fetchError?.response?.data?.message || t("loadError")
    : null;

  const studentInfo = student
    ? `${student.fullName} - ${student.universityId}`
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      className="max-h-[90vh] flex flex-col"
    >
      <ModalHeader
        title={t("title")}
        description={studentInfo}
        onClose={handleClose}
        disabled={isLoading}
        sticky
      />

      <div className="flex-1 overflow-auto p-6">
        {isLoading && (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wheat mx-auto mb-4"></div>
              <p className="text-gray-600">{t("loading")}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="text-center">
              <p className="text-error mb-4">{error}</p>
              <Button
                onClick={() => student && generateReport(student.id)}
                variant="secondary"
                className="p-2"
              >
                {t("retry")}
              </Button>
            </div>
          </div>
        )}

        {htmlContent && !isLoading && !error && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("contentLoaded")}
              </h3>
              <p className="text-gray-600">{t("readyToPrint")}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2 font-medium">
                {t("suggestedFileName")}:
              </p>
              <div className="flex items-center gap-2 justify-center overflow-hidden">
                <code className="bg-white px-3 py-2 rounded border border-gray-300 text-sm text-ellipsis overflow-hidden">
                  {getFileName()}
                </code>
                <Button
                  onClick={handleCopyFileName}
                  variant="secondary"
                  className="p-2"
                  title={t("copyFileName")}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-start">
              <h4 className="font-semibold text-blue-900 mb-3">
                {t("printInstructions")}
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                <li>
                  • <strong>{t("destination")}:</strong> {t("saveAsPdf")}
                </li>
                <li>
                  • <strong>{t("margins")}:</strong> {t("default")}
                </li>
                <li>
                  • <strong>{t("pages")}:</strong> {t("all")}
                </li>
                <li>
                  • <strong>{t("scale")}:</strong> {t("default")}
                </li>
                <li>
                  • <strong>{t("layout")}:</strong> {t("portrait")}
                </li>
                <li>
                  • <strong>{t("options")}:</strong> {t("headersFootersOff")}
                </li>
                <li>
                  • <strong>{t("pageSize")}:</strong> {t("a4")}
                </li>
                <li>
                  • <strong>{t("options")}:</strong> {t("backgroundGraphicsOn")}
                </li>
                <li>
                  • <strong>{t("pagesPerSheet")}:</strong> {t("one")}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {htmlContent && !isLoading && !error && (
        <ModalFooter sticky>
          <Button
            onClick={handlePrint}
            variant="primary"
            className="flex items-center gap-2 p-2"
            disabled={printLoader}
          >
            {printLoader ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("printing")}
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                {t("print")}
              </>
            )}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}
