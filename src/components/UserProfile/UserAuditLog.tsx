// /src/components/UserProfile/UserAuditLog.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Trash2, 
  User,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  LogIn,
  LogOut,
  Edit,
  Eye,
  Save,
  Upload,
  Download,
  Bell,
  Users,
  FolderOpen,
  Shield,
  Settings,
  Database,
  BarChart3,
  PieChart,
  Mail,
  Clock,
  Hash,
  MessageSquare,
  Loader2,
  ServerCrash,
  Info,
  FileText,
  Zap
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { APP_CONFIG } from "@/utils/constants";
import type { AuditFilter, AuditLog } from "@/types/audit";

// Helper component for rendering data objects
const DataDisplay = ({ data }: { data: Record<string, unknown> }) => {
  const { t } = useTranslation();
  
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-6">
        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
          <Database className="w-6 h-6" />
          <p className="text-xs italic">{t("common.no_data") || "ไม่มีข้อมูล"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-md border font-mono text-xs max-h-64 overflow-y-auto">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between items-start gap-3 py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
          <span className="font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0 min-w-0">
            {key}:
          </span>
          <span className="text-right break-all text-gray-800 dark:text-gray-200 min-w-0">
            {typeof value === "boolean" ? (
              <span className={`px-1.5 py-0.5 rounded text-xs ${value ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
                {value ? "true" : "false"}
              </span>
            ) : value === null ? (
              <span className="text-gray-400 italic">null</span>
            ) : typeof value === "object" ? (
              <span className="text-purple-600 dark:text-purple-400">
                {JSON.stringify(value, null, 2)}
              </span>
            ) : (
              String(value)
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

interface UserAuditLogProps {
  username?: string;
}

const UserAuditLog = ({ username }: UserAuditLogProps) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<AuditFilter>({
    dateRange: { start: "", end: "" },
    mainFunc: "",
    subFunc: "",
    action: "",
    status: "",
    search: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Toast state - simplified for single toast management
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    show: boolean;
  }>({ message: "", type: "info", show: false });
  
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show toast function - ensure only one toast at a time
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    // Clear any existing timeout first
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    
    // Hide current toast immediately
    setToast({ message: "", type: "info", show: false });
    
    // Show new toast after a tiny delay to ensure previous one is cleared
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ message, type, show: true });
    }, 50);
  };

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "accept": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch audit logs for specific user
  const fetchUserAuditLogs = async (targetUsername?: string) => {
    if (!targetUsername) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Access token not found");
      }

      const url = `${APP_CONFIG.API_BASE_URL}/audit_log/${targetUsername}?start=0&length=100`;
      console.log("Fetching user audit logs from:", url);
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("User Audit API Response:", result);
      
      if (result.status !== "0") {
        throw new Error(result.msg || t("audit_log.api_error") || "API returned an error while fetching audit logs.");
      }

      // Process JSON strings safely
      const processedLogs = result.data.map((log: AuditLog) => {
        try {
          return {
            ...log,
            newData: (typeof log.newData === "string" && log.newData !== "{}" && log.newData !== "") ? JSON.parse(log.newData) : (log.newData ?? {}),
            oldData: (typeof log.oldData === "string" && log.oldData !== "{}" && log.oldData !== "") ? JSON.parse(log.oldData) : (log.oldData ?? {}),
            resData: (typeof log.resData === "string" && log.resData !== "{}" && log.resData !== "") ? JSON.parse(log.resData) : (log.resData ?? {}),
          };
        } catch (parseError) {
          console.warn("Failed to parse JSON for log:", log.id, parseError);
          return {
            ...log,
            newData: {},
            oldData: {},
            resData: {}
          };
        }
      });

      setLogs(processedLogs);
      const message = t("audit_log.query_success", { count: processedLogs.length }) || `โหลดข้อมูลสำเร็จ ${processedLogs.length} รายการ`;
      showToast(message, "success");

    }
    catch (err: unknown) {
      console.error("Error fetching user audit logs:", err);
      setError(err instanceof Error ? err.message : String(err));
      setLogs([]);
    }
    finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (username) {
      fetchUserAuditLogs(username);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // --- MEMOIZED COMPUTATIONS ---
  const uniqueValues = useMemo(() => {
    return {
      mainFuncs: [...new Set(logs.map(log => log.mainFunc))].sort(),
      subFuncs: [...new Set(logs.map(log => log.subFunc))].sort(),
      actions: [...new Set(logs.map(log => log.action))].sort()
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.createdAt);
      const startDate = filter.dateRange.start ? new Date(filter.dateRange.start) : null;
      const endDate = filter.dateRange.end ? new Date(filter.dateRange.end) : null;
      
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;

      if (filter.mainFunc && log.mainFunc !== filter.mainFunc) return false;
      if (filter.subFunc && log.subFunc !== filter.subFunc) return false;
      if (filter.action && log.action !== filter.action) return false;
      if (filter.status !== "" && log.status !== parseInt(filter.status)) return false;

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          log.username.toLowerCase().includes(searchLower) ||
          log.txId.toLowerCase().includes(searchLower) ||
          log.message.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [logs, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, rowsPerPage]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  // --- HELPER FUNCTIONS ---
  const getFunctionIcon = (mainFunc: string, subFunc: string) => {
    const combined = `${mainFunc}.${subFunc}`.toLowerCase();
    
    // System functions
    if (mainFunc.toLowerCase().includes("system") || mainFunc.toLowerCase().includes("auth")) {
      if (combined.includes("login")) return { icon: LogIn, color: "text-green-600 dark:text-green-400" };
      if (combined.includes("logout")) return { icon: LogOut, color: "text-red-600 dark:text-red-400" };
      if (combined.includes("register")) return { icon: Users, color: "text-blue-600 dark:text-blue-400" };
      return { icon: Shield, color: "text-purple-600 dark:text-purple-400" };
    }
    
    // User functions
    if (mainFunc.toLowerCase().includes("user")) {
      if (combined.includes("create")) return { icon: Plus, color: "text-green-600 dark:text-green-400" };
      if (combined.includes("update") || combined.includes("edit")) return { icon: Edit, color: "text-orange-600 dark:text-orange-400" };
      if (combined.includes("delete")) return { icon: Trash2, color: "text-red-600 dark:text-red-400" };
      if (combined.includes("view") || combined.includes("read")) return { icon: Eye, color: "text-blue-600 dark:text-blue-400" };
      return { icon: User, color: "text-indigo-600 dark:text-indigo-400" };
    }
    
    // Case functions
    if (mainFunc.toLowerCase().includes("case")) {
      if (combined.includes("assign")) return { icon: Users, color: "text-purple-600 dark:text-purple-400" };
      if (combined.includes("create")) return { icon: Plus, color: "text-green-600 dark:text-green-400" };
      if (combined.includes("update")) return { icon: Edit, color: "text-orange-600 dark:text-orange-400" };
      if (combined.includes("delete")) return { icon: Trash2, color: "text-red-600 dark:text-red-400" };
      return { icon: FolderOpen, color: "text-amber-600 dark:text-amber-400" };
    }
    
    // Report functions
    if (mainFunc.toLowerCase().includes("report")) {
      if (combined.includes("export")) return { icon: Download, color: "text-teal-600 dark:text-teal-400" };
      if (combined.includes("generate")) return { icon: BarChart3, color: "text-blue-600 dark:text-blue-400" };
      if (combined.includes("delete")) return { icon: Trash2, color: "text-red-600 dark:text-red-400" };
      return { icon: PieChart, color: "text-emerald-600 dark:text-emerald-400" };
    }
    
    // Notification functions
    if (mainFunc.toLowerCase().includes("notification") || mainFunc.toLowerCase().includes("notify")) {
      if (combined.includes("send")) return { icon: Bell, color: "text-yellow-600 dark:text-yellow-400" };
      if (combined.includes("create")) return { icon: Bell, color: "text-green-600 dark:text-green-400" };
      if (combined.includes("email") || combined.includes("mail")) return { icon: Mail, color: "text-blue-600 dark:text-blue-400" };
      return { icon: Bell, color: "text-yellow-600 dark:text-yellow-400" };
    }
    
    // Settings functions
    if (mainFunc.toLowerCase().includes("settings") || mainFunc.toLowerCase().includes("config")) {
      return { icon: Settings, color: "text-gray-600 dark:text-gray-400" };
    }
    
    // Database functions
    if (mainFunc.toLowerCase().includes("database") || mainFunc.toLowerCase().includes("backup")) {
      if (combined.includes("backup")) return { icon: Save, color: "text-green-600 dark:text-green-400" };
      if (combined.includes("restore")) return { icon: Upload, color: "text-blue-600 dark:text-blue-400" };
      return { icon: Database, color: "text-indigo-600 dark:text-indigo-400" };
    }
    
    // Default based on action
    return { icon: Activity, color: "text-gray-500 dark:text-gray-400" };
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return { 
        icon: CheckCircle, 
        color: "text-green-500 dark:text-green-400", 
        bg: "bg-green-100 dark:bg-green-900/30", 
        text: t("audit_log.success") || "สำเร็จ" 
      };
      case 1: return { 
        icon: XCircle, 
        color: "text-red-500 dark:text-red-400", 
        bg: "bg-red-100 dark:bg-red-900/30", 
        text: t("audit_log.failed") || "ล้มเหลว" 
      };
      case 2: return { 
        icon: AlertCircle, 
        color: "text-yellow-500 dark:text-yellow-400", 
        bg: "bg-yellow-100 dark:bg-yellow-900/30", 
        text: t("audit_log.warning") || "คำเตือน" 
      };
      default: return { 
        icon: AlertCircle, 
        color: "text-gray-500 dark:text-gray-400", 
        bg: "bg-gray-100 dark:bg-gray-700", 
        text: t("audit_log.unknown") || "ไม่ทราบ" 
      };
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create": return { icon: Plus, color: "text-green-500 dark:text-green-400" };
      case "update": 
      case "edit": return { icon: Edit, color: "text-orange-500 dark:text-orange-400" };
      case "delete": 
      case "remove": return { icon: Trash2, color: "text-red-500 dark:text-red-400" };
      case "login": 
      case "signin": return { icon: LogIn, color: "text-green-500 dark:text-green-400" };
      case "logout": 
      case "signout": return { icon: LogOut, color: "text-red-500 dark:text-red-400" };
      case "view": 
      case "read": 
      case "get": return { icon: Eye, color: "text-blue-500 dark:text-blue-400" };
      case "save": 
      case "store": return { icon: Save, color: "text-green-500 dark:text-green-400" };
      case "upload": return { icon: Upload, color: "text-blue-500 dark:text-blue-400" };
      case "download": 
      case "export": return { icon: Download, color: "text-purple-500 dark:text-purple-400" };
      case "send": 
      case "notify": return { icon: Bell, color: "text-yellow-500 dark:text-yellow-400" };
      case "assign": return { icon: Users, color: "text-purple-500 dark:text-purple-400" };
      default: return { icon: Activity, color: "text-gray-500 dark:text-gray-400" };
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
  };

  const clearFilters = () => {
    setFilter({
      dateRange: { start: "", end: "" },
      mainFunc: "", subFunc: "", action: "", status: "", search: ""
    });
  };

  // --- RENDER ---
  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {username ? `${t("audit_log.user_activities") || "กิจกรรมของผู้ใช้"}: ${username}` : t("audit_log.loading") || "กำลังโหลด..."}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("audit_log.user_activity_history") || "ประวัติการใช้งานของผู้ใช้"}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredLogs.length} {t("audit_log.logs_found") || "รายการที่พบ"}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t("audit_log.search_placeholder") || "ค้นหา ผู้ใช้, เลขธุรกรรม, ข้อความ..."} 
              value={filter.search} 
              onChange={(e) => setFilter({ ...filter, search: e.target.value })} 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filter.status} 
              onChange={(e) => setFilter({ ...filter, status: e.target.value })} 
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("audit_log.all_status") || "ทุกสถานะ"}</option>
              <option value="0">{t("audit_log.success") || "สำเร็จ"}</option>
              <option value="1">{t("audit_log.failed") || "ล้มเหลว"}</option>
              <option value="2">{t("audit_log.warning") || "คำเตือน"}</option>
            </select>
            <button 
              onClick={() => fetchUserAuditLogs(username)} 
              className="group p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed" 
              title={t("audit_log.search") || "ค้นหา"}
              disabled={loading}
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={() => fetchUserAuditLogs(username)} 
              className="group p-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200 disabled:bg-orange-400 disabled:cursor-not-allowed" 
              title={t("audit_log.refresh_data") || "รีเฟรชข้อมูล"}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-300"}`} />
            </button>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium border-2 ${
              showFilters 
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{t("audit_log.filters") || "ตัวกรอง"}</span>
            {[filter.mainFunc, filter.subFunc, filter.action, filter.dateRange.start, filter.dateRange.end].filter(Boolean).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {[filter.mainFunc, filter.subFunc, filter.action, filter.dateRange.start, filter.dateRange.end].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-4">
              {/* First row - Date range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("audit_log.start_date") || "วันที่เริ่มต้น"}
                      </label>
                      <input 
                        type="datetime-local" 
                        value={filter.dateRange.start} 
                        onChange={(e) => setFilter({ ...filter, dateRange: { ...filter.dateRange, start: e.target.value } })} 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:[color-scheme:dark]" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("audit_log.end_date") || "วันที่สิ้นสุด"}
                      </label>
                      <input 
                        type="datetime-local" 
                        value={filter.dateRange.end} 
                        onChange={(e) => setFilter({ ...filter, dateRange: { ...filter.dateRange, end: e.target.value } })} 
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:[color-scheme:dark]" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Second row - Function, Action, Clear button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("audit_log.function") || "ฟังก์ชั่น"}
                  </label>
                  <select 
                    value={filter.mainFunc} 
                    onChange={(e) => setFilter({ ...filter, mainFunc: e.target.value })} 
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">{t("audit_log.all_functions") || "ฟังก์ชั่นทั้งหมด"}</option>
                    {uniqueValues.mainFuncs.map(func => <option key={func} value={func}>{func.charAt(0).toUpperCase() + func.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("audit_log.action") || "การกระทำ"}
                  </label>
                  <select 
                    value={filter.action} 
                    onChange={(e) => setFilter({ ...filter, action: e.target.value })} 
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">{t("audit_log.all_actions") || "การกระทำทั้งหมด"}</option>
                    {uniqueValues.actions.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={clearFilters} 
                    className="w-full text-center px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t("audit_log.clear_all") || "ล้างทั้งหมด"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t("audit_log.user_transaction") || "ผู้ใช้ / ธุรกรรม / เวลา"}
                </div>
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {t("audit_log.function") || "ฟังก์ชั่น"}
                </div>
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t("audit_log.message") || "ข้อความ"}
                </div>
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {t("audit_log.action") || "การกระทำ"}
                </div>
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {t("audit_log.status") || "สถานะ"}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-12">
                  <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{t("audit_log.loading_data") || "กำลังโหลดข้อมูล..."}</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center p-12">
                  <div className="flex flex-col justify-center items-center gap-2 text-red-500">
                    <ServerCrash className="w-8 h-8" />
                    <span>{t("audit_log.error") || "ข้อผิดพลาด"}: {error}</span>
                    <span className="text-xs text-gray-400">
                      {t("audit_log.error_message") || "กรุณาตรวจสอบคอนโซลหรือลองใหม่อีกครั้ง"}
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-12">
                  <div className="flex flex-col justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Search className="w-8 h-8" />
                    <span>{t("audit_log.no_logs_found") || "ไม่พบบันทึกการตรวจสอบ"}</span>
                    <span className="text-xs">
                      {t("audit_log.adjust_filters") || "ลองปรับตัวกรองของคุณ"}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const isExpanded = expandedLog === log.id;
                const statusInfo = getStatusBadge(log.status);
                const actionInfo = getActionIcon(log.action);
                const functionInfo = getFunctionIcon(log.mainFunc, log.subFunc);
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors" onClick={() => setExpandedLog(isExpanded ? null : log.id)}>
                      {/* User / Transaction / Time Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="mt-1 flex-shrink-0">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-3 h-3 text-blue-500" />
                              <span className="font-medium text-gray-900 dark:text-white">{log.username}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <Hash className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{log.txId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(log.createdAt).toLocaleString("th-TH")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Function Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <functionInfo.icon className={`w-4 h-4 mt-0.5 ${functionInfo.color}`} />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white capitalize">
                              {log.mainFunc}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {log.subFunc} / {log.nameFunc}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Message Column */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 dark:text-white" title={log.message}>
                            {log.message.length > 80 
                              ? `${log.message.substring(0, 80)}...` 
                              : log.message
                            }
                          </p>
                          {log.message.length > 80 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {t("audit_log.click_to_view_full") || "คลิกเพื่อดูข้อความเต็ม"}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* Action Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <actionInfo.icon className={`w-4 h-4 ${actionInfo.color}`} />
                          <span className="capitalize font-medium text-gray-900 dark:text-white">{log.action}</span>
                        </div>
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                          <statusInfo.icon className="w-3 h-3" />
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="max-w-full space-y-6">
                              {/* Header with additional info */}
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <Info className="w-5 h-5 text-blue-500" />
                                  {t("audit_log.log_details") || "รายละเอียดบันทึก"}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Hash className="w-4 h-4" />
                                    {t("audit_log.duration") || "ระยะเวลา"}: {log.duration}ms
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Hash className="w-4 h-4" />
                                    ID: {log.uniqueId}
                                  </span>
                                </div>
                              </div>

                              {/* Full Message */}
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" /> 
                                  {t("audit_log.full_message") || "ข้อความเต็ม"}
                                </h4>
                                <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border font-mono leading-relaxed whitespace-pre-wrap">
                                  {log.message}
                                </p>
                              </div>

                              {/* Data sections */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30">
                                  <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> 
                                    {t("audit_log.old_data") || "ข้อมูลเก่า"}
                                  </h4>
                                  <DataDisplay data={log.oldData} />
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
                                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> 
                                    {t("audit_log.new_data") || "ข้อมูลใหม่"}
                                  </h4>
                                  <DataDisplay data={log.newData} />
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/30">
                                  <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> 
                                    {t("audit_log.response_data") || "ข้อมูลการตอบสนอง"}
                                  </h4>
                                  <DataDisplay data={log.resData} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{t("audit_log.show") || "แสดง"}</span>
              <select 
                value={rowsPerPage} 
                onChange={handleRowsPerPageChange}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>{t("audit_log.entries") || "รายการ"}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t("audit_log.showing") || "กำลังแสดง"} {((currentPage - 1) * rowsPerPage) + 1} {t("audit_log.to") || "ถึง"} {Math.min(currentPage * rowsPerPage, filteredLogs.length)} {t("audit_log.of") || "จาก"} {filteredLogs.length} {t("audit_log.entries") || "รายการ"}
              </span>
              
              <div className="flex gap-1 ml-4">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("audit_log.previous") || "ก่อนหน้า"}
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("audit_log.next") || "ถัดไป"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
            toast.type === "success" ? "bg-green-600" :
            toast.type === "error" ? "bg-red-600" : "bg-blue-600"
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAuditLog;
