import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

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
  empId?: string;
  commId?: string;
  deptId?: string;
  stnId?: string;
  roleId?: string;
  userType?: number;
  active?: boolean;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

interface DropdownData {
  id: string;
  name: string;
  commId?: string;
  deptId?: string;
  stnId?: string;
  roleName?: string;
}

interface UserProfileContextType {
  userData: UserProfile | null;
  rolesData: DropdownData[];
  departmentsData: DropdownData[];
  commandsData: DropdownData[];
  stationsData: DropdownData[];
  loading: boolean;
  error: string | null;
  refetchUserData: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

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

interface UserProfileProviderProps {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [rolesData, setRolesData] = useState<DropdownData[]>([]);
  const [departmentsData, setDepartmentsData] = useState<DropdownData[]>([]);
  const [commandsData, setCommandsData] = useState<DropdownData[]>([]);
  const [stationsData, setStationsData] = useState<DropdownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchRef = useRef(false); // ใช้ useRef เพื่อ track การ fetch

  const fetchData = async () => {
    // ป้องกันการ fetch ซ้ำ
    if (fetchRef.current) {
      console.log('Fetch already in progress or completed, skipping...');
      return;
    }

    try {
      fetchRef.current = true; // ตั้งค่าว่า fetch เริ่มแล้ว
      setLoading(true);
      console.log('Starting fetch data...');
      
      const profileString = localStorage.getItem("profile");
      const token = localStorage.getItem("access_token");

      if (!profileString || !token) {
        setError("Unauthorized");
        setLoading(false);
        fetchRef.current = false;
        return;
      }

      const profile = JSON.parse(profileString);
      const username = profile?.username;

      if (!username) {
        setError("Unauthorized");
        setLoading(false);
        fetchRef.current = false;
        return;
      }

      // Fetch dropdown data first
      const endpoints = [
        '/role?start=0&length=100',
        '/departments?start=0&length=100',
        '/commands?start=0&length=100',
        '/stations?start=0&length=100'
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
        name: r[lang] ?? r.roleName,
        roleName: r.roleName
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
      const userResponse = await apiFetch(`${API_BASE_URL}/users/username/${username}`);
      
      if (!userResponse.ok) {
        setError("Failed to fetch user data");
        setLoading(false);
        fetchRef.current = false;
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
        setError(null);
        console.log('Data fetched successfully!');
      } else {
        setError("No user data found");
        fetchRef.current = false;
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Server error");
      fetchRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initFetch = async () => {
      if (mounted && !fetchRef.current) {
        await fetchData();
      }
    };
    
    initFetch();
    
    return () => {
      mounted = false;
    };
  }, []); // ลบ dependency array เพื่อให้ run แค่ครั้งเดียว

  const value: UserProfileContextType = {
    userData,
    rolesData,
    departmentsData,
    commandsData,
    stationsData,
    loading,
    error,
    refetchUserData: fetchData
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
