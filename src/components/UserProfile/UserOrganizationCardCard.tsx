// UserOrganizationCard.tsx - ตัดส่วน Modal และปุ่ม Edit ออก
import { useTranslation } from "../../hooks/useTranslation";
import { useUserProfile } from "../../context/UserProfileContext";
import type { UserProfile } from "@/types/user";

interface DropdownData {
  id: string;
  name: string;
  commId?: string;
  deptId?: string;
  stnId?: string;
  roleName?: string;
}

interface UserOrganizationCardProps {
  userData?: UserProfile | null;
  rolesData?: DropdownData[];
  departmentsData?: DropdownData[];
  commandsData?: DropdownData[];
  stationsData?: DropdownData[];
  loading?: boolean;
  error?: string | null;
}

// Helper function to format user type
const formatUserType = (userType: number | undefined, t: any): string => {
  if (userType === undefined || userType === null) return t('userform.na');
  switch (userType) {
    case 0: return t('userform.userTypeRegular');
    case 1: return t('userform.userTypeAdmin');
    case 2: return t('userform.userTypeSuperAdmin');
    default: return t('userform.userTypeUnknown');
  }
};

export default function UserOrganizationCard({ 
  userData: propUserData, 
  rolesData: propRolesData, 
  departmentsData: propDepartmentsData, 
  commandsData: propCommandsData, 
  stationsData: propStationsData, 
  loading: propLoading, 
  error: propError 
}: UserOrganizationCardProps = {}) {
  const { t } = useTranslation();
  
  // Try to use context first, fallback to props
  let contextData;
  try {
    contextData = useUserProfile();
  } catch {
    // Context not available, use props or defaults
    contextData = {
      userData: propUserData || null,
      rolesData: propRolesData || [],
      departmentsData: propDepartmentsData || [],
      commandsData: propCommandsData || [],
      stationsData: propStationsData || [],
      loading: propLoading || false,
      error: propError || null
    };
  }
  
  const { userData, rolesData, departmentsData, commandsData, stationsData, loading, error } = contextData;

  // Get display names for current values
  const getCommandName = (commId: string | undefined) => {
    if (!commId) return t('userform.na');
    const command = commandsData.find((c: any) => c.commId === commId || c.id === commId);
    return command?.name || t('userform.na');
  };

  const getDepartmentName = (deptId: string | undefined) => {
    if (!deptId) return t('userform.na');
    const department = departmentsData.find((d: any) => d.deptId === deptId || d.id === deptId);
    return department?.name || t('userform.na');
  };

  const getStationName = (stnId: string | undefined) => {
    if (!stnId) return t('userform.na');
    const station = stationsData.find((s: any) => s.stnId === stnId || s.id === stnId);
    return station?.name || t('userform.na');
  };

  const getRoleName = (roleId: string | undefined) => {
    if (!roleId) return t('userform.na');
    const role = rolesData.find((r: any) => r.id === roleId);
    return role?.name || t('userform.na');
  };

  if (loading) {
    return <div className="p-5 text-center">{t("userform.loadingUserData")}</div>;
  }

  if (error && !userData) {
    return <div className="p-5 text-center text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="p-5 text-center">{t("userform.noUserData")}</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            {t("userform.orgInfo")}
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("userform.empId")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.empId || t("userform.na")}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("userform.userType")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatUserType(typeof userData.userType === 'number' ? userData.userType : undefined, t)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("userform.command")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getCommandName(userData.commId)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("userform.department")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDepartmentName(userData.deptId)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("userform.station")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getStationName(userData.stnId)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("userform.role")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getRoleName(userData.roleId)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {t("status.status")}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  userData.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {userData.active ? t("status.active") : t("status.inactive")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
