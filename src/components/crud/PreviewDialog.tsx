// /src/components/crud/PreviewDialog.tsx
import
  // React,
  { useState, useEffect }
from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { 
  CloseIcon, 
  // AngleLeftIcon, 
  // AngleRightIcon, 
  CopyIcon,
  CheckCircleIcon,
  // InfoIcon,
  // SettingsIcon,
  // FileIcon
} from "@/icons";
import type { PreviewConfig, PreviewState } from "@/types/enhanced-crud";

interface PreviewDialogProps<T> {
  previewState: PreviewState<T>;
  config: PreviewConfig<T>;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
}

export const PreviewDialog = <T extends { id: string }>({
  previewState,
  config,
  onClose,
  onNext,
  onPrev,
  canGoNext = false,
  canGoPrev = false
}: PreviewDialogProps<T>) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(0); // Reset to first tab when item changes
  }, [previewState.item]);

  const handleCopy = async (value: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!previewState.isOpen) return;
    
    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowLeft":
        if (canGoPrev && onPrev) onPrev();
        break;
      case "ArrowRight":
        if (canGoNext && onNext) onNext();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewState.isOpen, canGoNext, canGoPrev]);

  if (!previewState.isOpen || !previewState.item) return null;

  const item = previewState.item;
  const currentTab = config.tabs[activeTab];

  const renderFieldValue = (field: { render?: (value: string, item: T) => React.ReactNode; type?: string; }, value: React.ReactNode) => {
    if (field.render) {
      return field.render(value as string, item as T);
    }

    switch (field.type) {
      case "badge":
        return (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-sm">
            {value}
          </span>
        );
      
      case "date":
        return new Date(value as string | number | Date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      
      case "number":
        return value?.toLocaleString();
      
      case "tags":
        return (
          <div className="flex flex-wrap gap-1">
            {(value as string[])?.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        );
      
      case "json":
        return (
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      
      default:
        return value?.toString() || "-";
    }
  };

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-7xl"
  };

  return (
    <Modal 
      isOpen={previewState.isOpen} 
      onClose={onClose} 
      className={`${sizeClasses[config.size || "lg"]} max-h-[95vh] overflow-x-auto`}
    >
      <div className="flex flex-col h-full cursor-default">
        {/* Header */}
        <div className="xl:flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="xl:flex items-center gap-4 min-w-0 flex-1">
            {config.avatar && (
              <div className="hidden xl:block flex-shrink-0">
                {config.avatar(item)}
              </div>
            )}
            <div className="min-w-0 xl:max-w-full flex-1">
              {config.title && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white xl:truncate">
                  {config.title(item)}
                </h2>
              )}
              {config.subtitle && (
                // <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                //   {config.subtitle(item)}
                // </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {config.subtitle(item)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Navigation */}
            {config.enableNavigation && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400 pr-2">
                  {previewState.currentIndex + 1} of {previewState.totalItems}
                </span>
                <Button
                  onClick={onPrev}
                  disabled={!canGoPrev}
                  variant="ghost"
                  size="sm"
                  title="Previous item (←)"
                >
                  {/* <AngleLeftIcon className="w-4 h-4" /> */}
                  {`<`}
                </Button>
                <Button
                  onClick={onNext}
                  disabled={!canGoNext}
                  variant="ghost"
                  size="sm"
                  title="Next item (→)"
                >
                  {/* <AngleRightIcon className="w-4 h-4" /> */}
                  {`>`}
                </Button>
              </>
            )}
            
            <div className="hidden xl:block">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                title="Close (Esc)"
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {config.tabs.length > 1 && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex px-6" aria-label="Tabs">
              {config.tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = index === activeTab;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {Icon && <Icon />}
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          {currentTab.render ? (
            currentTab.render(item)
          ) : (
            <div className="space-y-6 overflow-y-auto">
              {currentTab.fields?.map(field => {
                const value = (item as Record<string, string>)[field.key];
                
                return (
                  <div key={field.key} className={`${field.className || ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                      </label>
                      {field.copyable && value && (
                        <Button
                          onClick={() => handleCopy(String(value), field.key)}
                          variant="ghost"
                          size="xs"
                          title="Copy to clipboard"
                        >
                          {copiedField === field.key ? (
                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                          ) : (
                            <CopyIcon className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {renderFieldValue(field, value)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        {config.actions && config.actions.length > 0 && (
          <div className="xl:flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {config.actions
              .filter(action => !action.condition || action.condition(item))
              .map(action => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.key}
                    onClick={() => action.onClick(item, onClose)}
                    variant={`${action.variant}`}
                    className="w-full xl:w-auto mb-3 xl:mb-0"
                  >
                    {Icon && <Icon />}
                    {action.label}
                  </Button>
                );
              })}
          </div>
        )}
      </div>

      {/*
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 m-4 cursor-default">
        <div className="flex items-center gap-2 mb-2">
          <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-blue-900 dark:text-blue-100">Preview Feature</h3>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Click on any card or table row to open a detailed preview with tabs, navigation, and actions.
          Use keyboard shortcuts: ← → to navigate, Esc to close.
        </p>
      </div>
      */}
    </Modal>
  );
};
