// /src/components/admin/system-configuration/area/AreaManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Folder, RefreshCw } from "lucide-react";
import { CloseIcon } from "@/icons";
import { useTranslation } from "@/hooks/useTranslation";
import type { Area } from "@/store/api/area";
import AreaHierarchyView from "@/components/admin/system-configuration/area/AreaHierarchyView";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

const AreaManagementComponent: React.FC<{ areas: Area[] }> = ({ areas }) => {
  const { language, t } = useTranslation();
  
  // ===================================================================
  // State management
  // ===================================================================

  const [area, setArea] = useState<Area[]>(areas || []);
  const [isLoading, ] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, ] = useState(false);
  const [viewMode, ] = useState<"hierarchy" | "list">("hierarchy");

  // ===================================================================
  // Filter and search logic
  // ===================================================================

  const filteredAreas = useMemo(() => {
    return areas.filter(area => {
      const matchesSearch = 
        area.countryTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.countryEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.provinceTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.provinceEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.districtTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.districtEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, areas]);

  // ===================================================================
  // Render
  // ===================================================================
  
  useEffect(() => {
    setArea(areas || []);
  }, [areas]);

  const renderAreaHierarchy = () => (
    <AreaHierarchyView
      areas={filteredAreas || area || []}
      showInactive={showInactive}
    />
  );

  const [localValue, setLocalValue] = useState<string>("");
  
  const handleResetQuery = () => {
    if (setLocalValue) {
      setLocalValue("");
    }
    if (setSearchQuery) {
      setSearchQuery("");
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        <div className={`mx-auto w-full`}>
          <div className={`mx-auto w-full`}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mt-4 sm:mt-0 xl:flex space-y-2 xl:space-y-0 items-center space-x-3">
                  {/* Toolbar */}
                  <div className="xl:flex space-y-2 xl:space-y-0 items-center space-x-4">
                    {/* Search */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          value={localValue}
                          onChange={e => setLocalValue && setLocalValue(e.target.value)}
                          placeholder={language === "th" && "ค้นหาพื้นที่..." || "Search area..."}
                        />
                        {localValue && (
                          <Button
                            onClick={handleResetQuery}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2"
                            variant="outline"
                          >
                            <CloseIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Button
                        onClick={() => setSearchQuery && setSearchQuery(localValue)}
                        variant="dark"
                        className="h-11"
                      >
                        {t("crud.common.search")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-300" />
              </div>
            )}
            {/* Content */}
            {!isLoading && area?.length > 0 && (
              <>
                {viewMode === "hierarchy" && renderAreaHierarchy()}
                {viewMode === "list" && (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500 cursor-default">
                    <p>List view implementation coming soon...</p>
                  </div>
                )}
              </>
            )}
            {/* Empty state */}
            {!isLoading && area?.length === 0 && (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2 cursor-default">
                  No area found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 cursor-default">
                  {searchQuery ? "Try adjusting your search criteria" : "Get started by creating your first area"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AreaManagementComponent;
