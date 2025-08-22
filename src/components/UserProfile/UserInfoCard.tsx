// UserInfoCard.tsx - ตัดส่วน Modal และปุ่ม Edit ออก
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "../../hooks/useTranslation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cmsapi-production-488d.up.railway.app";

interface UserProfile {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  photo: string;
  address: string | null;
  title?: string;
  middleName?: string;
  citizenId?: string;
  bod?: string;
  gender?: number;
  blood?: string;
  bio?: string;
}

// Helper function for API calls with authentication
const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers);

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.append('Content-Type', 'application/json');
    }
  }

  const newOptions: RequestInit = { ...options, headers };
  return fetch(url, newOptions);
};

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

export default function UserInfoCard() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useMemo(() => {
    return async () => {
      try {
        const profileString = localStorage.getItem("profile");
        const token = localStorage.getItem("access_token");

        if (!profileString || !token) {
          setError(t("userform.loadingUserData"));
          setLoading(false);
          return;
        }

        const profile = JSON.parse(profileString);
        const username = profile?.username;

        if (!username) {
          setError(t("userform.loadingUserData"));
          setLoading(false);
          return;
        }

        const response = await apiFetch(`${API_BASE_URL}/users/username/${username}`);

        if (!response.ok) {
          if (response.status === 401) {
            setError(t("errors.unauthorized"));
          } else {
            setError(t("errors.server_error"));
          }
          setLoading(false);
          return;
        }

        const result = await response.json();
        setUserData(result.data || null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(t("errors.server_error"));
      } finally {
        setLoading(false);
      }
    };
  }, [t]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
                  {formatGender(userData.gender, t)}
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
