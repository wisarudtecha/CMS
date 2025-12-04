// /src/components/admin/system-configuration/area/AreaHierarchyView.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileIcon } from "@/icons";
import type { Area } from "@/store/api/area";
import type { HierarchyItem, HierarchyConfig } from "@/types/hierarchy";
import HierarchyView from "@/components/admin/HierarchyView";

interface OrganizationHierarchyViewProps {
  areas: Area[];
  showInactive: boolean;
}

const OrganizationHierarchyView: React.FC<OrganizationHierarchyViewProps> = ({ areas, showInactive }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Convert country, provinces and districts to generic hierarchy items
  const convertToHierarchyItems = useCallback((): HierarchyItem[] => {
    const items: HierarchyItem[] = [];
    const addedCountries = new Set();
    const addedProvinces = new Set();
    
    (areas || []).forEach(area => {
      // Add parent items (countries)
      if (!addedCountries.has(area.countryId)) {
        items.push({
          id: area.countryId,
          parentId: null, // Explicitly set to null for root items
          name: area.countryTh,
          secondaryName: area.countryEn,
          active: area.countryActive,
          level: 0
        });
        addedCountries.add(area.countryId);
      }

      // Add child items for country (provinces)
      if (!addedProvinces.has(area.provId)) {
        items.push({
          id: area.provId,
          parentId: area.countryId,
          name: area.provinceTh,
          secondaryName: area.provinceEn,
          active: area.provinceActive,
          level: 1,
          metadata: {
            countryId: area.countryId
          }
        });
        addedProvinces.add(area.provId);
      }

      // Add child items for province (districts)
      items.push({
        id: area.distId,
        parentId: area.provId,
        name: area.districtTh,
        secondaryName: area.districtEn,
        active: area.districtActive,
        level: 2,
        metadata: {
          countryId: area.countryId,
          provId: area.provId
        }
      });
    });
    
    return items;
  }, [areas]);

  const [hierarchyItems, setHierarchyItems] = useState<HierarchyItem[]>(
    convertToHierarchyItems()
  );

  // Update hierarchy items when props change
  useEffect(() => {
    setHierarchyItems(convertToHierarchyItems());
  }, [areas, convertToHierarchyItems]);

  // Configuration for the hierarchy view
  const hierarchyConfig: HierarchyConfig = useMemo(() => ({
    maxLevels: 3,
    showInactiveLabel: true,
    displayFields: {
      primaryLabel: "name",
      secondaryLabel: "secondaryName",
      metadataFields: []
    },
    levels: [
      // Level 0
      {
        canHaveChildren: true,
        emptyChildrenMessage: "No provinces defined for this country",
        childCountLabel: {
          plural: "provinces",
          singular: "province"
        },
        metadataDisplay: {
          showChildCount: true,
          showMetadata: false, // We"ll use custom formatter
          customMetadataFormatter: (_, childCount) => {
            const metadata: string[] = [];
            // Show child count with custom label
            if (childCount > 0) {
              metadata.push(`${childCount} ${childCount === 1 ? "province" : "provinces"}`);
            }
            return metadata;
          }
        },
        styling: {
          indentSize: 32,
        },
        actions: []
      },
      // Level 1
      {
        canHaveChildren: true,
        emptyChildrenMessage: "No district defined for this province",
        childCountLabel: {
          plural: "districts",
          singular: "district"
        },
        metadataDisplay: {
          showChildCount: true,
          showMetadata: true,
          customMetadataFormatter: (_, childCount) => {
            const metadata: string[] = [];
            // Show child count with custom label
            if (childCount > 0) {
              metadata.push(`${childCount} ${childCount === 1 ? "district" : "districts"}`);
            }
            return metadata;
          }
        },
        styling: {
          backgroundColor: "bg-gray-100 dark:bg-gray-800"
        },
        actions: []
      },
      // Level 2
      {
        canHaveChildren: false,
        icon: <FileIcon className="w-4 h-4 text-green-600 dark:text-green-300" />,
        metadataDisplay: {
          showChildCount: false,
          showMetadata: false,
          customMetadataFormatter: () => {
            const metadata: string[] = [];
            return metadata;
          }
        },
        styling: {
          backgroundColor: "bg-gray-200 dark:bg-gray-700"
        },
        actions: []
      }
    ]
  }), []);

  return (
    <>
      <HierarchyView
        config={hierarchyConfig}
        isLoading={isLoading}
        items={hierarchyItems}
        showInactive={showInactive}
        onLoadingChange={setIsLoading}
      />
    </>
  );
};

export default OrganizationHierarchyView;
