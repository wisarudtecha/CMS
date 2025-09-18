// /src/pages/Admin/UserForm.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getTranslations, Language, loadTranslations } from "@/config/i18n";
import { DropdownOption } from "@/types";
import { OrgStructureItem } from "@/types/organization";
import { UserFormData } from "@/types/user";
import { APP_CONFIG } from "@/utils/constants";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Toast from "@/components/toast/Toast";

/* ---------------- i18n helpers ---------------- */
const getCurrentLanguage = (): Language => {
  const lang = localStorage.getItem("language");
  return (lang === "th" || lang === "en" ? lang : "en") as Language;
};

const getByPath = (
  // obj: any,
  obj: Record<string, unknown>,
  path: string
): string | undefined => {
  if (!obj) return undefined;
  const parts = path.split(".");
  // let cur: any = obj;
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      // cur = cur[p];
      cur = (cur as Record<string, unknown>)[p];
    }
    else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
};

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  // const [trs, setTrs] = useState<any>({});
  const [trs, setTrs] = useState<Record<string, unknown>>({});

  const tt = useCallback(
    (key: string) => getByPath(trs, key) ?? key,
    [trs]
  );

  const [formData, setFormData] = useState<UserFormData>({
    active: true,
    address: "",
    blood: "",
    bod: "",
    citizenId: "",
    commId: "",
    deptId: "",
    displayName: "",
    email: "",
    empId: "",
    firstName: "",
    gender: null,
    lastName: "",
    middleName: "",
    mobileNo: "",
    orgId: "",
    password: "",
    confirmPassword: "",
    photo: null,
    roleId: "",
    stnId: "",
    title: "",
    userType: 1,
    username: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fromProfile, setFromProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track form submission state

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Formatted display values
  const [mobileDisplay, setMobileDisplay] = useState("");
  const [citizenIdDisplay, setCitizenIdDisplay] = useState("");

  const [rolesData, setRolesData] = useState<DropdownOption[]>([]);
  const [orgStructureData, setOrgStructureData] = useState<OrgStructureItem[]>([]);

  const isEdit = Boolean(id && location.pathname.includes("/edit"));
  const isView = Boolean(id && !isEdit);
  const pageMode = isView ? "View" : isEdit ? "Edit" : "Create";

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "language") setLang(getCurrentLanguage());
    };
    window.addEventListener("storage", onStorage);
    setLang(getCurrentLanguage());

    const langCheckInterval = setInterval(() => {
      const currentLang = getCurrentLanguage();
      if (currentLang !== lang) {
        setLang(currentLang);
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(langCheckInterval);
    };
  }, [lang]);

  useEffect(() => {
    (async () => {
      await loadTranslations(lang);
      // setTrs(getTranslations(lang) as any);
      setTrs(getTranslations(lang) as Record<string, unknown>);
    })();
  }, [lang]);

  useEffect(() => {
    setFromProfile(location.state?.from === "profile");
    
    // Check for toast message from navigation state
    if (location.state?.toast) {
      setToast({
        message: location.state.toast.message,
        type: location.state.toast.type
      });
      
      // Clear the navigation state to prevent toast from showing again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  /* Helpers */
  const formatDateTime = (isoString: string | undefined): string => {
    if (!isoString) return tt("userform.na");
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}, ${hh}:${min}`;
  };

  const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem("access_token");
    const headers = new Headers(options.headers);
    if (token) headers.append("Authorization", `Bearer ${token}`);
    if (!(options.body instanceof FormData)) {
      if (!headers.has("Content-Type")) headers.append("Content-Type", "application/json");
    }
    const newOptions: RequestInit = { ...options, headers };
    return fetch(url, newOptions);
  };

  const formatMobileDisplay = (digits: string): string => {
    const d = (digits || "").replace(/\D/g, "").slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  };
  
  const formatCitizenIdDisplay = (digits: string): string => {
    const d = (digits || "").replace(/\D/g, "").slice(0, 13);
    const parts = [d.slice(0, 1), d.slice(1, 5), d.slice(5, 10), d.slice(10, 12), d.slice(12, 13)].filter(Boolean);
    return parts.join("-");
  };

  /* Auto-format functions for input */
  const handleMobileChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, mobileNo: digits })); // Store only digits
    setMobileDisplay(formatMobileDisplay(digits)); // Update display
  };

  const handleCitizenIdChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    setFormData((prev) => ({ ...prev, citizenId: digits })); // Store only digits  
    setCitizenIdDisplay(formatCitizenIdDisplay(digits)); // Update display
  };

  // Sync display values when formData changes
  useEffect(() => {
    setMobileDisplay(formatMobileDisplay(formData.mobileNo));
    setCitizenIdDisplay(formatCitizenIdDisplay(formData.citizenId));
  }, [formData.mobileNo, formData.citizenId]);

  const getDateLimits = () => {
    const today = new Date();
    const maxDate = today;
    const minDate = new Date(today.getFullYear() - 115, today.getMonth(), today.getDate());
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

  /* Validation functions */
  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasUppercase && hasSpecialChar;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string): boolean => {
    return /^\d{10}$/.test(mobile);
  };

  const validateCitizenId = (citizenId: string): boolean => {
    return /^\d{13}$/.test(citizenId);
  };

  /* ---------------- Icons ---------------- */
  const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        clipRule="evenodd"
      />
    </svg>
  );
  const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
      <path
        fillRule="evenodd"
        d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.342 1.374a3.026 3.026 0 01.64 2.278V17.25a3.026 3.026 0 01-.64 2.278 2.993 2.993 0 01-2.342 1.374 49.52 49.52 0 01-5.312 0 2.993 2.993 0 01-2.342-1.374 3.026 3.026 0 01-.64-2.278V6.723a3.026 3.026 0 01.64-2.278 2.993 2.993 0 012.342-1.374zM12 18a6 6 0 100-12 6 6 0 000 12z"
        clipRule="evenodd"
      />
    </svg>
  );
  const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
    </svg>
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoints = ["/role?start=0&length=100", "/department_command_stations"];
        const responses = await Promise.all(endpoints.map((ep) => apiFetch(APP_CONFIG.API_BASE_URL + ep)));
        const results = await Promise.all(
          responses.map((res) => {
            if (!res.ok) throw new Error(`Failed to fetch from ${res.url}`);
            return res.json();
          })
        );
        setRolesData(
          (results[0].data || []).map((
            // r: any
            r: { id: string; th?: string; en?: string; roleName: string }
          ) => ({
            id: r.id,
            name: lang === "th" ? r.th ?? r.roleName : r.en ?? r.roleName,
          }))
        );
        setOrgStructureData(results[1].data || []);
      }
      catch (
        // err: any
        err: unknown
      ) {
        console.error("Failed to fetch initial data:", err);
        setError(tt("errors.loadOrgData"));
      }
      finally {
        if (!id) setLoading(false);
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  useEffect(() => {
    if (id && orgStructureData.length > 0 && !isSubmitting) {
      const fetchUserData = async () => {
        try {
          const response = await apiFetch(`${APP_CONFIG.API_BASE_URL}/users/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user data.");
          }
          const result = await response.json();
          const data = result.data || {};
          const formattedBod = data.bod ? new Date(data.bod).toISOString().split("T")[0] : "";
          setFormData((prev) => ({
            ...prev,
            ...data,
            commId: data.commId || "",
            deptId: data.deptId || "",
            stnId: data.stnId || "",
            roleId: data.roleId || "",
            bod: formattedBod,
            password: "",
            confirmPassword: "",
          }));
          if (data.photo) setImagePreview(data.photo);
        }
        catch (
          // err: any
          err: unknown
        ) {
          setError(tt("errors.fetchUserFailed"));
          console.error("Error fetching user data:", err);
        }
        finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, orgStructureData, isSubmitting]);

  /* dropdown options */
  const departmentOptions = useMemo(() => {
    const departments = orgStructureData.map((item) => ({
      id: item.deptId,
      name: lang === "th" ? item.deptTh : item.deptEn,
    }));
    return [...new Map(departments.map((item) => [item.id, item])).values()];
  }, [orgStructureData, lang]);

  const commandOptions = useMemo(() => {
    if (!formData.deptId) return [];
    const commands = orgStructureData
      .filter((item) => item.deptId === formData.deptId)
      .map((item) => ({
        id: item.commId,
        name: lang === "th" ? item.commandTh : item.commandEn,
      }));
    return [...new Map(commands.map((item) => [item.id, item])).values()];
  }, [orgStructureData, formData.deptId, lang]);

  const stationOptions = useMemo(() => {
    if (!formData.commId) return [];
    const stations = orgStructureData
      .filter((item) => item.commId === formData.commId)
      .map((item) => ({
        id: item.stnId,
        name: lang === "th" ? item.stationTh : item.stationEn,
      }));
    return [...new Map(stations.map((item) => [item.id, item])).values()];
  }, [orgStructureData, formData.commId, lang]);

  /* handlers */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // const newState: any = { ...prev, [name]: value };
      const newState: UserFormData = { ...prev, [name]: value };
      
      if (name === "gender") {
        newState.gender = value === "" ? null : Number(value);
      }
      if (name === "deptId") {
        newState.commId = "";
        newState.stnId = "";
      }
      if (name === "commId") {
        newState.stnId = "";
      }
      return newState;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, photo: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle date picker click
  const handleDatePickerClick = () => {
    const dateInput = document.getElementById('bod') as HTMLInputElement;
    if (dateInput) {
      // Temporarily make it not readonly to allow picker
      dateInput.readOnly = false;
      dateInput.showPicker();
      setIsDatePickerOpen(true);
      // Make it readonly again after a short delay
      setTimeout(() => {
        dateInput.readOnly = true;
        setIsDatePickerOpen(false);
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!isView && formData.password !== formData.confirmPassword) {
      setError(tt("errors.passwordsMismatch"));
      setToast({
        message: tt("errors.passwordsMismatch"),
        type: "error"
      });
      return;
    }

    // Password validation for Create mode
    if (pageMode === "Create" && formData.password && !validatePassword(formData.password)) {
      const errorMessage = tt("errors.invalidPassword");
      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: "error"
      });
      return;
    }

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      const errorMessage = tt("errors.invalidEmail");
      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: "error"
      });
      return;
    }

    // Mobile validation
    if (formData.mobileNo && !validateMobile(formData.mobileNo)) {
      const errorMessage = tt("errors.invalidMobile");
      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: "error"
      });
      return;
    }

    // Citizen ID validation
    if (formData.citizenId && !validateCitizenId(formData.citizenId)) {
      const errorMessage = tt("errors.invalidCitizenId");
      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: "error"
      });
      return;
    }

    setLoading(true);
    setIsSubmitting(true); // Set submitting state to prevent refetch
    setError(null);

    // const payload: Record<string, any> = { ...formData };
    const payload: Record<string, unknown> = { ...formData };

    if (pageMode === "Create") {
      if (!payload.commId) payload.commId = null;
      if (!payload.deptId) payload.deptId = null;
      if (!payload.stnId) payload.stnId = null;
    }
    if (typeof payload.bod === "string") {
      if (!payload.bod) {
        payload.bod = null;
      }
      else {
        // let dateStr = payload.bod.replace(/\//g, "-");
        const dateStr = payload.bod.replace(/\//g, "-");
        if (!dateStr.includes("T")) payload.bod = `${dateStr}T00:00:00Z`;
      }
    }
    if (typeof payload.gender === "string" && payload.gender !== "") payload.gender = Number(payload.gender);
    if (payload.gender === null || payload.gender === "") payload.gender = null;
    if (typeof payload.userType === "string" && payload.userType !== "") payload.userType = Number(payload.userType);

    if (isEdit) {
      if (!payload.password || 
          payload.password === "" || 
          // payload.password.trim() === "" ||
          (typeof payload.password === 'string' && payload.password.trim() === "") ||
          payload.password === undefined ||
          payload.password === null) {
        delete payload.password;
      }
    }
    delete payload.confirmPassword;

    if (payload.photo instanceof File) {
      try {
        payload.photo = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(payload.photo as File);
        });
      }
      catch {
        const errorMessage = tt("errors.readImageFailed");
        setError(errorMessage);
        setToast({
          message: errorMessage,
          type: "error"
        });
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isEdit ? `${APP_CONFIG.API_BASE_URL}/users/${id}` : `${APP_CONFIG.API_BASE_URL}/users/add`;
      const method = isEdit ? "PATCH" : "POST";
      const response = await apiFetch(endpoint, { method, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: tt("errors.unknownApi") }));
        throw new Error(errorData.message || `Failed to ${isEdit ? "update" : "create"} user.`);
      }
      
      // Prepare success message for navigation
      const successMessage = isEdit ? tt("userform.updateSuccess") || "User updated successfully!" : tt("userform.createSuccess") || "User created successfully!";
      
      // Navigate to /users page immediately with toast message - no setLoading(false) needed
      navigate("/users", {
        state: { 
          toast: {
            message: successMessage,
            type: "success"
          }
        }
      });
      
      // Return early to prevent any further execution
      return;
      
    }
    catch (
      // err: any
      err: unknown
    ) {
      let errorMessage = tt("errors.submitFailed") || "Submit failed!";
      if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
        errorMessage = (err as { message: string }).message;
      }

      // const errorMessage = err.message || tt("errors.submitFailed") || "Submit failed!";
      setError(errorMessage);
      setToast({
        message: errorMessage,
        type: "error"
      });
      console.error("Submission failed:", err);
      setLoading(false); // Only set loading false on error
      setIsSubmitting(false); // Reset submitting state on error
    }
  };

  /* UI classes */
  const labelClasses = "block text-sm font-medium text-gray-600 dark:text-gray-300";
  const inputClasses =
    "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-800 text-gray-900 dark:text-white";

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-lg">
        {tt("userform.loadingUserData")}
      </div>
    );

  if (isView) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageBreadcrumb
          pageTitle={tt("userform.view")}
          items={
            fromProfile
              ? [
                  { label: tt("userform.home"), href: "/" },
                  { label: tt("userform.profile"), href: "/profile" },
                  { label: tt("userform.view") },
                ]
              : [
                  { label: tt("userform.home"), href: "/" },
                  { label: tt("userform.userMgmt"), href: "/users" },
                  { label: tt("userform.view") },
                ]
          }
        />

        <div className="flex justify-end items-center mt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
            >
              {tt("userform.back")}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(`/user/edit/${id}`, {
                  state: { from: fromProfile ? "profile" : undefined },
                })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {tt("userform.switchToEdit")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
          {/* Left: Photo + Org + Timestamps */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md text-center">
              <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">
                {tt("userform.profilePhoto")}
              </h3>
              <div className="relative w-40 h-40 mx-auto mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-gray-300 dark:text-gray-700" />
                )}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                {tt("userform.orgInfo")}
              </h3>
              <div className="space-y-4">
                <FieldDisplay
                  label={tt("userform.department")}
                  value={departmentOptions.find((d) => d.id === formData.deptId)?.name || "-"}
                />
                <FieldDisplay
                  label={tt("userform.command")}
                  value={commandOptions.find((c) => c.id === formData.commId)?.name || "-"}
                />
                <FieldDisplay
                  label={tt("userform.station")}
                  value={stationOptions.find((s) => s.id === formData.stnId)?.name || "-"}
                />
                <FieldDisplay
                  label={tt("userform.role")}
                  value={rolesData.find((r) => r.id === formData.roleId)?.name || "-"}
                />
              </div>
            </div>

            {id && (
              <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                  {tt("userform.timestamps")}
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    <strong>{tt("userform.created")}:</strong>{" "}
                    {formatDateTime(formData.createdAt)}{" "}
                    {formData.createdBy ? ` ${tt("userform.by")} ${formData.createdBy}` : ""}
                  </p>
                  <p>
                    <strong>{tt("userform.updated")}:</strong>{" "}
                    {formatDateTime(formData.updatedAt)}{" "}
                    {formData.updatedBy ? ` ${tt("userform.by")} ${formData.updatedBy}` : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Account + Personal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                {tt("userform.accountLogin")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FieldDisplay label={tt("userform.username")} value={formData.username || "-"} />
                <FieldDisplay label={tt("userform.displayName")} value={formData.displayName || "-"} />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                {tt("userform.personal")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <FieldDisplay label={tt("userform.title")} value={formData.title || "-"} />
                <FieldDisplay label={tt("userform.firstName")} value={formData.firstName || "-"} />
                <FieldDisplay label={tt("userform.lastName")} value={formData.lastName || "-"} />
                <FieldDisplay label={tt("userform.middleName")} value={formData.middleName || "-"} />
                <FieldDisplay label={tt("userform.email")} value={formData.email || "-"} />
                <FieldDisplay label={tt("userform.mobile")} value={formatMobileDisplay(formData.mobileNo)} />
                <FieldDisplay
                  label={tt("userform.citizenId")}
                  value={formatCitizenIdDisplay(formData.citizenId)}
                />
                <FieldDisplay label={tt("userform.dob")} value={formData.bod || "-"} />
                <FieldDisplay
                  label={tt("userform.gender")}
                  value={
                    formData.gender === 0
                      ? tt("userform.genderMale")
                      : formData.gender === 1
                      ? tt("userform.genderFemale")
                      : formData.gender === 2
                      ? tt("userform.genderOther")
                      : "-"
                  }
                />
                <FieldDisplay label={tt("userform.blood")} value={formData.blood || "-"} />
                <div className="md:col-span-3">
                  <FieldDisplay label={tt("userform.address")} value={formData.address || "-"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- CREATE/EDIT MODE ---------------- */
  return (
    <div className="container mx-auto px-4  sm:px-6 lg:px-8 py-8">
      <PageBreadcrumb
        pageTitle={pageMode === "Edit" ? tt("userform.editUser") : tt("userform.createUser")}
        items={
          fromProfile
            ? [
                { label: tt("userform.home"), href: "/" },
                { label: tt("userform.profile"), href: "/profile" },
                { label: pageMode === "Edit" ? tt("userform.editUser") : tt("userform.createUser") },
              ]
            : [
                { label: tt("userform.home"), href: "/" },
                { label: tt("userform.userMgmt"), href: "/users" },
                { label: pageMode === "Edit" ? tt("userform.editUser") : tt("userform.createUser") },
              ]
        }
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Photo + Org */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md text-center">
              <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">{tt("userform.profilePhoto")}</h3>
              <div className="relative w-40 h-40 mx-auto mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-gray-300 dark:text-gray-700" />
                )}
                <label
                  htmlFor="photo-upload"
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full cursor-pointer transition-opacity duration-300 opacity-0 hover:opacity-100"
                >
                  <div className="text-center">
                    <CameraIcon className="w-8 h-8 text-white mx-auto" />
                    <span className="text-xs text-white mt-1">{tt("userform.changePhoto")}</span>
                  </div>
                </label>
              </div>
              <input
                id="photo-upload"
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">{tt("userform.allowedTypes")}</p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                {tt("userform.orgInfo")}
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="deptId" className={labelClasses}>
                    {tt("userform.department")}{" "}
                    {!isEdit && pageMode === "Create" ? <span className="text-red-500">*</span> : null}
                  </label>
                  <select
                    id="deptId"
                    name="deptId"
                    value={formData.deptId}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required={pageMode === "Create"}
                  >
                    <option value="">{tt("userform.selectDepartment")}</option>
                    {departmentOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="commId" className={labelClasses}>
                    {tt("userform.command")}{" "}
                    {!isEdit && pageMode === "Create" ? <span className="text-red-500">*</span> : null}
                  </label>
                  <select
                    id="commId"
                    name="commId"
                    value={formData.commId}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required={pageMode === "Create"}
                    disabled={!formData.deptId}
                  >
                    <option value="">{tt("userform.selectCommand")}</option>
                    {commandOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="stnId" className={labelClasses}>
                    {tt("userform.station")}{" "}
                    {!isEdit && pageMode === "Create" ? <span className="text-red-500">*</span> : null}
                  </label>
                  <select
                    id="stnId"
                    name="stnId"
                    value={formData.stnId}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required={pageMode === "Create"}
                    disabled={!formData.commId}
                  >
                    <option value="">{tt("userform.selectStation")}</option>
                    {stationOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="roleId" className={labelClasses}>
                    {tt("userform.role")} {!isEdit && pageMode === "Create" ? <span className="text-red-500">*</span> : null}
                  </label>
                  <select
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  >
                    <option value="">{tt("userform.selectRole")}</option>
                    {rolesData.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {id && (
              <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                  {tt("userform.timestamps")}
                </h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    <strong>{tt("userform.created")}:</strong> {formatDateTime(formData.createdAt)}{" "}
                    {formData.createdBy ? ` ${tt("userform.by")} ${formData.createdBy}` : ""}
                  </p>
                  <p>
                    <strong>{tt("userform.updated")}:</strong> {formatDateTime(formData.updatedAt)}{" "}
                    {formData.updatedBy ? ` ${tt("userform.by")} ${formData.updatedBy}` : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Account + Personal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                {tt("userform.accountLogin")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label htmlFor="username" className={labelClasses}>
                    {tt("userform.username")}
                    {pageMode === "Create" && <span className="text-red-500">*</span>}
                  </label>
                  {pageMode === "Create" ? (
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                      maxLength={30}
                      pattern="[a-zA-Z0-9_]+"
                      title="Username can only contain letters, numbers, and underscores"
                    />
                  ) : (
                    <div className="mt-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                      {formData.username || "-"}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="displayName" className={labelClasses}>
                    {tt("userform.displayName")}
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={inputClasses}
                    maxLength={25}
                  />
                </div>

                {pageMode === "Create" ? (
                  <>
                    <div>
                      <label htmlFor="password" className={labelClasses}>
                        {tt("userform.password")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password || ""}
                        onChange={handleInputChange}
                        className={inputClasses}
                        required
                        minLength={8}
                        maxLength={30}
                        title="Password must be at least 8 characters with 1 uppercase letter and 1 special character"
                        autoComplete="new-password"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-300">{tt("userform.pwdHint")}</span>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className={labelClasses}>
                        {tt("userform.confirmPassword")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword || ""}
                        onChange={handleInputChange}
                        className={inputClasses}
                        required
                        minLength={8}
                        maxLength={30}
                        autoComplete="new-password"
                      />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2" />
                )}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900/50 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                {tt("userform.personal")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <div className="md:col-span-1">
                  <label htmlFor="title" className={labelClasses}>
                    {tt("userform.title")}
                  </label>
                  <select id="title" name="title" value={formData.title} onChange={handleInputChange} className={inputClasses}>
                    <option value="">{tt("userform.selectTitle")}</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="firstName" className={labelClasses}>
                    {tt("userform.firstName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    maxLength={50}
                  />
                </div>

                <div>
                  <label htmlFor="middleName" className={labelClasses}>
                    {tt("userform.middleName")}
                  </label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className={inputClasses}
                    maxLength={50}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="lastName" className={labelClasses}>
                    {tt("userform.lastName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                    maxLength={50}
                  />
                </div>

                {pageMode === "Create" ? (
                  <div className="md:col-span-3">
                    <label htmlFor="email" className={labelClasses}>
                      {tt("userform.email")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClasses}
                      required
                      maxLength={100}
                      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                      title="Please enter a valid email address"
                    />
                  </div>
                ) : (
                  <div className="md:col-span-3">
                    <label className={labelClasses}>{tt("userform.email")}</label>
                    <div className="mt-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                      {formData.email || "-"}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="mobileNo" className={labelClasses}>
                    {tt("userform.mobile")}
                  </label>
                  <input
                    type="tel"
                    id="mobileNo"
                    name="mobileNo"
                    value={mobileDisplay}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    className={inputClasses}
                    maxLength={12} // Include dashes: 0XX-XXX-XXXX
                    pattern="[0-9-]*"
                  />
                </div>

                <div>
                  <label htmlFor="citizenId" className={labelClasses}>
                    {tt("userform.citizenId")}
                  </label>
                  <input
                    type="text"
                    id="citizenId"
                    name="citizenId"
                    value={citizenIdDisplay}
                    onChange={(e) => handleCitizenIdChange(e.target.value)}
                    className={inputClasses}
                    maxLength={17} // Include dashes: X-XXXX-XXXXX-XX-X
                    pattern="[0-9-]*"
                  />
                </div>

                <div>
                  <label htmlFor="bod" className={labelClasses}>
                    {tt("userform.dob")}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="bod"
                      name="bod"
                      value={formData.bod}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bod: e.target.value }))}
                      className={`${inputClasses} pr-10 ${isDatePickerOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                      min={getDateLimits().min}
                      max={getDateLimits().max}
                      onKeyDown={(e) => {
                        // Block typing - only allow calendar picker
                        e.preventDefault();
                      }}
                      onPaste={(e) => {
                        // Block pasting
                        e.preventDefault();
                      }}
                      placeholder=""
                      readOnly
                    />
                    <div 
                      className={`absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer transition-colors ${
                        isDatePickerOpen 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                      }`}
                      onClick={handleDatePickerClick}
                    >
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                  </div>
                
                </div>

                <div>
                  <label htmlFor="gender" className={labelClasses}>
                    {tt("userform.gender")}
                  </label>
                  <select 
                    id="gender" 
                    name="gender" 
                    value={formData.gender === null ? "" : formData.gender.toString()} 
                    onChange={handleInputChange} 
                    className={inputClasses}
                  >
                    <option value="">{tt("userform.selectGender")}</option>
                    <option value="0">{tt("userform.genderMale")}</option>
                    <option value="1">{tt("userform.genderFemale")}</option>
                    <option value="2">{tt("userform.genderOther")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="blood" className={labelClasses}>
                    {tt("userform.blood")}
                  </label>
                  <select id="blood" name="blood" value={formData.blood} onChange={handleInputChange} className={inputClasses}>
                    <option value="">{tt("userform.selectBlood")}</option>
                    <option>A</option>
                    <option>B</option>
                    <option>AB</option>
                    <option>O</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label htmlFor="address" className={labelClasses}>
                    {tt("userform.address")}
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputClasses}
                    placeholder={lang === "th" ? tt("userform.addressPlaceholderTh") : tt("userform.addressPlaceholderEn")}
                    maxLength={255}
                  ></textarea>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-center lg:col-span-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => (fromProfile ? navigate("/profile") : navigate(-1))}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
              >
                {tt("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? tt("userform.saving") : isEdit ? tt("userform.saveChanges") : tt("userform.create")}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

/* ---------------- Small Readonly Field ---------------- */
const FieldDisplay: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="mt-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
      {value ?? "-"}
    </div>
  </div>
);

export default UserForm;
