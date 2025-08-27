import { useState, useEffect, useMemo } from 'react';
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
  ChevronUp,
  Filter,
  X,
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
  MessageSquare
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface AuditLog {
  id: number;
  orgId: string;
  username: string;
  txId: string;
  uniqueId: string;
  mainFunc: string;
  subFunc: string;
  nameFunc: string;
  action: string;
  status: number;
  duration: number;
  newData: any;
  oldData: any;
  resData: any;
  message: string;
  createdAt: string;
}

interface AuditFilter {
  dateRange: {
    start: string;
    end: string;
  };
  mainFunc: string;
  subFunc: string;
  action: string;
  status: string;
  search: string;
}

// Helper component for rendering data objects
const DataDisplay = ({ data }: { data: any }) => {
  const { t } = useTranslation();
  
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4">
        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
          <Database className="w-5 h-5" />
          <p className="text-xs italic">{t("common.no_data") || "ไม่มีข้อมูล"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border font-mono text-xs max-h-48 overflow-y-auto">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between items-start gap-3 py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
          <span className="font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0 min-w-0">
            {key}:
          </span>
          <span className="text-right break-all text-gray-800 dark:text-gray-200 min-w-0">
            {typeof value === 'boolean' ? (
              <span className={`px-1.5 py-0.5 rounded text-xs ${value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {value ? 'true' : 'false'}
              </span>
            ) : value === null ? (
              <span className="text-gray-400 italic">null</span>
            ) : typeof value === 'object' ? (
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

export default function UserAuditLog({ username }: UserAuditLogProps) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<AuditFilter>({
    dateRange: { start: '', end: '' },
    mainFunc: '',
    subFunc: '',
    action: '',
    status: '',
    search: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const API = import.meta.env.VITE_API_BASE_URL || 'https://cmsapi-production-488d.up.railway.app';

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Fetch audit logs for specific user
  const fetchUserAuditLogs = async (targetUsername?: string) => {
    if (!targetUsername) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error("Access token not found");
      }

      const url = `${API}/audit_log/${targetUsername}?start=0&length=100`;
      console.log('Fetching user audit logs from:', url);
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('User Audit API Response:', result);
      
      if (result.status !== "0") {
        throw new Error(result.msg || "API returned an error while fetching audit logs.");
      }

      // Process JSON strings safely
      const processedLogs = result.data.map((log: any) => {
        try {
          return {
            ...log,
            newData: log.newData && log.newData !== '{}' && log.newData !== '' ? JSON.parse(log.newData) : {},
            oldData: log.oldData && log.oldData !== '{}' && log.oldData !== '' ? JSON.parse(log.oldData) : {},
            resData: log.resData && log.resData !== '{}' && log.resData !== '' ? JSON.parse(log.resData) : {}
          };
        } catch (parseError) {
          console.warn('Failed to parse JSON for log:', log.id, parseError);
          return {
            ...log,
            newData: {},
            oldData: {},
            resData: {}
          };
        }
      });

      setLogs(processedLogs);
      
    } catch (err: any) {
      console.error("Error fetching user audit logs:", err);
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs when username changes
  useEffect(() => {
    if (username) {
      fetchUserAuditLogs(username);
    }
  }, [username]);

  // Memoized computations
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
      if (filter.status !== '' && log.status !== parseInt(filter.status)) return false;

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          log.txId.toLowerCase().includes(searchLower) ||
          log.message.toLowerCase().includes(searchLower) ||
          log.mainFunc.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower)
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

  // Helper functions
  const getFunctionIcon = (mainFunc: string, subFunc: string) => {
    const combined = `${mainFunc}.${subFunc}`.toLowerCase();
    
    // System functions
    if (mainFunc.toLowerCase().includes('system') || mainFunc.toLowerCase().includes('auth')) {
      if (combined.includes('login')) return { icon: LogIn, color: 'text-green-600' };
      if (combined.includes('logout')) return { icon: LogOut, color: 'text-red-600' };
      if (combined.includes('register')) return { icon: Users, color: 'text-blue-600' };
      return { icon: Shield, color: 'text-purple-600' };
    }
    
    // User functions
    if (mainFunc.toLowerCase().includes('user')) {
      if (combined.includes('create')) return { icon: Plus, color: 'text-green-600' };
      if (combined.includes('update') || combined.includes('edit')) return { icon: Edit, color: 'text-orange-600' };
      if (combined.includes('delete')) return { icon: Trash2, color: 'text-red-600' };
      if (combined.includes('view') || combined.includes('read')) return { icon: Eye, color: 'text-blue-600' };
      return { icon: User, color: 'text-indigo-600' };
    }
    
    // Case functions
    if (mainFunc.toLowerCase().includes('case')) {
      if (combined.includes('assign')) return { icon: Users, color: 'text-purple-600' };
      if (combined.includes('create')) return { icon: Plus, color: 'text-green-600' };
      if (combined.includes('update')) return { icon: Edit, color: 'text-orange-600' };
      if (combined.includes('delete')) return { icon: Trash2, color: 'text-red-600' };
      return { icon: FolderOpen, color: 'text-amber-600' };
    }
    
    // Report functions
    if (mainFunc.toLowerCase().includes('report')) {
      if (combined.includes('export')) return { icon: Download, color: 'text-teal-600' };
      if (combined.includes('generate')) return { icon: BarChart3, color: 'text-blue-600' };
      if (combined.includes('delete')) return { icon: Trash2, color: 'text-red-600' };
      return { icon: PieChart, color: 'text-emerald-600' };
    }
    
    // Notification functions
    if (mainFunc.toLowerCase().includes('notification') || mainFunc.toLowerCase().includes('notify')) {
      if (combined.includes('send')) return { icon: Bell, color: 'text-yellow-600' };
      if (combined.includes('create')) return { icon: Bell, color: 'text-green-600' };
      if (combined.includes('email') || combined.includes('mail')) return { icon: Mail, color: 'text-blue-600' };
      return { icon: Bell, color: 'text-yellow-600' };
    }
    
    // Settings functions
    if (mainFunc.toLowerCase().includes('settings') || mainFunc.toLowerCase().includes('config')) {
      return { icon: Settings, color: 'text-gray-600' };
    }
    
    // Database functions
    if (mainFunc.toLowerCase().includes('database') || mainFunc.toLowerCase().includes('backup')) {
      if (combined.includes('backup')) return { icon: Save, color: 'text-green-600' };
      if (combined.includes('restore')) return { icon: Upload, color: 'text-blue-600' };
      return { icon: Database, color: 'text-indigo-600' };
    }
    
    // Default based on action
    return { icon: Activity, color: 'text-gray-500' };
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return { 
        icon: CheckCircle, 
        color: 'text-green-500', 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: t("audit_log.success") || "สำเร็จ" 
      };
      case 1: return { 
        icon: XCircle, 
        color: 'text-red-500', 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: t("audit_log.failed") || "ล้มเหลว" 
      };
      case 2: return { 
        icon: AlertCircle, 
        color: 'text-yellow-500', 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: t("audit_log.warning") || "เตือน" 
      };
      default: return { 
        icon: AlertCircle, 
        color: 'text-gray-500', 
        bg: 'bg-gray-100 dark:bg-gray-700', 
        text: t("audit_log.unknown") || "ไม่ทราบ" 
      };
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return { icon: Plus, color: 'text-green-500' };
      case 'update': 
      case 'edit': return { icon: Edit, color: 'text-orange-500' };
      case 'delete': 
      case 'remove': return { icon: Trash2, color: 'text-red-500' };
      case 'login': 
      case 'signin': return { icon: LogIn, color: 'text-green-500' };
      case 'logout': 
      case 'signout': return { icon: LogOut, color: 'text-red-500' };
      case 'view': 
      case 'read': 
      case 'get': return { icon: Eye, color: 'text-blue-500' };
      case 'save': 
      case 'store': return { icon: Save, color: 'text-green-500' };
      case 'upload': return { icon: Upload, color: 'text-blue-500' };
      case 'download': 
      case 'export': return { icon: Download, color: 'text-purple-500' };
      case 'send': 
      case 'notify': return { icon: Bell, color: 'text-yellow-500' };
      case 'assign': return { icon: Users, color: 'text-purple-500' };
      default: return { icon: Activity, color: 'text-gray-500' };
    }
  };

  const clearFilters = () => {
    setFilter({
      dateRange: { start: '', end: '' },
      mainFunc: '', subFunc: '', action: '', status: '', search: ''
    });
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t("userform.auditLog") || "บันทึกการใช้งาน"} - {username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("audit_log.user_activity_history") || "ประวัติการใช้งานของผู้ใช้"}
          </p>
        </div>
        <button
          onClick={() => fetchUserAuditLogs(username)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t("common.refresh") || "รีเฟรช"}
        </button>
      </div>

      {/* Summary Stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("audit_log.total_activities") || "กิจกรรมทั้งหมด"}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {filteredLogs.length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("audit_log.success") || "สำเร็จ"}
              </span>
            </div>
            <p className="text-xl font-bold text-green-600 mt-1">
              {filteredLogs.filter(log => log.status === 0).length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("audit_log.failed") || "ล้มเหลว"}
              </span>
            </div>
            <p className="text-xl font-bold text-red-600 mt-1">
              {filteredLogs.filter(log => log.status === 1).length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t("audit_log.avg_duration") || "เวลาเฉลี่ย"}
              </span>
            </div>
            <p className="text-xl font-bold text-purple-600 mt-1">
              {filteredLogs.length > 0 ? Math.round(filteredLogs.reduce((sum, log) => sum + log.duration, 0) / filteredLogs.length) : 0}ms
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            {t("common.filters") || "ตัวกรอง"}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {Object.values(filter).some(v => v !== '' && !(typeof v === 'object' && Object.values(v).every(val => val === ''))) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <X className="w-3 h-3" />
              {t("common.clear_filters") || "ล้างตัวกรอง"}
            </button>
          )}
        </div>

        {showFilters && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("common.start_date") || "วันที่เริ่ม"}
                </label>
                <input
                  type="date"
                  value={filter.dateRange.start}
                  onChange={(e) => setFilter({...filter, dateRange: {...filter.dateRange, start: e.target.value}})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("common.end_date") || "วันที่สิ้นสุด"}
                </label>
                <input
                  type="date"
                  value={filter.dateRange.end}
                  onChange={(e) => setFilter({...filter, dateRange: {...filter.dateRange, end: e.target.value}})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("audit_log.main_function") || "ฟังก์ชั่นหลัก"}
                </label>
                <select
                  value={filter.mainFunc}
                  onChange={(e) => setFilter({...filter, mainFunc: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("common.all") || "ทั้งหมด"}</option>
                  {uniqueValues.mainFuncs.map(func => (
                    <option key={func} value={func}>{func}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("audit_log.action") || "การกระทำ"}
                </label>
                <select
                  value={filter.action}
                  onChange={(e) => setFilter({...filter, action: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("common.all") || "ทั้งหมด"}</option>
                  {uniqueValues.actions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("audit_log.status") || "สถานะ"}
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({...filter, status: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("common.all") || "ทั้งหมด"}</option>
                  <option value="0">{t("audit_log.success") || "สำเร็จ"}</option>
                  <option value="1">{t("audit_log.failed") || "ล้มเหลว"}</option>
                  <option value="2">{t("audit_log.warning") || "เตือน"}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("common.search") || "ค้นหา"}
                </label>
                <input
                  type="text"
                  placeholder={t("common.search_placeholder") || "ค้นหา..."}
                  value={filter.search}
                  onChange={(e) => setFilter({...filter, search: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-lg">{t("common.loading") || "กำลังโหลด"}</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-red-200 dark:border-red-800 shadow-sm p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div className="text-red-600 dark:text-red-400">
                <p className="font-medium">{t("common.error") || "เกิดข้อผิดพลาด"}</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-12 text-center">
            <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
              <Activity className="w-8 h-8" />
              <div>
                <p className="text-lg font-medium">{t("audit_log.no_data") || "ไม่พบข้อมูล Audit Log"}</p>
                <p className="text-sm mt-1">{t("audit_log.no_activities_found") || "ไม่พบกิจกรรมของผู้ใช้นี้"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedLogs.map((log) => {
              const isExpanded = expandedLog === log.id;
              const statusInfo = getStatusBadge(log.status);
              const functionInfo = getFunctionIcon(log.mainFunc, log.subFunc);
              const actionInfo = getActionIcon(log.action);
              
              return (
                <div key={log.id} className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <functionInfo.icon className={`w-4 h-4 ${functionInfo.color} flex-shrink-0`} />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {log.nameFunc || log.mainFunc}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {log.subFunc && log.subFunc !== log.mainFunc ? `${log.mainFunc}.${log.subFunc}` : log.mainFunc}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg}`}>
                          <statusInfo.icon className={`w-3 h-3 ${statusInfo.color}`} />
                          {statusInfo.text}
                        </div>
                        
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <actionInfo.icon className={`w-3 h-3 ${actionInfo.color} flex-shrink-0`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{t("audit_log.action") || "การกระทำ"}</p>
                          <p className="font-medium text-gray-900 dark:text-white truncate">{log.action}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-purple-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{t("audit_log.datetime") || "วันที่เวลา"}</p>
                          <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
                            {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{t("audit_log.duration") || "ระยะเวลา"}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{log.duration}ms</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{t("audit_log.message") || "ข้อความ"}</p>
                          <p className="font-medium text-gray-900 dark:text-white text-xs truncate" title={log.message}>
                            {log.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                      {/* Basic Information */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {t("audit_log.basic_info") || "ข้อมูลพื้นฐาน"}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t("audit_log.username") || "ชื่อผู้ใช้"}:</span>
                            <div className="text-gray-600 dark:text-gray-400 mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                              {log.username}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t("audit_log.org_id") || "รหัสองค์กร"}:</span>
                            <div className="text-gray-600 dark:text-gray-400 mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                              {log.orgId}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t("audit_log.function_name") || "ชื่อฟังก์ชัน"}:</span>
                            <div className="text-gray-600 dark:text-gray-400 mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                              {log.nameFunc || log.mainFunc}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t("audit_log.sub_function") || "ฟังก์ชันย่อย"}:</span>
                            <div className="text-gray-600 dark:text-gray-400 mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                              {log.subFunc}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          {t("audit_log.transaction_details") || "รายละเอียดธุรกรรม"}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t("audit_log.transaction_id") || "Transaction ID"}:</span>
                            <div className="font-mono text-gray-600 dark:text-gray-400 break-all mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                              {log.txId}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t("audit_log.unique_id") || "Unique ID"}:</span>
                            <div className="font-mono text-gray-600 dark:text-gray-400 break-all mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                              {log.uniqueId}
                            </div>
                          </div>
                        </div>
                        
                        {/* Full Message */}
                        <div className="mt-3">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t("audit_log.full_message") || "ข้อความทั้งหมด"}:</span>
                          <div className="text-gray-600 dark:text-gray-400 mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-xs">
                            {log.message}
                          </div>
                        </div>
                      </div>
                      
                      {/* Data Details */}
                      {(Object.keys(log.newData).length > 0 || Object.keys(log.oldData).length > 0 || Object.keys(log.resData).length > 0) && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            {t("audit_log.data_details") || "รายละเอียดข้อมูล"}
                          </h5>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {Object.keys(log.newData).length > 0 && (
                              <div>
                                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-xs flex items-center gap-1">
                                  <Plus className="w-3 h-3 text-green-500" />
                                  {t("audit_log.new_data") || "ข้อมูลใหม่"}
                                </h6>
                                <DataDisplay data={log.newData} />
                              </div>
                            )}
                            {Object.keys(log.oldData).length > 0 && (
                              <div>
                                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  {t("audit_log.old_data") || "ข้อมูลเดิม"}
                                </h6>
                                <DataDisplay data={log.oldData} />
                              </div>
                            )}
                            {Object.keys(log.resData).length > 0 && (
                              <div>
                                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-xs flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-blue-500" />
                                  {t("audit_log.result_data") || "ผลลัพธ์"}
                                </h6>
                                <DataDisplay data={log.resData} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span>{t("common.show") || "แสดง"}:</span>
                  <select 
                    value={rowsPerPage} 
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>{t("common.items") || "รายการ"}</span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t("common.showing") || "แสดง"} {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredLogs.length)} {t("common.of") || "จาก"} {filteredLogs.length} {t("common.items") || "รายการ"}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <ChevronUp className="w-3 h-3 rotate-[-90deg]" />
                  {t("common.previous") || "ก่อนหน้า"}
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 text-xs rounded transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {t("common.next") || "ถัดไป"}
                  <ChevronUp className="w-3 h-3 rotate-90" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
