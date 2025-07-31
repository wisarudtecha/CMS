// UserInfoCard.tsx - ตัดส่วน Modal และปุ่ม Edit ออก
import { useEffect, useState } from "react";

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
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Not specified';
  }
};

// Helper function to format gender
const formatGender = (gender: number | undefined): string => {
  if (gender === undefined || gender === null) return 'Not specified';
  switch (gender) {
    case 0: return 'Male';
    case 1: return 'Female';
    case 2: return 'Other';
    default: return 'Not specified';
  }
};

export default function UserInfoCard() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileString = localStorage.getItem("profile");
        const token = localStorage.getItem("access_token");

        if (!profileString || !token) {
          setError("ไม่พบข้อมูลผู้ใช้หรือ Token ในระบบ");
          setLoading(false);
          return;
        }

        const profile = JSON.parse(profileString);
        const username = profile?.username;

        if (!username) {
          setError("ไม่พบ Username ในข้อมูล Profile");
          setLoading(false);
          return;
        }

        const response = await apiFetch(`${API_BASE_URL}/users/username/${username}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            setError("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
          } else {
            setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
          }
          setLoading(false);
          return;
        }

        const result = await response.json();
        let user = null;
        
        if (result && typeof result === 'object') {
          if ('data' in result && typeof result.data === 'object') {
            user = result.data;
          } else {
            user = result;
          }
        }

        if (user) {
          setUserData(user);
        } else {
          setError("ไม่พบข้อมูลผู้ใช้จาก API");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className="p-5 text-center">Loading user data...</div>;
  }

  if (error && !userData) {
    return <div className="p-5 text-center text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="p-5 text-center">No user data available.</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.firstName || "Not specified"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.lastName || "Not specified"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.mobileNo || "Not specified"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Citizen ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.citizenId || "Not specified"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date of Birth
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(userData.bod)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Gender
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatGender(userData.gender)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Blood Group
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.blood || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}