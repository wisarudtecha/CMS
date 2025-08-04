import React, { useState, useEffect, useMemo } from "react";
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
    createdBy?: string;
    updatedBy?: string;
    [key: string]: any;
}

interface OrgStructureItem {
    id: string;
    orgId: string;
    deptId: string;
    commId: string;
    stnId: string;
    stationEn: string;
    stationTh: string;
    stationActive: boolean;
    commandEn: string;
    commandTh: string;
    commandActive: boolean;
    deptEn: string;
    deptTh: string;
    deptActive: boolean;
}

interface DropdownOption {
    id: string;
    name: string;
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
    return `${yyyy}/${mm}/${dd}, ${hh}:${min}`;
};

const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // In a real app, the token would be retrieved securely.
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

const getCurrentLanguage = () => 'en'; // Can be switched to 'th'

// --- SVG Icons (Moved Outside Component) ---
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg> );
const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" /><path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.342 1.374a3.026 3.026 0 01.64 2.278V17.25a3.026 3.026 0 01-.64 2.278 2.993 2.993 0 01-2.342 1.374 49.52 49.52 0 01-5.312 0 2.993 2.993 0 01-2.342-1.374 3.026 3.026 0 01-.64-2.278V6.723a3.026 3.026 0 01.64-2.278 2.993 2.993 0 012.342-1.374zM12 18a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" /></svg> );


const UserForm: React.FC = () => {
    // --- Hooks ---
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    // --- State ---
    const [formData, setFormData] = useState<UserFormData>({
        active: true, address: '', blood: '', bod: '', citizenId: '', commId: '', deptId: '',
        displayName: '', email: '', empId: '', firstName: '', gender: '', lastName: '',
        middleName: '', mobileNo: '', orgId: '', password: '', confirmPassword: '', photo: null,
        roleId: '', stnId: '', title: '', userType: '', username: '',
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Start loading initially
    const [error, setError] = useState<string | null>(null);
    const [fromProfile, setFromProfile] = useState(false);

    // NEW: State for organizational data and dropdown options
    const [rolesData, setRolesData] = useState<DropdownOption[]>([]);
    const [orgStructureData, setOrgStructureData] = useState<OrgStructureItem[]>([]);

    // --- Derived State ---
    const isEdit = Boolean(id && location.pathname.includes('/edit'));
    const isView = Boolean(id && !isEdit);
    const pageMode = isView ? 'View' : isEdit ? 'Edit' : 'Create';
    const lang = getCurrentLanguage();

    // --- Memoized Dropdown Options for performance ---
    const departmentOptions = useMemo(() => {
        const departments = orgStructureData.map(item => ({
            id: item.deptId,
            name: lang === 'th' ? item.deptTh : item.deptEn
        }));
        // Return unique departments by ID
        return [...new Map(departments.map(item => [item.id, item])).values()];
    }, [orgStructureData, lang]);

    const commandOptions = useMemo(() => {
        if (!formData.deptId) return [];
        const commands = orgStructureData
            .filter(item => item.deptId === formData.deptId)
            .map(item => ({
                id: item.commId,
                name: lang === 'th' ? item.commandTh : item.commandEn
            }));
        // Return unique commands for the selected department
        return [...new Map(commands.map(item => [item.id, item])).values()];
    }, [orgStructureData, formData.deptId, lang]);

    const stationOptions = useMemo(() => {
        if (!formData.commId) return [];
        const stations = orgStructureData
            .filter(item => item.commId === formData.commId)
            .map(item => ({
                id: item.stnId,
                name: lang === 'th' ? item.stationTh : item.stationEn
            }));
        // Return unique stations for the selected command
        return [...new Map(stations.map(item => [item.id, item])).values()];
    }, [orgStructureData, formData.commId, lang]);


    // --- Effects ---
    // Check if coming from profile page
    useEffect(() => {
        setFromProfile(location.state?.from === 'profile');
    }, [location.state]);

    // Fetch all initial data (roles and organizational structure)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoints = [
                    '/role?start=0&length=100',
                    '/department_command_stations'
                ];
                const responses = await Promise.all(endpoints.map(ep => apiFetch(API_BASE_URL + ep)));
                const results = await Promise.all(responses.map(res => {
                    if (!res.ok) throw new Error(`Failed to fetch from ${res.url}`);
                    return res.json();
                }));

                // Set Roles Data
                setRolesData((results[0].data || []).map((r: any) => ({ id: r.id, name: r[lang] ?? r.roleName })));
                
                // Set Organizational Structure Data
                setOrgStructureData(results[1].data || []);

            } catch (err: any) {
                console.error("Failed to fetch initial data:", err);
                setError("Could not load required organizational data. Please try again.");
            } finally {
                // Loading will be set to false in the user data fetch effect if needed,
                // or here if we are in create mode.
                if (!id) {
                    setLoading(false);
                }
            }
        };
        fetchInitialData();
    }, [id, lang]); // Rerun if ID changes (e.g., navigating between create/edit)

    // Fetch User Data for Edit/View Mode (depends on org data being loaded first)
    useEffect(() => {
        // Only run if we have an ID and the organizational data has been loaded.
        if (id && orgStructureData.length > 0) {
            const fetchUserData = async () => {
                // No need to set loading true here, it's handled by the initial fetch
                try {
                    const response = await apiFetch(`${API_BASE_URL}/users/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data.');
                    }
                    const result = await response.json();
                    const data = result.data || {};

                    const formattedBod = data.bod ? new Date(data.bod).toISOString().split('T')[0] : '';
                    
                    // Directly set form data with UUIDs from the API response
                    setFormData(prev => ({ 
                        ...prev, 
                        ...data,
                        // IDs are already the correct UUIDs, no mapping needed
                        commId: data.commId || '',
                        deptId: data.deptId || '',
                        stnId: data.stnId || '',
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
                    console.error("Error fetching user data:", err);
                } finally {
                    setLoading(false); // Final loading state update
                }
            };
            fetchUserData();
        }
    }, [id, orgStructureData]); // Dependency array ensures this runs after org data is ready


    // --- Event Handlers ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // When a parent dropdown changes, reset the children's values
            if (name === 'deptId') {
                newState.commId = '';
                newState.stnId = '';
            }
            if (name === 'commId') {
                newState.stnId = '';
            }
            return newState;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, photo: file }));
            // Create a temporary URL for preview
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

        // Create a mutable copy of form data for submission
        const payload: Record<string, any> = { ...formData };

        // IDs are already UUIDs, so no mapping is needed.
        // Handle null values for create mode if a selection is empty
        if (pageMode === 'Create') {
            if (!payload.commId) payload.commId = null;
            if (!payload.deptId) payload.deptId = null;
            if (!payload.stnId) payload.stnId = null;
        }
        
        // Format other fields for the API
        if (typeof payload.bod === "string") {
            if (!payload.bod) {
                payload.bod = null;
            } else {
                let dateStr = payload.bod.replace(/\//g, "-");
                if (!dateStr.includes("T")) {
                    payload.bod = `${dateStr}T00:00:00Z`;
                }
            }
        }
        if (typeof payload.gender === "string" && payload.gender !== '') payload.gender = Number(payload.gender);
        if (typeof payload.userType === "string" && payload.userType !== '') payload.userType = Number(payload.userType);
        
        // Do not send password if it's empty during an edit
        if (isEdit && (!payload.password || payload.password === "")) {
            delete payload.password;
        }
        delete payload.confirmPassword; // Always remove confirmPassword

        // Handle file upload by converting image to base64
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

        // --- API Call ---
        try {
            const endpoint = isEdit 
                ? `${API_BASE_URL}/users/${id}` 
                : `${API_BASE_URL}/users/add`;
            const method = isEdit ? 'PATCH' : 'POST';

            const response = await apiFetch(endpoint, {
                method,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
                throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} user.`);
            }

            // Navigate on success
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
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-800 text-gray-900 dark:text-white";
    
    if (loading) {
        return <div className="flex justify-center items-center h-64 text-lg">Loading user data...</div>;
    }

    return (
       <div className="container mx-auto px-4  sm:px-6 lg:px-8 py-8">
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
                    {/* Left Column: Photo and Org Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md text-center">
                            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Profile Photo</h3>
                            <div className="relative w-40 h-40 mx-auto mb-4">
                                {imagePreview ? 
                                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"/> 
                                    : <UserCircleIcon className="w-full h-full text-gray-300 dark:text-gray-700" />
                                }
                                {!isView && (
                                    <label htmlFor="photo-upload" className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full cursor-pointer transition-opacity duration-300 opacity-0 hover:opacity-100">
                                        <div className="text-center">
                                            <CameraIcon className="w-8 h-8 text-white mx-auto" />
                                            <span className="text-xs text-white mt-1">Change Photo</span>
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
                                     <label htmlFor="deptId" className={labelClasses}>Department <span className="text-red-500">*</span></label>
                                     <select id="deptId" name="deptId" value={formData.deptId} onChange={handleInputChange} className={inputClasses} required disabled={isView}>
                                         <option value="">-- Select Department --</option>
                                         {departmentOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                     </select>
                                 </div>
                                  <div>
                                     <label htmlFor="commId" className={labelClasses}>Command <span className="text-red-500">*</span></label>
                                     <select id="commId" name="commId" value={formData.commId} onChange={handleInputChange} className={inputClasses} required disabled={isView || !formData.deptId}>
                                         <option value="">-- Select Command --</option>
                                         {commandOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label htmlFor="stnId" className={labelClasses}>Station <span className="text-red-500">*</span></label>
                                      <select id="stnId" name="stnId" value={formData.stnId} onChange={handleInputChange} className={inputClasses} required disabled={isView || !formData.commId}>
                                         <option value="">-- Select Station --</option>
                                         {stationOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                                    <p><strong>Create:</strong> {formatDateTime(formData.createdAt)} {formData.createdBy ? ` By ${formData.createdBy}` : ''}</p>
                                    <p><strong>Update:</strong> {formatDateTime(formData.updatedAt)} {formData.updatedBy ? ` By ${formData.updatedBy}` : ''}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Account and Personal Details */}
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
                                 {pageMode === 'Create' ? (
                                     <>
                                         <div>
                                             <label htmlFor="password" className={labelClasses}>Password <span className="text-red-500">*</span></label>
                                             <input type="password" id="password" name="password" value={formData.password || ''} onChange={handleInputChange} className={inputClasses} required minLength={8} maxLength={30} autoComplete="new-password" />
                                             <span className="text-xs text-gray-500 dark:text-gray-300">Password must be at least 8 characters.</span>
                                         </div>
                                         <div>
                                             <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password <span className="text-red-500">*</span></label>
                                             <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword || ''} onChange={handleInputChange} className={inputClasses} required minLength={8} maxLength={30} autoComplete="new-password" />
                                         </div>
                                     </>
                                 ) : (
                                     <div className="md:col-span-2">
                                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Password can be changed from the user's profile page after creation.</p>
                                     </div>
                                 )}
                             </div>
                        </div>
                        
                        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
                            <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                                <div className="md:col-span-1">
                                    <label htmlFor="title" className={labelClasses}>Title</label>
                                    <select id="title" name="title" value={formData.title} onChange={handleInputChange} className={inputClasses} disabled={isView}>
                                        <option value="">Select Title</option>
                                        <option>Mr.</option><option>Mrs.</option><option>Ms.</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="firstName" className={labelClasses}>First Name <span className="text-red-500">*</span></label>
                                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClasses} required disabled={isView} maxLength={50} />
                                </div>
                                <div>
                                    <label htmlFor="middleName" className={labelClasses}>Middle Name</label>
                                    <input type="text" id="middleName" name="middleName" value={formData.middleName} onChange={handleInputChange} className={inputClasses} disabled={isView} maxLength={50} />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="lastName" className={labelClasses}>Last Name <span className="text-red-500">*</span></label>
                                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClasses} required disabled={isView} maxLength={50} />
                                </div>
                                <div className="md:col-span-3">
                                    <label htmlFor="email" className={labelClasses}>Email <span className="text-red-500">*</span></label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClasses} required disabled={isView} maxLength={100} />
                                </div>
                                <div>
                                    <label htmlFor="mobileNo" className={labelClasses}>Mobile No.</label>
                                    <input type="tel" id="mobileNo" name="mobileNo" value={formData.mobileNo} onChange={e => setFormData(prev => ({ ...prev, mobileNo: e.target.value.replace(/[^0-9]/g, "") }))} className={inputClasses} disabled={isView} maxLength={10} pattern="[0-9]*" />
                                </div>
                                <div>
                                    <label htmlFor="citizenId" className={labelClasses}>Citizen ID</label>
                                    <input type="text" id="citizenId" name="citizenId" value={formData.citizenId} onChange={e => setFormData(prev => ({ ...prev, citizenId: e.target.value.replace(/[^0-9]/g, "") }))} className={inputClasses} disabled={isView} maxLength={13} pattern="[0-9]*" />
                                </div>
                                <div>
                                    <label htmlFor="bod" className={labelClasses}>Date of Birth</label>
                                    <input type="date" id="bod" name="bod" value={formData.bod} onChange={e => setFormData(prev => ({ ...prev, bod: e.target.value }))} className={inputClasses} disabled={isView} />
                                </div>
                                <div>
                                    <label htmlFor="gender" className={labelClasses}>Gender</label>
                                    <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className={inputClasses} disabled={isView}>
                                        <option value="">Select Gender</option>
                                        <option value={0}>Male</option><option value={1}>Female</option><option value={2}>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="blood" className={labelClasses}>Blood Group</label>
                                    <select id="blood" name="blood" value={formData.blood} onChange={handleInputChange} className={inputClasses} disabled={isView}>
                                        <option value="">Select Blood Group</option>
                                        <option>A</option><option>B</option><option>AB</option><option>O</option>
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <label htmlFor="address" className={labelClasses}>Address</label>
                                    <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows={3} className={inputClasses} placeholder="Enter full address" disabled={isView} maxLength={250}></textarea>
                                </div>
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-center lg:col-span-2">{error}</p>}
                        
                        <div className="flex justify-end gap-3 pt-4">
                            {isView ? (
                                <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors">Back</button>
                            ) : (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => fromProfile ? navigate('/profile') : navigate(-1)} 
                                        className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">
                                        {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create User')}
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

export default UserForm;
