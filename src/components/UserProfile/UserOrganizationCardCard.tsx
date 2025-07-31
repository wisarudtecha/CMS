// UserOrganizationCard.tsx - ตัดส่วน Modal และปุ่ม Edit ออก
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cmsapi-production-488d.up.railway.app";

interface UserProfile {
  id: string;
  empId?: string;
  commId?: string;
  deptId?: string;
  stnId?: string;
  roleId?: string;
  userType?: number;
  active?: boolean;
}

interface DropdownData {
  id: string;
  name: string;
  commId?: string;
  deptId?: string;
  stnId?: string;
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

// Helper function to get current language
const getCurrentLanguage = () => 'en';

// Helper function to format user type
const formatUserType = (userType: number | undefined): string => {
  if (userType === undefined || userType === null) return 'Not specified';
  switch (userType) {
    case 0: return 'Regular User';
    case 1: return 'Admin User';
    case 2: return 'Super Admin';
    default: return 'Unknown';
  }
};

export default function UserOrganizationCard() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  
  // Dropdown data states
  const [rolesData, setRolesData] = useState<DropdownData[]>([]);
  const [departmentsData, setDepartmentsData] = useState<DropdownData[]>([]);
  const [commandsData, setCommandsData] = useState<DropdownData[]>([]);
  const [stationsData, setStationsData] = useState<DropdownData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get display names for current values
  const getCommandName = (commId: string | undefined) => {
    if (!commId) return 'Not specified';
    const command = commandsData.find(c => c.commId === commId || c.id === commId);
    return command?.name || 'Not specified';
  };

  const getDepartmentName = (deptId: string | undefined) => {
    if (!deptId) return 'Not specified';
    const department = departmentsData.find(d => d.deptId === deptId || d.id === deptId);
    return department?.name || 'Not specified';
  };

  const getStationName = (stnId: string | undefined) => {
    if (!stnId) return 'Not specified';
    const station = stationsData.find(s => s.stnId === stnId || s.id === stnId);
    return station?.name || 'Not specified';
  };

  const getRoleName = (roleId: string | undefined) => {
    if (!roleId) return 'Not specified';
    const role = rolesData.find(r => r.id === roleId);
    return role?.name || 'Not specified';
  };

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch dropdown data first
        const endpoints = [
          '/api/v1/role?start=0&length=100',
          '/api/v1/departments?start=0&length=100',
          '/api/v1/commands?start=0&length=100',
          '/api/v1/stations?start=0&length=100'
        ];

        const responses = await Promise.all(
          endpoints.map(ep => apiFetch(API_BASE_URL + ep).catch(() => ({ ok: false })))
        );
        
        const results = await Promise.all(
          responses.map(res => {
            if (res instanceof Response) {
              return res.ok ? res.json().catch(() => ({ data: [] })) : Promise.resolve({ data: [] });
            } else {
              return Promise.resolve({ data: [] });
            }
          })
        );
        
        const lang = getCurrentLanguage();
        setRolesData((results[0].data || []).map((r: any) => ({ 
          id: r.id, 
          name: r[lang] ?? r.roleName 
        })));
        setDepartmentsData((results[1].data || []).map((d: any) => ({ 
          id: d.id, 
          name: d[lang] ?? d.name, 
          deptId: d.deptId 
        })));
        setCommandsData((results[2].data || []).map((c: any) => ({ 
          id: c.id, 
          name: c[lang] ?? c.name, 
          commId: c.commId 
        })));
        setStationsData((results[3].data || []).map((s: any) => ({ 
          id: s.id, 
          name: s[lang] ?? s.name, 
          stnId: s.stnId 
        })));

        // Fetch user data
        const userResponse = await apiFetch(`${API_BASE_URL}/api/v1/users/username/${username}`);
        
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            setError("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
          } else {
            setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
          }
          setLoading(false);
          return;
        }

        const result = await userResponse.json();
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
        console.error("Error fetching data:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            Organization Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Employee ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData.empId || "Not specified"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                User Type
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatUserType(userData.userType)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Command
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getCommandName(userData.commId)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Department
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getDepartmentName(userData.deptId)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Station
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getStationName(userData.stnId)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Role
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {getRoleName(userData.roleId)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Status
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  userData.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {userData.active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}