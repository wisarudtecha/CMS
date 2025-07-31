import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cmsapi-production-488d.up.railway.app";

// --- Type Definitions ---
interface UserFormData {
    active: boolean;
    address: string;
    blood: string;
    bod: string;
    citizenId: string;
    commId: string;
    deptId: string;
    displayName: string;
    email: string;
    empId: string;
    firstName: string;
    gender: number | string;
    lastName: string;
    middleName: string;
    mobileNo: string;
    orgId: string;
    password?: string;
    confirmPassword?: string;
    photo: File | string | null;
    roleId: string;
    stnId: string;
    title: string;
    userType: number | string;
    username: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

// --- Helper Functions (Moved Outside Component) ---

const formatDateTime = (isoString: string | undefined): string => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} | ${hh}:${min}`;
};

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

const getCurrentLanguage = () => 'en';

// --- SVG Icons (Moved Outside Component) ---
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg> );
const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" /><path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.342 1.374a3.026 3.026 0 01.64 2.278V17.25a3.026 3.026 0 01-.64 2.278 2.993 2.993 0 01-2.342 1.374 49.52 49.52 0 01-5.312 0 2.993 2.993 0 01-2.342-1.374 3.026 3.026 0 01-.64-2.278V6.723a3.026 3.026 0 01.64-2.278 2.993 2.993 0 012.342-1.374zM12 18a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" /></svg> );


const UserCreateEdit: React.FC = () => {
    // --- Hooks ---
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [fromProfile, setFromProfile] = useState(false);
    const location = useLocation();
    
    // --- State ---
    const [formData, setFormData] = useState<UserFormData>({
        active: true, address: '', blood: 'A', bod: '', citizenId: '', commId: '', deptId: '',
        displayName: '', email: '', empId: '', firstName: '', gender: 0, lastName: '',
        middleName: '', mobileNo: '', orgId: '', password: '', confirmPassword: '', photo: null,
        roleId: '', stnId: '', title: 'Mr.', userType: 0, username: '',
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [rolesData, setRolesData] = useState<{id: string, name: string}[]>([]);
    const [departmentsData, setDepartmentsData] = useState<{id: string, name: string, deptId: string}[]>([]);
    const [commandsData, setCommandsData] = useState<{id: string, name: string, commId: string}[]>([]);
    const [stationsData, setStationsData] = useState<{id: string, name: string, stnId: string}[]>([]);

    // --- Derived State ---
    const isEdit = Boolean(id && location.pathname.includes('/edit'));
    const isView = Boolean(id && !isEdit);
    const pageMode = isView ? 'View' : isEdit ? 'Edit' : 'Create';

    // ตรวจสอบว่ามาจากหน้า Profile หรือไม่
    useEffect(() => {
        const isFromProfile = location.state?.from === 'profile';
        setFromProfile(isFromProfile);
    }, [location]);

    // --- Effects ---
    // Fetch Dropdown Data
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const endpoints = [
                    '/api/v1/role?start=0&length=100',
                    '/api/v1/departments?start=0&length=100',
                    '/api/v1/commands?start=0&length=100',
                    '/api/v1/stations?start=0&length=100'
                ];
                const responses = await Promise.all(endpoints.map(ep => apiFetch(API_BASE_URL + ep)));
                const results = await Promise.all(responses.map(res => res.ok ? res.json() : Promise.resolve({ data: [] })));
                
                const lang = getCurrentLanguage();
                setRolesData((results[0].data || []).map((r: any) => ({ id: r.id, name: r[lang] ?? r.roleName })));
                setDepartmentsData((results[1].data || []).map((d: any) => ({ id: d.id, name: d[lang] ?? d.name, deptId: d.deptId })));
                setCommandsData((results[2].data || []).map((c: any) => ({ id: c.id, name: c[lang] ?? c.name, commId: c.commId })));
                setStationsData((results[3].data || []).map((s: any) => ({ id: s.id, name: s[lang] ?? s.name, stnId: s.stnId })));

            } catch (err) {
                console.error("Failed to fetch dropdown data:", err);
                setError("Could not load required organizational data.");
            }
        };
        fetchDropdowns();
    }, []); // Runs once on mount.

    // --- FIX 1: MODIFIED `useEffect` FOR FETCHING USER DATA ---
    // Fetch User Data for Edit/View Mode
    useEffect(() => {
        // Only run if we have an ID and the dropdown data has been loaded.
        const allDropdownsLoaded = commandsData.length > 0 && departmentsData.length > 0 && stationsData.length > 0 && rolesData.length > 0;
        if (id && allDropdownsLoaded) {
            const fetchUserData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await apiFetch(`${API_BASE_URL}/api/v1/users/${id}`);
                    if (!response.ok) {
                        if (response.status === 401) throw new Error('Unauthorized: Please log in again.');
                        throw new Error('Failed to fetch user data.');
                    }
                    const result = await response.json();
                    const data = result.data || {};

                    // --- FIX 2: MAP UUIDs to FORM IDs ---
                    // Find the corresponding numeric ID from dropdown data using the UUID from user data.
                    const command = commandsData.find(c => c.commId === data.commId);
                    const department = departmentsData.find(d => d.deptId === data.deptId);
                    const station = stationsData.find(s => s.stnId === data.stnId);
                    
                    const formattedBod = data.bod ? new Date(data.bod).toISOString().split('T')[0] : '';
                    
                    // Set form data with the found numeric IDs. The roleId is already a UUID and should match directly.
                    setFormData(prev => ({ 
                        ...prev, 
                        ...data,
                        commId: command ? command.id : '',
                        deptId: department ? department.id : '',
                        stnId: station ? station.id : '',
                        roleId: data.roleId || '',
                        bod: formattedBod, 
                        password: '', 
                        confirmPassword: '' 
                    }));

                    if (data.photo) {
                        setImagePreview(data.photo);
                    }

                } catch (err: any) {
                    setError(err.message);
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        }
    // Dependency array now includes dropdown data to prevent race conditions.
    }, [id, commandsData, departmentsData, stationsData, rolesData]);


    // --- Event Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, photo: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isView && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        setLoading(true);
        setError(null);

        const payload: Record<string, any> = { ...formData };

        // 1. Find the selected objects from dropdown data using the numeric ID from the form
        const selectedCommand = commandsData.find(c => c.id == payload.commId);
        const selectedDepartment = departmentsData.find(d => d.id == payload.deptId);
        const selectedStation = stationsData.find(s => s.id == payload.stnId);

        // 2. Replace the numeric IDs with the correct UUIDs for the API
        payload.commId = selectedCommand ? selectedCommand.commId : null;
        payload.deptId = selectedDepartment ? selectedDepartment.deptId : null;
        payload.stnId = selectedStation ? selectedStation.stnId : null;
        // ถ้าเป็น create mode และไม่ได้เลือก ให้ส่ง null ไม่ใช่ empty string
        if (pageMode === 'Create') {
            if (!payload.commId) payload.commId = null;
            if (!payload.deptId) payload.deptId = null;
            if (!payload.stnId) payload.stnId = null;
        }
        
        // 3. Format other fields
        // bod: convert "YYYY-MM-DD" or "YYYY/MM/DD" to ISO format "YYYY-MM-DDT00:00:00Z"
        if (payload.bod && typeof payload.bod === "string") {
            // Normalize date string to YYYY-MM-DD
            let dateStr = payload.bod.replace(/\//g, "-");
            if (!dateStr.includes("T")) {
                payload.bod = `${dateStr}T00:00:00Z`;
            }
        }
        if (typeof payload.gender === "string") payload.gender = Number(payload.gender);
        if (typeof payload.userType === "string") payload.userType = Number(payload.userType);
        if (typeof payload.displayName === "string") payload.displayName = payload.displayName.trim();
        
        // 4. Handle password
        if (isEdit && (!payload.password || payload.password === "")) {
            delete payload.password;
        }
        delete payload.confirmPassword;

        // 5. Handle photo upload
        if (payload.photo instanceof File) {
            try {
                payload.photo = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(payload.photo as File);
                });
            } catch (err) {
                setError("Failed to read image file.");
                setLoading(false);
                return;
            }
        }

        // Remove extra fields for create mode
        if (pageMode === 'Create') {
            // Only keep fields that are required by the API (ไม่ต้องมี orgId)
            const allowedFields = [
                'activationToken', 'active', 'address', 'blood', 'bod', 'citizenId', 'commId', 'deptId', 'displayName', 'email', 'empId', 'firstName', 'gender', 'islogin', 'lastActivationRequest', 'lastLogin', 'lastName', 'lostPasswordRequest', 'middleName', 'mobileNo', 'password', 'photo', 'roleId', 'signupStamp', 'stnId', 'title', 'userType', 'username'
            ];
            Object.keys(payload).forEach(key => {
                if (!allowedFields.includes(key)) {
                    delete payload[key];
                }
            });
            // Remove orgId if present
            if ('orgId' in payload) {
                delete payload.orgId;
            }
        }

        // Do NOT set orgId from localStorage profile for create mode
        // orgId will not be sent in payload

        // --- API Call ---
        try {
            const endpoint = isEdit 
                ? `${API_BASE_URL}/api/v1/users/${id}` 
                : `${API_BASE_URL}/api/v1/users/add`;
            const method = isEdit ? 'PATCH' : 'POST';

            // Set timeout for API call (30s)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            let response;
            try {
                response = await apiFetch(endpoint, {
                    method,
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeoutId);
            }

            if (!response || !response.ok) {
                const errorData = response ? await response.json().catch(() => ({ message: 'An unknown API error occurred.' })) : { message: 'API call timed out.' };
                if (response && response.status === 401) throw new Error('Unauthorized: Your session may have expired.');
                throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} user.`);
            }

            navigate('/users');
 if (fromProfile) {
                navigate('/profile');
            } else {
                navigate('/users');
            }

        } catch (err: any) {
            setError(err.message);
            console.error("Submission failed:", err);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Reusable class strings ---
    const labelClasses = "block text-sm font-medium text-gray-600 dark:text-gray-300";
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-800";
    
    // รอ dropdown data และ user data โหลดครบก่อนแสดงผล
    const allDropdownsLoaded = commandsData.length > 0 && departmentsData.length > 0 && stationsData.length > 0 && rolesData.length > 0;
    const userLoaded = !id || (id && !loading);
    if (!allDropdownsLoaded || !userLoaded) {
        return <div className="text-center p-10">Loading user data...</div>;
    }

    return (
        <div className="w-full">
            <PageBreadcrumb
                pageTitle={`${pageMode} User`}
                items={fromProfile
                    ? [
                        { label: "Home", href: "/" },
                        { label: "Profile", href: "/profile" },
                        { label: pageMode }
                    ]
                    : [
                        { label: "Home", href: "/" },
                        { label: "User Management", href: "/users" },
                        { label: pageMode }
                    ]
                }
            />
            
            <form onSubmit={handleSubmit} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md text-center">
                            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Profile Photo</h3>
                            <div className="relative w-40 h-40 mx-auto mb-4">
                                {imagePreview ? 
                                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full rounded-full object-cover"/> 
                                    : <UserCircleIcon className="w-full h-full text-gray-300 dark:text-gray-700" />
                                }
                            
                                {!isView && (
                                    <label htmlFor="photo-upload" className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full cursor-pointer transition-opacity duration-300 opacity-0 hover:opacity-100">
                                        <div className="text-center">
                                            <CameraIcon className="w-8 h-8 text-white mx-auto" />
                                            <span className="text-xs text-white">Change Photo</span>
                                        </div>
                                    </label>
                                )}
                            </div>
                            <input id="photo-upload" type="file" name="photo" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isView} />
                            {!isView && <p className="text-xs text-gray-500 dark:text-gray-400">Allowed: JPG, PNG, GIF</p>}
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
                             <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">Organizational Info</h3>
                             <div className="space-y-4">
                                 <div>
                                     <label htmlFor="commId" className={labelClasses}>Command <span className="text-red-500">*</span></label>
                                     <select id="commId" name="commId" value={formData.commId} onChange={handleInputChange} className={inputClasses} required disabled={isView}>
                                         <option value="">-- Select Command --</option>
                                         {commandsData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label htmlFor="stnId" className={labelClasses}>Station <span className="text-red-500">*</span></label>
                                      <select id="stnId" name="stnId" value={formData.stnId} onChange={handleInputChange} className={inputClasses} required disabled={isView}>
                                         <option value="">-- Select Station --</option>
                                         {stationsData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label htmlFor="deptId" className={labelClasses}>Department <span className="text-red-500">*</span></label>
                                     <select id="deptId" name="deptId" value={formData.deptId} onChange={handleInputChange} className={inputClasses} required disabled={isView}>
                                         <option value="">-- Select Department --</option>
                                         {departmentsData.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label htmlFor="roleId" className={labelClasses}>Role <span className="text-red-500">*</span></label>
                                     <select id="roleId" name="roleId" value={formData.roleId} onChange={handleInputChange} className={inputClasses} required disabled={isView}>
                                         <option value="">-- Select Role --</option>
                                         {rolesData.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                     </select>
                                 </div>
                             </div>
                        </div>
                        {id && (
                        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
                            <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">Record Timestamps</h3>
                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                <p><strong>Created At:</strong> {formatDateTime(formData.createdAt)}</p>
                                <p><strong>Updated At:</strong> {formatDateTime(formData.updatedAt)}</p>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* === Right Column: Main User Details === */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
                            <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">Account & Login</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div>
                                    <label htmlFor="username" className={labelClasses}>Username <span className="text-red-500">*</span></label>
                                    <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} className={inputClasses} required disabled={isEdit || isView} maxLength={25} />
                                </div>
                                <div>
                                    <label htmlFor="displayName" className={labelClasses}>Display Name</label>
                                    <input type="text" id="displayName" name="displayName" value={formData.displayName} onChange={handleInputChange} className={inputClasses} placeholder="e.g., John D." disabled={isView} maxLength={25} />
                                </div>
                                
                                {/* Password fields only show in Create mode */}
                                {pageMode === 'Create' && (
                                    <>
                                        <div>
                                            <label htmlFor="password" className={labelClasses}>Password <span className="text-red-500">*</span></label>
                                            <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} className={inputClasses} required maxLength={30} />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password <span className="text-red-500">*</span></label>
                                            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={inputClasses} required maxLength={30} />
                                        </div>
                                    </>
                                )}
                                {/* Edit mode: do not show password fields */}
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
                             <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">Personal Details</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                                 <div className="md:col-span-1">
                                     <label htmlFor="title" className={labelClasses}>Title</label>
                                     <select id="title" name="title" value={formData.title} onChange={handleInputChange} className={inputClasses} disabled={isView}>
                                         <option>Mr.</option><option>Mrs.</option><option>Ms.</option>
                                     </select>
                                 </div>
                                 <div className="md:col-span-2">
                                     <label htmlFor="firstName" className={labelClasses}>First Name <span className="text-red-500">*</span></label>
                                     <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClasses} required disabled={isView} maxLength={25} />
                                 </div>
                                 <div>
                                     <label htmlFor="middleName" className={labelClasses}>Middle Name</label>
                                     <input type="text" id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} className={inputClasses} disabled={isView} maxLength={25} />
                                 </div>
                                 <div className="md:col-span-2">
                                     <label htmlFor="lastName" className={labelClasses}>Last Name <span className="text-red-500">*</span></label>
                                     <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClasses} required disabled={isView} maxLength={25} />
                                 </div>
                                 <div className="md:col-span-3">
                                     <label htmlFor="email" className={labelClasses}>Email <span className="text-red-500">*</span></label>
                                     <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} required disabled={isView} maxLength={35} />
                                 </div>
                                 <div>
                                     <label htmlFor="mobileNo" className={labelClasses}>Mobile No.</label>
                                     <input type="tel" id="mobileNo" name="mobileNo" value={formData.mobileNo} onChange={e => {
                                        // Only allow digits
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        setFormData(prev => ({ ...prev, mobileNo: val }));
                                    }} className={inputClasses} disabled={isView} maxLength={10} pattern="[0-9]*" />
                                 </div>
                                 <div>
                                     <label htmlFor="citizenId" className={labelClasses}>Citizen ID</label>
                                     <input type="text" id="citizenId" name="citizenId" value={formData.citizenId} onChange={e => {
                                        // Only allow digits
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        setFormData(prev => ({ ...prev, citizenId: val }));
                                    }} className={inputClasses} disabled={isView} maxLength={13} pattern="[0-9]*" />
                                 </div>
                                 <div>
                                     <label htmlFor="bod" className={labelClasses}>Date of Birth</label>
                                     <input type="date" id="bod" name="bod" value={formData.bod}
                                        onFocus={e => {
                                            const input = e.target as HTMLInputElement & { showPicker?: () => void };
                                            if (input.showPicker) input.showPicker();
                                        }}
                                        onClick={e => {
                                            const input = e.target as HTMLInputElement & { showPicker?: () => void };
                                            if (input.showPicker) input.showPicker();
                                        }}
                                        onChange={e => {
                                            const val = e.target.value;
                                            // Validate year: only 4 digits, not more than 90 years ago
                                            const parts = val.split("-");
                                            const year = parseInt(parts[0], 10);
                                            const currentYear = new Date().getFullYear();
                                            if (parts[0] && parts[0].length === 4 && (year < currentYear - 90 || year > currentYear)) return;
                                            setFormData(prev => ({ ...prev, bod: val }));
                                        }}
                                        className={inputClasses} disabled={isView} maxLength={10} />
                                 </div>
                                 <div>
                                     <label htmlFor="gender" className={labelClasses}>Gender</label>
                                     <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className={inputClasses} disabled={isView}>
                                         <option value={0}>Male</option><option value={1}>Female</option><option value={2}>Other</option>
                                     </select>
                                 </div>
                                 <div>
                                     <label htmlFor="blood" className={labelClasses}>Blood Group</label>
                                     <select id="blood" name="blood" value={formData.blood} onChange={handleInputChange} className={inputClasses} disabled={isView}>
                                         <option>A</option><option>B</option><option>AB</option><option>O</option>
                                     </select>
                                 </div>
                                 <div className="md:col-span-3">
                                     <label htmlFor="address" className={labelClasses}>Address</label>
                                     <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows={3} className={inputClasses} placeholder="Enter full address" disabled={isView} maxLength={250}></textarea>
                                 </div>
                             </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-500 text-right col-span-full">{error}</p>}
                        
                        <div className="flex justify-end gap-3 pt-4">
                            {isView ? (
                                <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors">Back</button>
                            ) : (
                                <>
                                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">{loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create User')}</button>
                                    <button 
        type="button" 
        onClick={() => fromProfile ? navigate('/profile') : navigate(-1)} 
        className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
    >
        Cancel
    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserCreateEdit;