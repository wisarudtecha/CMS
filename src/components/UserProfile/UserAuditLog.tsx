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
  X
} from 'lucide-react';

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
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic py-2">ไม่มีข้อมูล</p>;
  }

  return (
    <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md font-mono text-xs">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between items-start gap-3">
          <span className="font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">{key}:</span>
          <span className="text-right break-all text-gray-800 dark:text-gray-200">
            {typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)}
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
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', text: 'สำเร็จ' };
      case 1: return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'ล้มเหลว' };
      case 2: return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'เตือน' };
      default: return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', text: 'ไม่ทราบ' };
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return { icon: Plus, color: 'text-green-500' };
      case 'update': return { icon: RefreshCw, color: 'text-orange-500' };
      case 'delete': return { icon: Trash2, color: 'text-red-500' };
      case 'login': return { icon: User, color: 'text-blue-500' };
      default: return { icon: Activity, color: 'text-blue-500' };
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Audit Log - {username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ประวัติการใช้งานของผู้ใช้
          </p>
        </div>
        <button
          onClick={() => fetchUserAuditLogs(username)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:bg-blue-400"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            ตัวกรอง
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {Object.values(filter).some(v => v !== '' && !(typeof v === 'object' && Object.values(v).every(val => val === ''))) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="w-3 h-3" />
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                วันที่เริ่ม
              </label>
              <input
                type="date"
                value={filter.dateRange.start}
                onChange={(e) => setFilter({...filter, dateRange: {...filter.dateRange, start: e.target.value}})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filter.dateRange.end}
                onChange={(e) => setFilter({...filter, dateRange: {...filter.dateRange, end: e.target.value}})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                ฟังก์ชั่นหลัก
              </label>
              <select
                value={filter.mainFunc}
                onChange={(e) => setFilter({...filter, mainFunc: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">ทั้งหมด</option>
                {uniqueValues.mainFuncs.map(func => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                การกระทำ
              </label>
              <select
                value={filter.action}
                onChange={(e) => setFilter({...filter, action: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">ทั้งหมด</option>
                {uniqueValues.actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                สถานะ
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">ทั้งหมด</option>
                <option value="0">สำเร็จ</option>
                <option value="1">ล้มเหลว</option>
                <option value="2">เตือน</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                ค้นหา
              </label>
              <input
                type="text"
                placeholder="ค้นหา..."
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              กำลังโหลด...
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            เกิดข้อผิดพลาด: {error}
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            ไม่พบข้อมูล Audit Log
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {paginatedLogs.map((log) => {
              const isExpanded = expandedLog === log.id;
              const statusInfo = getStatusBadge(log.status);
              const actionInfo = getActionIcon(log.action);
              
              return (
                <div key={log.id} className="p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <actionInfo.icon className={`w-4 h-4 ${actionInfo.color}`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.action}
                        </span>
                      </div>
                      
                      <div className="hidden md:block">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {log.mainFunc}
                        </span>
                      </div>
                      
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusInfo.bg}`}>
                        <statusInfo.icon className={`w-3 h-3 ${statusInfo.color}`} />
                        {statusInfo.text}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDateTime(log.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {log.duration}ms
                        </div>
                      </div>
                      
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Transaction ID:</span>
                          <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{log.txId}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Message:</span>
                          <div className="text-gray-600 dark:text-gray-400">{log.message}</div>
                        </div>
                      </div>
                      
                      {(Object.keys(log.newData).length > 0 || Object.keys(log.oldData).length > 0 || Object.keys(log.resData).length > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {Object.keys(log.newData).length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">ข้อมูลใหม่:</h4>
                              <DataDisplay data={log.newData} />
                            </div>
                          )}
                          {Object.keys(log.oldData).length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">ข้อมูลเดิม:</h4>
                              <DataDisplay data={log.oldData} />
                            </div>
                          )}
                          {Object.keys(log.resData).length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">ผลลัพธ์:</h4>
                              <DataDisplay data={log.resData} />
                            </div>
                          )}
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
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>แสดง:</span>
                <select 
                  value={rowsPerPage} 
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>รายการ</span>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                แสดง {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, filteredLogs.length)} จาก {filteredLogs.length} รายการ
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  ก่อนหน้า
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
