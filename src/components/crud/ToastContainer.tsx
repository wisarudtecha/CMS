// /src/components/crud/ToastContainer.tsx
import React from "react";
import { CheckCircleIcon, ErrorIcon, AlertIcon, CloseIcon } from "@/icons";
import type { Toast } from "@/types/crud";
import { useTranslation } from "@/hooks/useTranslation";
import { SpinnerIcon } from "@/icons/SpinnerIcon";
// import Button from "@/components/ui/button/Button";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  disbleCloseButton?: boolean;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  disbleCloseButton = false
}) => {
  const { t } = useTranslation();
  const getToastIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-300" />;
      case "error":
        return <ErrorIcon className="w-5 h-5 text-red-600 dark:text-red-300" />;
      case "warning":
        return <AlertIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />;
      case "info":
        return <AlertIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />;
      case "loading":
        return <SpinnerIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 animate-spin" />;
      default:
        return null;
    }
  };

  const getToastClasses = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-100";
      case "error":
        return "bg-red-100 dark:bg-red-800 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-100";
      case "info":
        return "bg-blue-100 dark:bg-blue-800 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100";
      case "loading":
        return "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100";
      default:
        return "";
    }
  };

  // const getButtonClasses = (type: Toast["type"]) => {
  //   return type;
  // };

  return (
    <div className="fixed top-25 right-4 z-99999 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 ${getToastClasses(toast.type)}`}
        >
          {getToastIcon(toast.type)}
          <span className="text-sm font-medium">{toast.isI18N ? t(toast.message) : toast.message}</span>
          {!disbleCloseButton && <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          // variant={getButtonClasses(toast.type)}
          // size="xs"
          >
            <CloseIcon className="w-4 h-4" />
          </button>}
        </div>
      ))}
    </div>
  );
};
