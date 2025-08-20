import React, { useState, useMemo, useEffect } from 'react';
// Since this is a self-contained example, we'll mock the Link component.
const Link = ({ to, children, className }: { to: string, children: React.ReactNode, className: string }) => (
    <a href={to} className={className}>{children}</a>
);
import {
    Search,
    Filter,
    Calendar,
    User,
    Activity,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Hash,
    FileText,
    Zap,
    RefreshCw,
    Plus,
    Trash2,
    Info,
    Loader2,
    ServerCrash,
} from 'lucide-react';

// --- Breadcrumb Component (As Provided) ---
interface BreadcrumbItem {
    label: string;
    href?: string;
}
interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    const currentPageTitle = items[items.length - 1].label;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {currentPageTitle}
            </h2>
            <nav>
                <ol className="flex items-center gap-1.5">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                            <li key={index} className="flex items-center gap-1.5">
                                {!isLast ? (
                                    <>
                                        <Link
                                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                            to={item.href || "#"}
                                        >
                                            {item.label}
                                        </Link>
                                        <svg
                                            className="stroke-current text-gray-400"
                                            width="17"
                                            height="16"
                                            viewBox="0 0 17 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6.0765 12.667L1.2432 8.50033L6.0765 4.33366"
                                                stroke="currentColor"
                                                strokeWidth="1.2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-800 dark:text-white/90">
                                        {item.label}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};


// --- Types ---
interface AuditLog {
    id: number;
    username: string;
    txId: string;
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
    username: string;
    mainFunc: string;
    subFunc: string;
    action: string;
    status: string;
    search: string;
}

// User data type from API
interface UserFromAPI {
    id: string;
    username: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    [key: string]: any; // Allow other properties
}


// --- Helper component for rendering data objects ---
const DataDisplay = ({ data }: { data: any }) => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        return <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic py-2">No data</p>;
    }

    return (
        <div className="space-y-1.5 p-3 bg-white dark:bg-gray-800 rounded-md font-mono text-xs">
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

// --- MOCK DATA ---
const mockLogs: AuditLog[] = [
    {
        id: 1,
        username: 'apiwat.rod',
        txId: 'TRX-172570194624-0',
        mainFunc: 'user',
        subFunc: 'profile',
        nameFunc: 'createUserProfile',
        action: 'create',
        status: 0, // Success
        duration: 0.123,
        newData: { displayName: 'Janny', email: 'apiwat.rod@skyao.co.th', active: true },
        oldData: {},
        resData: { success: true, userId: '1' },
        message: "User 'apiwat.rod' profile was created successfully.",
        createdAt: '2025-07-15T16:03:14Z',
    },
    {
        id: 2,
        username: 'sara.w',
        txId: 'TRX-172561554624-1',
        mainFunc: 'user',
        subFunc: 'profile',
        nameFunc: 'updateUserProfile',
        action: 'update',
        status: 0, // Success
        duration: 0.256,
        newData: { displayName: 'Sara Wilson' },
        oldData: { displayName: 'Sara W.' },
        resData: { success: true, userId: '2' },
        message: "User 'sara.w' profile was updated successfully.",
        createdAt: '2025-07-14T10:15:30Z',
    },
    {
        id: 3,
        username: 'admin',
        txId: 'TRX-172552914624-2',
        mainFunc: 'system',
        subFunc: 'settings',
        nameFunc: 'updateConfig',
        action: 'update',
        status: 2, // Warning
        duration: 0.089,
        newData: { timeout: 60 },
        oldData: { timeout: 30 },
        resData: { success: true, requiresRestart: true },
        message: "System setting 'timeout' updated. Service restart recommended.",
        createdAt: '2025-07-13T08:00:15Z',
    },
    {
        id: 4,
        username: 'john.doe',
        txId: 'TRX-172544274624-3',
        mainFunc: 'billing',
        subFunc: 'invoice',
        nameFunc: 'generateInvoice',
        action: 'create',
        status: 1, // Failed
        duration: 1.542,
        newData: { customerId: 'CUST-123', amount: 99.99 },
        oldData: {},
        resData: { success: false, error: 'Insufficient funds' },
        message: "Failed to generate invoice for customer CUST-123.",
        createdAt: '2025-07-12T14:30:05Z',
    },
     {
        id: 5,
        username: 'apiwat.rod',
        txId: 'TRX-172535634624-4',
        mainFunc: 'user',
        subFunc: 'authentication',
        nameFunc: 'userLogin',
        action: 'login',
        status: 0, // Success
        duration: 0.312,
        newData: { ipAddress: '192.168.1.100', userAgent: 'Chrome/125.0.0.0' },
        oldData: {},
        resData: { success: true, tokenGenerated: true },
        message: "User 'apiwat.rod' logged in successfully.",
        createdAt: '2025-07-11T22:11:10Z',
    },
];


export default function App() {
    // --- STATE MANAGEMENT ---
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [usernames, setUsernames] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedLog, setExpandedLog] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filter, setFilter] = useState<AuditFilter>({
        dateRange: { start: '', end: '' },
        username: '',
        mainFunc: '',
        subFunc: '',
        action: '',
        status: '',
        search: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- DATA HANDLING ---
    const API = import.meta.env.VITE_API_BASE_URL || 'https://cmsapi-production-488d.up.railway.app';

    const handleFetchLogs = () => {
        setLoading(true);
        setError(null);
        
        const simulateError = false; 

        setTimeout(() => {
            if (simulateError) {
                setError("Failed to fetch data");
                setLogs([]);
            } else {
                setLogs(mockLogs);
            }
            setLoading(false);
        }, 500);
    };
    
    // Updated function to fetch users for the filter via API
   // Updated function to fetch users for the filter via API
// Updated function to fetch users for the filter via API
    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                // Silently fail for the filter, or you can set an error state
                console.error("Access token not found for fetching users.");
                return;
            }

            const response = await fetch(`${API}/api/v1/users?start=0&length=50`, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.status !== "0") {
                throw new Error(result.msg || "API returned an error while fetching users.");
            }

            // FIX: Assert the type of the mapped array to string[]
            const usernamesFromApi = result.data.map((user: UserFromAPI) => user.username) as string[];
            const uniqueUsernames = [...new Set(usernamesFromApi)].sort();
            setUsernames(uniqueUsernames);

        } catch (err: any) {
            // Handle error for user fetching, e.g., log to console
            console.error("Error fetching users for filter:", err);
        }
    };
    // Initial data fetch
    useEffect(() => {
        handleFetchLogs();
        fetchUser();
    }, []);

    // --- MEMOIZED COMPUTATIONS ---
    const uniqueValues = useMemo(() => {
        return {
            mainFuncs: [...new Set(mockLogs.map(log => log.mainFunc))].sort(),
            subFuncs: [...new Set(mockLogs.map(log => log.subFunc))].sort(),
            actions: [...new Set(mockLogs.map(log => log.action))].sort()
        };
    }, []); // Based on static mock data

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const logDate = new Date(log.createdAt);
            const startDate = filter.dateRange.start ? new Date(filter.dateRange.start) : null;
            const endDate = filter.dateRange.end ? new Date(filter.dateRange.end) : null;
            
            if (startDate && logDate < startDate) return false;
            if (endDate && logDate > endDate) return false;

            if (filter.username && log.username !== filter.username) return false;
            if (filter.mainFunc && log.mainFunc !== filter.mainFunc) return false;
            if (filter.subFunc && log.subFunc !== filter.subFunc) return false;
            if (filter.action && log.action !== filter.action) return false;
            if (filter.status !== '' && log.status !== parseInt(filter.status)) return false;

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

    // --- HELPER FUNCTIONS & HANDLERS ---
    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0: return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Success' };
            case 1: return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', text: 'Failed' };
            case 2: return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'Warning' };
            default: return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', text: 'Unknown' };
        }
    };

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create': return { icon: Plus, color: 'text-green-500' };
            case 'update': return { icon: RefreshCw, color: 'text-blue-500' };
            case 'delete': return { icon: Trash2, color: 'text-red-500' };
            case 'login': return { icon: User, color: 'text-indigo-500' };
            default: return { icon: Activity, color: 'text-gray-500 dark:text-gray-400' };
        }
    };

    const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
    };

    const clearFilters = () => {
        setFilter({
            dateRange: { start: '', end: '' },
            username: '', mainFunc: '', subFunc: '', action: '', status: '', search: ''
        });
    };

    const breadcrumbItems = [
        { label: "Home", href: "#" },
        { label: "System Configuration", href: "#" },
        { label: "Audit Log" }
    ];

    // --- RENDER ---
    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300 font-sans">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <PageBreadcrumb items={breadcrumbItems} />

                <div className="bg-white dark:bg-gray-900/50 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search logs..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                        </div>
                        <button onClick={handleFetchLogs} className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Refresh Data"><RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} /></button>
                        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 text-sm">
                            <Filter className="w-4 h-4" /><span>Filters</span>
                            {[filter.username, filter.mainFunc, filter.subFunc, filter.action, filter.status, filter.dateRange.start, filter.dateRange.end].filter(Boolean).length > 0 && (<span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">{[filter.username, filter.mainFunc, filter.subFunc, filter.action, filter.status, filter.dateRange.start, filter.dateRange.end].filter(Boolean).length}</span>)}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time Range</label>
                                    <div className="flex gap-2">
                                        <input type="datetime-local" value={filter.dateRange.start} onChange={(e) => setFilter({ ...filter, dateRange: { ...filter.dateRange, start: e.target.value } })} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:[color-scheme:dark]" />
                                        <input type="datetime-local" value={filter.dateRange.end} onChange={(e) => setFilter({ ...filter, dateRange: { ...filter.dateRange, end: e.target.value } })} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:[color-scheme:dark]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                    <select value={filter.username} onChange={(e) => setFilter({ ...filter, username: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                        <option value="">All Users</option>
                                        {usernames.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                                    <select value={filter.action} onChange={(e) => setFilter({ ...filter, action: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                        <option value="">All Actions</option>
                                        {uniqueValues.actions.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                        <option value="">All Status</option>
                                        <option value="0">Success</option>
                                        <option value="1">Failed</option>
                                        <option value="2">Warning</option>
                                    </select>
                                </div>
                                <div className="flex items-end sm:col-start-4">
                                    <button onClick={clearFilters} className="w-full text-center px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-700 rounded-lg">Clear All</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900/50 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User / Transaction</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Function</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center p-12"><div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /><span>Loading Data...</span></div></td></tr>
                                ) : error ? (
                                    <tr><td colSpan={5} className="text-center p-12"><div className="flex flex-col justify-center items-center gap-2 text-red-500"><ServerCrash className="w-8 h-8" /><span>Error: {error}</span><span className="text-xs text-gray-400">Please check the console or try again later.</span></div></td></tr>
                                ) : paginatedLogs.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center p-12"><div className="flex flex-col justify-center items-center gap-2 text-gray-500 dark:text-gray-400"><Search className="w-8 h-8" /><span>No Logs Found</span><span className="text-xs">Try adjusting your filters.</span></div></td></tr>
                                ) : (
                                    paginatedLogs.map((log) => {
                                        const isExpanded = expandedLog === log.id;
                                        const statusInfo = getStatusBadge(log.status);
                                        const actionInfo = getActionIcon(log.action);
                                        return (
                                            <React.Fragment key={log.id}>
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors" onClick={() => setExpandedLog(isExpanded ? null : log.id)}>
                                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="mt-1 flex-shrink-0">{isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</div><div><div className="flex items-center gap-2"><User className="w-3 h-3" /><span className="font-medium text-gray-900 dark:text-white">{log.username}</span></div><div className="flex items-center gap-2 mt-1"><Hash className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{log.txId}</span></div></div></div></td>
                                                    <td className="px-6 py-4"><div><div className="font-medium text-gray-900 dark:text-white capitalize">{log.mainFunc}</div><div className="text-xs text-gray-500 dark:text-gray-400">{log.subFunc}/{log.nameFunc}</div></div></td>
                                                    <td className="px-6 py-4"><div className="flex items-center gap-2"><actionInfo.icon className={`w-4 h-4 ${actionInfo.color}`} /><span className="capitalize">{log.action}</span></div></td>
                                                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}><statusInfo.icon className="w-3 h-3" />{statusInfo.text}</span></td>
                                                    <td className="px-6 py-4"><div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Calendar className="w-3 h-3" /><span>{new Date(log.createdAt).toLocaleString()}</span></div></td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={5} className="p-0">
                                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6">
                                                                <div className="max-w-full ml-9 space-y-4">
                                                                    <div className="p-4 bg-white dark:bg-gray-900/50 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700/50">
                                                                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Message</h4>
                                                                        <p className="text-sm text-gray-900 dark:text-white font-mono">{log.message}</p>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30">
                                                                            <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Old Data</h4>
                                                                            <DataDisplay data={log.oldData} />
                                                                        </div>
                                                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
                                                                            <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Plus className="w-4 h-4" /> New Data</h4>
                                                                            <DataDisplay data={log.newData} />
                                                                        </div>
                                                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                                                                            <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Response Data</h4>
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
                    {filteredLogs.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Rows per page:</span>
                                    <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Showing <span className="font-medium text-gray-700 dark:text-gray-300">{(currentPage - 1) * rowsPerPage + 1}</span>-<span className="font-medium text-gray-700 dark:text-gray-300">{Math.min(currentPage * rowsPerPage, filteredLogs.length)}</span> of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredLogs.length}</span> logs</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300">Previous</button>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300">Next</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
