// /src/pages/Admin/UnitForm.tsx
/**
 * @fileoverview Units Management Form.
 * 
 * @description
 * Comprehensive units management form system that builds upon the existing Unit Management interface.
 * Provides unit definition, lifecycle management.
 * Integrates with existing Unit"s Properties system.
 * 
 * @metadata
 * Author: [Wisarud Techa]
 * First Created: [29-10-2025] v0.1.0
 * Last Updated: [29-10-2025] v0.1.0
 * 
 * @notes
 * - Auto-generated code; may contain incomplete logic or require validation.
 * - Modify with caution and document changes.
 * - Intended as a starting point or scaffolding.
 */

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/hooks/useTranslation";
import { useGetAreaQuery } from "@/store/api/area";
import { useGetDepartmentsQuery, useGetCommandsQuery, useGetStationsQuery } from "@/store/api/organizationApi";
import {
  useCreateUnitsMutation,
  // useGetUnitsQuery,
  useGetUnitsByIdQuery,
  useUpdateUnitsMutation,
  useGetCompaniesQuery,
  useGetSourcesQuery,
  useGetUnitTypesQuery
} from "@/store/api/unitApi";
import { useGetUsersQuery } from "@/store/api/userApi";
import type { Area } from "@/store/api/area";
import type { Department, Command, Station } from "@/types/organization";
import type {
  Unit,
  UnitFormData,
  UnitType,
  Company,
  Source
} from "@/types/unit";
import type { UserProfile } from "@/types/user";
import UnitForm from "@/components/admin/system-configuration/unit/unit-form/UnitForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

interface UnitParams {
  id?: string;
  [key: string]: string | undefined;
}

const UnitFormPage: React.FC = () => {
  const { t } = useTranslation();

  const permissions = usePermissions();

  const { toasts, addToast, removeToast } = useToast();

  const { id } = useParams<UnitParams>();
  const unitId = Number(id);

  const [isLoading, setIsLoading] = useState(false);

  const [createUnits] = useCreateUnitsMutation();
  const [updateUnits] = useUpdateUnitsMutation();

  const handleSubmit = async (data: UnitFormData, id?: number) => {
    setIsLoading(true);
    try {
      // const response = await fetch("/api/units", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to create unit");

      setIsLoading(true);
      let response;
      if (permissions.hasAnyPermission(["unit.create", "unit.update"])) {
        if (id) {
          response = await updateUnits({
            id: id, data: data
          }).unwrap();
        }
        else {
          response = await createUnits(data).unwrap();
        }
      }
      else {
        throw new Error(t("crud.common.permission_denied"));
      }
      if (response?.status) {
        const storage = localStorage || sessionStorage;
        storage.setItem("toast", JSON.stringify({
          status: "success", msg: id && t("crud.unit.action.update.success") || t("crud.unit.action.create.success")
        }));
        window.location.replace("/unit");
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
      addToast("error", id && t("crud.unit.action.update.error") || t("crud.unit.action.create.error"));
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back or reset form
    // console.log("Form cancelled");
    window.location.replace("/unit");
  };

  // ===================================================================
  // API Data
  // ===================================================================
  // const { data: unitsData } = useGetUnitsQuery({ start: 0, length: 1000 });
  // const units = unitsData?.data as unknown as Unit[] || [];

  const mockCompanies: Company[] = [
    {
      "id": "3e2579aa-0eaf-4f1d-94f9-1c1aa8ffabcd",
      "name": "SKY-AI",
      "legalName": "SKY AI COMPANY LIMITED",
      "domain": "skyai.co.th",
      "email": "contact@skyai.co.th",
      "phoneNumber": "02-123-4567",
      "address": {
        "building": "Central Pinklao Tower A",
        "country": "Thailand",
        "district": "Bangkok Noi",
        "floor": "19th",
        "postalCode": "10700",
        "province": "Bangkok",
        "road": "Baromrajchonnee Rd",
        "street": "7/129",
        "subDistrict": "Aroon-Amarin"
      },
      "logoUrl": "https://skyai.co.th/logo.png",
      "websiteUrl": "https://skyai.co.th",
      "description": "AI Solution provider for smart city and industry.",
      "createdAt": "2025-10-14T16:17:50.700576Z",
      "updatedAt": "2025-10-14T16:17:50.700576Z",
      "createdBy": "apiwat_r",
      "updatedBy": "apiwat_r"
    },
    {
      "id": "3e2579aa-0eaf-4f1d-94f9-1c1aa8ffabcc",
      "name": "BKI",
      "legalName": "BKI COMPANY LIMITED",
      "domain": "bki.co.th",
      "email": "contact@bki.co.th",
      "phoneNumber": "02-123-5555",
      "address": {
        "building": "Central Pinklao Tower A",
        "country": "Thailand",
        "district": "Bangkok Noi",
        "floor": "19th",
        "postalCode": "10700",
        "province": "Bangkok",
        "road": "Baromrajchonnee Rd",
        "street": "7/129",
        "subDistrict": "Aroon-Amarin"
      },
      "logoUrl": "https://skyai.co.th/logo.png",
      "websiteUrl": "https://skyai.co.th",
      "description": "AI Solution provider for smart city and industry.",
      "createdAt": "2025-11-19T11:50:50.700576Z",
      "updatedAt": "2025-11-19T11:50:50.700576Z",
      "createdBy": "watee.tha",
      "updatedBy": "watee.tha"
    }
  ];
  const { data: companiesData } = useGetCompaniesQuery({ start: 0, length: 100 });
  const companies = companiesData?.data as unknown as Company[] || mockCompanies || [];

  const mockSources: Source[] = [
    {
      "id": "1",
      "unitSourceId": "3c48bb37-22a4-4aca-b659-955feadeb5c1",
      "orgId": "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
      "en": "Internal",
      "th": "หน่วยภายใน",
      "active": true,
      "createdAt": "2025-10-14T16:09:27.418358Z",
      "updatedAt": "2025-10-14T16:09:27.418358Z",
      "createdBy": "apiwat.rod",
      "updatedBy": "apiwat.rod"
    },
    {
      "id": "2",
      "unitSourceId": "9ad5d430-5125-46e2-8fea-dff3aef14f69",
      "orgId": "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
      "en": "External",
      "th": "หน่วยภายนอกองค์กร",
      "active": true,
      "createdAt": "2025-10-14T16:09:27.418358Z",
      "updatedAt": "2025-10-14T16:09:27.418358Z",
      "createdBy": "apiwat.rod",
      "updatedBy": "apiwat.rod"
    }
  ];
  const { data: sourcesData } = useGetSourcesQuery({ start: 0, length: 100 });
  const sources = sourcesData?.data as unknown as Source[] || mockSources || [];

  const mockUnitTypes: UnitType[] = [
    {
      "id": "1",
      "unitTypeId": "798dd020-257f-47e7-8aa5-92277cbb9759",
      "orgId": "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
      "en": "Repair - Camera",
      "th": "รถซ่อมกล้องวงจรปิด",
      "active": true,
      "createdAt": "2025-10-15T17:57:13.860994Z",
      "updatedAt": "2025-10-15T17:57:13.860994Z",
      "createdBy": "apiwat.rod",
      "updatedBy": "apiwat.rod"
    },
    {
      "id": "2",
      "unitTypeId": "cf21308f-0f11-4d42-8200-73668a07cdef",
      "orgId": "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
      "en": "Repair - Water Sensor",
      "th": "รถซ่อมเซ็นเซอร์น้ำ",
      "active": true,
      "createdAt": "2025-10-15T17:57:13.860994Z",
      "updatedAt": "2025-10-15T17:57:13.860994Z",
      "createdBy": "apiwat.rod",
      "updatedBy": "apiwat.rod"
    },
    {
      "id": "4",
      "unitTypeId": "f0372c38-2266-426b-8e9e-73df5e4045d4",
      "orgId": "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
      "en": "METTRIQ",
      "th": "METTRIQ",
      "active": true,
      "createdAt": "2025-11-24T16:26:27.961825Z",
      "updatedAt": "2025-11-24T16:26:27.961825Z",
      "createdBy": "apiwat.rod",
      "updatedBy": "apiwat.rod"
    }
  ];
  const { data: unitTypesData } = useGetUnitTypesQuery({ start: 0, length: 100 });
  const unitTypes = unitTypesData?.data as unknown as UnitType[] || mockUnitTypes || [];

  const { data: usersData } = useGetUsersQuery({ start: 0, length: 1000 });
  const users = usersData?.data as unknown as UserProfile[] || [];

  const { data: departmentsData } = useGetDepartmentsQuery({ start: 0, length: 100 });
  const departments = departmentsData?.data as unknown as Department[] || [];

  const { data: commandsData } = useGetCommandsQuery({ start: 0, length: 1000 });
  const commands = commandsData?.data as unknown as Command[] || [];

  const { data: stationsData } = useGetStationsQuery({ start: 0, length: 10000 });
  const stations = stationsData?.data as unknown as Station[] || [];

  const { data: areasData } = useGetAreaQuery(null);
  const areas = areasData?.data as unknown as Area[] || [];

  const { data: unitData } = useGetUnitsByIdQuery(unitId, { skip: !unitId });
  const unit = unitData?.data as unknown as Unit || {};

  return (
    <>
      <PageMeta
        title="React.js Unit Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Unit Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["unit.create", "unit.update"]}>
        <PageBreadcrumb
          items={[
            { label: t("common.home"), href: "/" },
            { label: t("navigation.sidebar.main.system_configuration.nested.unit_management.header"), href: "/unit" },
            { label: unitId
              && t("navigation.sidebar.main.system_configuration.nested.unit_management.update.header")
              || t("navigation.sidebar.main.system_configuration.nested.unit_management.create.header")
            }
          ]}
        />

        {/* <UnitFormComponent unit={units} /> */}

        <UnitForm
          areas={areas}
          commands={commands}
          companies={companies}
          departments={departments}
          id={unitId}
          isLoading={isLoading}
          mode="create"
          sources={sources}
          stations={stations}
          initialData={unit}
          unitTypes={unitTypes}
          users={users}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </ProtectedRoute>
    </>
  );
};

export default UnitFormPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Types and Interfaces.
 * - Main Form Component.
 * - Form Sections.
 * - Common Components.
 * - Styling (CSS).
 * - Usage Example.
 * 
 * @version 0.1.0
 * @date    29-10-2025
 * ----------------------------------------------------------------------------
 */
