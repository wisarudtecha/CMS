// /src/components/admin/system-configuration/unit/unit-form/UnitForm.tsx
import React, { useEffect, useState } from "react";
import { CloseIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { useTranslation } from "@/hooks/useTranslation";
import type { UnitFormData, UnitFormProps } from "@/types/unit";
import BasicInfoSection from "@/components/admin/system-configuration/unit/unit-form/sections/BasicInfoSection";
import LocationSection from "@/components/admin/system-configuration/unit/unit-form/sections/LocationSection";
import OrganizationSection from "@/components/admin/system-configuration/unit/unit-form/sections/OrganizationSection";
import StatusSection from "@/components/admin/system-configuration/unit/unit-form/sections/StatusSection";
import Button from "@/components/ui/button/Button";

const defaultFormData: UnitFormData = {
  active: true,
  // breakDuration: 0,
  commId: "000a4186-3455-4122-b702-6587157b53dd",
  compId: "COMP001",
  deptId: "c3d95eca-17a8-4556-b957-a4ee057d9c26",
  // healthChk: "",
  // healthChkTime: "",
  // isFreeze: false,
  // isLogin: false,
  // isOutArea: false,
  // locAccuracy: 0,
  // locAlt: 0,
  // locBearing: 0,
  // locGpsTime: "",
  // locLastUpdateTime: "",
  // locLat: 0,
  // locLon: 0,
  // locProvider: "",
  // locSatellites: 0,
  // locSpeed: 0,
  // orgId: "",
  // plateNo: "",
  priority: 1,
  // provinceCode: "",
  stnId: "10000000-0000-0000-0000-000000000001",
  // sttId: "",
  unitId: "",
  unitName: "",
  unitSourceId: "3c48bb37-22a4-4aca-b659-955feadeb5c1",
  unitTypeId: "d3f4e6fc-1a75-4db6-a45e-8f2231cb6b70",
  username: "",
};

const UnitForm: React.FC<UnitFormProps> = ({
  areas,
  commands,
  companies,
  departments,
  id,
  initialData,
  isLoading = false,
  // mode = "create",
  sources,
  stations,
  unitTypes,
  users,
  onCancel,
  onSubmit
}) => {
  const { language, t } = useTranslation();

  const [formData, setFormData] = useState<UnitFormData>({
    ...defaultFormData,
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UnitFormData, string>>>({});

  const [commandsOptions, setCommandsOptions] = useState<{ value: string; label: string }[]>([]);
  const [companiesOptions, setCompaniesOptions] = useState<{ value: string; label: string }[]>([]);
  const [departmentsOptions, setDepartmentsOptions] = useState<{ value: string; label: string }[]>([]);
  const [provincesOptions, setProvincesOptions] = useState<{ value: string; label: string }[]>([]);
  const [sourcesOptions, setSourcesOptions] = useState<{ value: string; label: string }[]>([]);
  const [stationsOptions, setStationsOptions] = useState<{ value: string; label: string }[]>([]);
  const [unitTypesOptions, setUnitTypesOptions] = useState<{ value: string; label: string }[]>([]);
  const [usersOptions, setUsersOptions] = useState<{ value: string; label: string }[]>([]);

  const [confirmIsOpen, setConfirmIsOpen] = useState(false);

  const handleChange = (field: keyof UnitFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UnitFormData, string>> = {};

    // Required fields validation
    if (!formData.unitId.trim()) {
      newErrors.unitId = t("crud.unit.form.basic_information.sections.unitId.required");
    }
    if (!formData.unitName.trim()) {
      newErrors.unitName = t("crud.unit.form.basic_information.sections.unitName.required");
    }

    // Number validations
    // if (formData?.locLat < -90 || formData?.locLat > 90) {
    //   newErrors.locLat = t("crud.unit.form.location_information.sections.locLat.error");
    // }
    // if (formData.locLon < -180 || formData.locLon > 180) {
    //   newErrors.locLon = t("crud.unit.form.location_information.sections.locLon.error");
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setConfirmIsOpen(false);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData, id || undefined);
    }
    catch (error) {
      console.error("Form submission error:", error);
    }
  };

  useEffect(() => {
    if (id) {
      setFormData({
        ...defaultFormData,
        ...initialData,
      });
    }
  }, [id, initialData]);

  useEffect(() => {
    setCommandsOptions(commands?.map(comm => ({
      value: String(comm.commId),
      label: language === "th" && comm.th || comm.en
    })) || []);
  }, [commands, language]);

  useEffect(() => {
    setCompaniesOptions(companies?.map(comp => ({
      value: String(comp.id),
      label: comp.legalName || comp.name
    })) || []);
  }, [companies]);

  useEffect(() => {
    setDepartmentsOptions(departments?.map(d => ({
      value: String(d.deptId),
      label: language === "th" && d.th || d.en
    })) || []);
  }, [departments, language]);

  useEffect(() => {
    setProvincesOptions(areas?.length && areas.filter(
      (item, index, self) => index === self.findIndex(t => t.provId === item.provId)
    )?.map(a => ({
      value: String(a.provId),
      label: language === "th" ? a.provinceTh : a.provinceEn
    })) || []);
  }, [areas, language]);

  useEffect(() => {
    setSourcesOptions(sources?.map(s => ({
      value: String(s.unitSourceId),
      label: language === "th" && `${s.th} (${s.en})` || `${s.en} (${s.th})` || ""
    })) || []);
  }, [language, sources]);

  useEffect(() => {
    setStationsOptions(stations?.map(s => ({
      value: String(s.stnId),
      label: language === "th" && s.th || s.en
    })) || []);
  }, [language, stations]);

  useEffect(() => {
    setUnitTypesOptions(unitTypes?.map(ut => ({
      value: String(ut.unitTypeId),
      label: language === "th" && `${ut.th} (${ut.en})` || `${ut.en} (${ut.th})` || ""
    })) || []);
  }, [language, unitTypes]);

  useEffect(() => {
    setUsersOptions(users?.map(u => ({
      value: String(u.username),
      label: `${u.username} (${u.firstName} ${u.lastName})`
    })) || []);
  }, [users]);

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03] p-6">
          <div className="mx-auto w-full">
            <BasicInfoSection
              formData={formData}
              errors={errors}
              sources={sourcesOptions}
              unitTypes={unitTypesOptions}
              users={usersOptions}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03] p-6">
          <div className="mx-auto w-full">
            <OrganizationSection
              commands={commandsOptions}
              companies={companiesOptions}
              departments={departmentsOptions}
              formData={formData}
              errors={errors}
              provinces={provincesOptions}
              stations={stationsOptions}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03] p-6">
          <div className="mx-auto w-full">
            <StatusSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03] p-6">
          <div className="mx-auto w-full">
            <LocationSection
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex items-end justify-end gap-4">
          {onCancel && (
            <Button
              disabled={isLoading}
              variant="secondary"
              onClick={onCancel}
            >
              {t("crud.unit.action.cancel")}
            </Button>
          )}
          <Button
            disabled={isLoading}
            variant="outline"
            onClick={() => {
              setFormData({
                ...defaultFormData,
                ...initialData,
              });
            }}
          >
            {t("crud.unit.action.reset")}
          </Button>
          <Button
            disabled={isLoading}
            variant="primary"
            onClick={() => setConfirmIsOpen(true)}
          >
            {isLoading ? t("crud.unit.action.saving") : t("crud.unit.action.save")}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={confirmIsOpen}
        onClose={() => setConfirmIsOpen(false)}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            {id
              && t("crud.unit.action.confirmDialog.titleUpdate")
              || t("crud.unit.action.confirmDialog.titleCreate")
            }
          </h3>
          <Button
            onClick={() => setConfirmIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {id
            && t("crud.unit.action.confirmDialog.descriptionUpdate")
            || t("crud.unit.action.confirmDialog.descriptionCreate")
          } {formData.unitName}
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button
              onClick={() => setConfirmIsOpen(false)}
              variant="outline"
            >
              {t("crud.unit.action.confirmDialog.cancel")}
            </Button>
            <Button onClick={handleSubmit} variant="success">
              {t("crud.unit.action.confirmDialog.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UnitForm;
