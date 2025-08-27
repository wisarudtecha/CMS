// UserInfoCard.tsx - ตัดส่วน Modal และปุ่ม Edit ออก
import { useTranslation } from "../../hooks/useTranslation";
import { useUserProfile } from "../../context/UserProfileContext";
import type { UserProfile } from "@/types/user";

interface UserInfoCardProps {
  userData?: UserProfile | null;
  loading?: boolean;
  error?: string | null;
}

// Helper function to format date
const formatDate = (dateString: string | undefined, t: any): string => {
  if (!dateString) return t('userform.na');
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return t('userform.na');
  }
};

// Helper function to format gender
const formatGender = (gender: number | undefined, t: any): string => {
  if (gender === undefined || gender === null) return t('userform.na');
  switch (gender) {
    case 0: return t('userform.genderMale');
    case 1: return t('userform.genderFemale');
    case 2: return t('userform.genderOther');
    default: return t('userform.na');
  }
};

export default function UserInfoCard({ userData: propUserData, loading: propLoading, error: propError }: UserInfoCardProps = {}) {
  const { t } = useTranslation();
  
  // Try to use context first, fallback to props
  let contextData;
  try {
    contextData = useUserProfile();
  } catch {
    // Context not available, use props or defaults
    contextData = {
      userData: propUserData || null,
      loading: propLoading || false,
      error: propError || null
    };
  }
  
  const { userData, loading, error } = contextData;

  if (loading) {
    return <div className="p-5 text-center">{t("userform.loadingUserData")}</div>;
  }

  if (error) {
    return <div className="p-5 text-center text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="p-5 text-center">{t("userform.noUserData")}</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t('userform.personal')}
        </h4>
      </div>

      <div>
        <div className="flex flex-col gap-6">
          <div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t('userform.firstName')}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.firstName || t('userform.na')}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t('userform.lastName')}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.lastName || t('userform.na')}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t('userform.email')}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.email || t('userform.na')}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t('userform.mobile')}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.mobileNo || t('userform.na')}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t('userform.citizenId')}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.citizenId || t('userform.na')}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t('userform.dob')}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatDate(userData.bod, t)}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t('userform.gender')}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatGender(typeof userData.gender === 'number' ? userData.gender : undefined, t)}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t('userform.blood')}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.blood || t('userform.na')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
