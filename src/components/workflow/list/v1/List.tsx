// /src/components/workflow/list/List.tsx
import
  React,
  {
    useEffect,
    useMemo,
    useState
  }
from 'react';
import { useNavigate } from 'react-router-dom';
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import {
  AlertIcon,
  // AngleRightIcon,
  BoltIcon,
  CalenderIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  ErrorIcon,
  // EyeIcon,
  GridIcon,
  ListIcon,
  MoreDotIcon,
  // PencilIcon,
  // PlusIcon,
  TimeIcon,
  // TrashBinIcon,
  VideoIcon
} from "@/icons";

// TypeScript interfaces
interface Workflow {
  id: string;
  name: string;
  description: string;
  // status: "active" | "inactive" | "draft";

  // Updated: [13-06-2025] v0.1.1
  status: "active" | "inactive" | "draft" | "testing";

  createdAt: string;
  lastRun?: string;
  runCount: number;
  category?: string;
  tags?: string[];
}

interface ApiResponse {
  workflows: Workflow[];
  total: number;
}

// Updated: [13-06-2025] v0.1.1
interface SortConfig {
  key: keyof Workflow | null;
  direction: 'asc' | 'desc';
}

// Updated: [13-06-2025] v0.1.1
interface FilterConfig {
  status: string;
  category: string;
  search: string;
}

// Updated: [13-06-2025] v0.1.1
interface PaginationConfig {
  page: number;
  pageSize: number;
}

// Updated: [13-06-2025] v0.1.1
interface ConfirmDialog {
  isOpen: boolean;
  type: 'delete' | 'status';
  workflowId: string;
  workflowName: string;
  newStatus?: Workflow['status'];
}

// Updated: [13-06-2025] v0.1.1
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

// Mock API function - replace with your actual API call
const fetchWorkflows = async (): Promise<ApiResponse> => {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return {
    workflows: [
      {
        id: '1',
        name: 'Customer Onboarding',
        description: 'Automated workflow for new customer registration and setup',
        status: 'active',
        createdAt: '2025-01-15T10:30:00Z',
        lastRun: '2025-06-11T08:15:00Z',
        runCount: 234
      },
      {
        id: '2',
        name: 'Invoice Processing',
        description: 'Handle incoming invoices and route for approval',
        status: 'active',
        createdAt: '2025-02-20T14:20:00Z',
        lastRun: '2025-06-10T16:45:00Z',
        runCount: 1456
      },
      {
        id: '3',
        name: 'Data Backup',
        description: 'Daily backup of critical system data',
        status: 'inactive',
        createdAt: '2025-01-05T09:00:00Z',
        lastRun: '2025-06-08T02:00:00Z',
        runCount: 89
      },
      {
        id: '4',
        name: 'Email Campaign',
        description: 'Automated marketing email sequences for leads',
        status: 'draft',
        createdAt: '2025-06-10T11:30:00Z',
        runCount: 0
      },
      {
        id: '5',
        name: 'Quality Assurance',
        description: 'Automated testing and quality checks for production releases',
        status: 'active',
        createdAt: '2025-03-12T13:45:00Z',
        lastRun: '2025-06-11T07:30:00Z',
        runCount: 567
      },
      {
        id: '6',
        name: 'User Analytics',
        description: 'Track and analyze user behavior patterns',
        status: 'active',
        createdAt: '2025-04-01T12:00:00Z',
        lastRun: '2025-06-12T09:20:00Z',
        runCount: 892,
        category: 'Analytics',
        tags: ['analytics', 'tracking', 'insights']
      },
      {
        id: '7',
        name: 'Inventory Management',
        description: 'Monitor and manage inventory levels automatically',
        status: 'active',
        createdAt: '2025-05-15T16:30:00Z',
        lastRun: '2025-06-11T14:10:00Z',
        runCount: 124,
        category: 'Operations',
        tags: ['inventory', 'management', 'monitoring']
      },
      {
        id: '8',
        name: 'Security Audit',
        description: 'Regular security checks and vulnerability assessments',
        status: 'inactive',
        createdAt: '2025-02-28T08:45:00Z',
        lastRun: '2025-06-05T22:30:00Z',
        runCount: 67,
        category: 'Security',
        tags: ['security', 'audit', 'compliance']
      },
      {
        id: '9',
        name: 'Customer Onboarding',
        description: 'Automated workflow for new customer registration and setup',
        status: 'active',
        createdAt: '2025-01-15T10:30:00Z',
        lastRun: '2025-06-11T08:15:00Z',
        runCount: 234
      },
      {
        id: '10',
        name: 'Invoice Processing',
        description: 'Handle incoming invoices and route for approval',
        status: 'active',
        createdAt: '2025-02-20T14:20:00Z',
        lastRun: '2025-06-10T16:45:00Z',
        runCount: 1456
      },
      {
        id: '11',
        name: 'Data Backup',
        description: 'Daily backup of critical system data',
        status: 'inactive',
        createdAt: '2025-01-05T09:00:00Z',
        lastRun: '2025-06-08T02:00:00Z',
        runCount: 89
      },
      {
        id: '12',
        name: 'Email Campaign',
        description: 'Automated marketing email sequences for leads',
        status: 'draft',
        createdAt: '2025-06-10T11:30:00Z',
        runCount: 0
      },
      {
        id: '13',
        name: 'Quality Assurance',
        description: 'Automated testing and quality checks for production releases',
        status: 'active',
        createdAt: '2025-03-12T13:45:00Z',
        lastRun: '2025-06-11T07:30:00Z',
        runCount: 567
      },
      {
        id: '14',
        name: 'User Analytics',
        description: 'Track and analyze user behavior patterns',
        status: 'active',
        createdAt: '2025-04-01T12:00:00Z',
        lastRun: '2025-06-12T09:20:00Z',
        runCount: 892,
        category: 'Analytics',
        tags: ['analytics', 'tracking', 'insights']
      },
      {
        id: '15',
        name: 'Inventory Management',
        description: 'Monitor and manage inventory levels automatically',
        status: 'active',
        createdAt: '2025-05-15T16:30:00Z',
        lastRun: '2025-06-11T14:10:00Z',
        runCount: 124,
        category: 'Operations',
        tags: ['inventory', 'management', 'monitoring']
      },
      {
        id: '16',
        name: 'Security Audit',
        description: 'Regular security checks and vulnerability assessments',
        status: 'inactive',
        createdAt: '2025-02-28T08:45:00Z',
        lastRun: '2025-06-05T22:30:00Z',
        runCount: 67,
        category: 'Security',
        tags: ['security', 'audit', 'compliance']
      }
    ],
    total: 5
  };
};

// Updated: [13-06-2025] v0.1.1
const deleteWorkflow = async (id: string): Promise<void> => {
  // await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Deleting workflow ${id}`);
};

// Updated: [13-06-2025] v0.1.1
const updateWorkflowStatus = async (id: string, status: Workflow['status']): Promise<void> => {
  // await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Updating workflow ${id} status to ${status}`);
};

const WorkflowListComponent: React.FC = () => {
  // Updated: [16-06-2025] v0.1.1
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Updated: [13-06-2025] v0.1.1
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('card');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    status: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 10
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    type: 'delete',
    workflowId: '',
    workflowName: '',
    newStatus: undefined
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');

  // Updated: [13-06-2025] v0.1.1
  const filterOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
    { value: "testing", label: "Testing" },
  ];

  // Updated: [13-06-2025] v0.1.1
  const paginationOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchWorkflows();
        setWorkflows(response.workflows);
      }
      catch (err) {
        setError('Failed to fetch workflows. Please try again.');
        console.error('Error fetching workflows:', err);
      }
      finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  // Updated: [13-06-2025] v0.1.1
  // Add toast notification
  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);
    
    // setTimeout(() => {
    //   setToasts(prev => prev.filter(toast => toast.id !== id));
    // }, 4000);
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Updated: [13-06-2025] v0.1.1
  // Remove toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Updated: [13-06-2025] v0.1.1
  // Handle search
  const handleSearch = () => {
    setFilterConfig(prev => ({ ...prev, search: searchInput }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Updated: [13-06-2025] v0.1.1
  // Handle sort
  const handleSort = (key: keyof Workflow) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Updated: [13-06-2025] v0.1.1
  // Handle filter
  const handleFilter = (key: keyof FilterConfig, value: string) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Updated: [13-06-2025] v0.1.1
  // Clear filters
  const clearFilters = () => {
    setFilterConfig({ status: '', category: '', search: '' });
    setSearchInput('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Updated: [13-06-2025] v0.1.1
  // Handle delete workflow
  const handleDeleteWorkflow = async () => {
    try {
      await deleteWorkflow(confirmDialog.workflowId);
      setWorkflows(prev => prev.filter(w => w.id !== confirmDialog.workflowId));
      addToast('success', `Workflow "${confirmDialog.workflowName}" deleted successfully`);
      setConfirmDialog({ isOpen: false, type: 'delete', workflowId: '', workflowName: '' });
    }
    catch (err) {
      addToast('error', `Failed to delete workflow, ${err}`);
    }
  };

  // Updated: [13-06-2025] v0.1.1
  // Handle update workflow status
  const handleUpdateStatus = async () => {
    if (!confirmDialog.newStatus) {
      return;
    }
    
    try {
      await updateWorkflowStatus(confirmDialog.workflowId, confirmDialog.newStatus);
      setWorkflows(prev => prev.map(w => 
        w.id === confirmDialog.workflowId 
          ? { ...w, status: confirmDialog.newStatus! }
          : w
      ));
      addToast('success', `Workflow status updated to ${confirmDialog.newStatus}`);
      setConfirmDialog({ isOpen: false, type: 'status', workflowId: '', workflowName: '' });
    }
    catch (err) {
      addToast('error', `Failed to update workflow status, ${err}`);
    }
  };

  // Updated: [13-06-2025] v0.1.1
  // Navigate to create workflow
  const handleCreateWorkflow = () => {
    console.log('Navigating to create workflow');
    navigate('/workflow/editor/v2');
  };

  // Navigate to read workflow
  const handleReadWorkflow = (workflowId: string) => {
    console.log(`Navigating to read workflow: ${workflowId}`);
    navigate(`/workflow/editor/v2/${workflowId}`);
  };

  // Navigate to update workflow
  const handleUpdateWorkflow = (workflowId: string) => {
    console.log(`Navigating to update workflow: ${workflowId}`);
    navigate(`/workflow/editor/v2/${workflowId}/edit`);
  };

  // Updated: [13-06-2025] v0.1.1
  // Filter and sort workflows
  const filteredAndSortedWorkflows = useMemo(() => {
    const filtered = workflows.filter(workflow => {
      const matchesSearch = !filterConfig.search || 
        workflow.name.toLowerCase().includes(filterConfig.search.toLowerCase()) ||
        workflow.description.toLowerCase().includes(filterConfig.search.toLowerCase());
      
      const matchesStatus = !filterConfig.status || workflow.status === filterConfig.status;
      const matchesCategory = !filterConfig.category || workflow.category === filterConfig.category;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!] ?? '';
        const bValue = b[sortConfig.key!] ?? '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [workflows, filterConfig, sortConfig]);

  // Updated: [13-06-2025] v0.1.1
  // Paginated workflows
  const paginatedWorkflows = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredAndSortedWorkflows.slice(startIndex, endIndex);
  }, [filteredAndSortedWorkflows, pagination]);

  // Updated: [13-06-2025] v0.1.1
  // Pagination info
  const totalPages = Math.ceil(filteredAndSortedWorkflows.length / pagination.pageSize);
  const startEntry = (pagination.page - 1) * pagination.pageSize + 1;
  const endEntry = Math.min(pagination.page * pagination.pageSize, filteredAndSortedWorkflows.length);

  // Updated: [13-06-2025] v0.1.1
  // Status configurations
  const statusConfig = {
    active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Active" },
    inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800",label: "Inactive" },
    draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "Draft" },
    testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Testing" }
  };

  // const getStatusIcon = (status: Workflow['status']) => {
  //   switch (status) {
  //     case 'active':
  //       return <VideoIcon className="w-4 h-4 text-green-500 dark:text-green-400" />;
  //     case 'inactive':
  //       return <ListIcon className="w-4 h-4 text-red-500 dark:text-red-400" />;
  //     case 'draft':
  //       return <TimeIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
  //     default:
  //       return null;
  //   }
  // };

  // const getStatusBadge = (status: Workflow['status']) => {
  //   const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  //   switch (status) {
  //     case 'active':
  //       return `${baseClasses} bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100`;
  //     case 'inactive':
  //       return `${baseClasses} bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100`;
  //     case 'draft':
  //       return `${baseClasses} bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100`;
  //     default:
  //       return baseClasses;
  //   }
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Updated: [13-06-2025] v0.1.1
  const getUniqueCategories = () => {
    return [...new Set(workflows.map(w => w.category).filter(Boolean))];
  };

  // Updated: [12-06-2025] v0.1.2
  const getUniqueCategoriesOptions = getUniqueCategories()
    .filter((category): category is string => typeof category === 'string')
    .map(category => ({
      value: category,
      label: category
    }));

  return (
    <>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          {/* Loading */}
          {loading && (
            <></>
            // <div className="min-h-screen">
            //   <div className="mx-auto">
            //     <div className="animate-pulse">
            //       <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-6"></div>
            //       <div className="space-y-4">
            //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            //           <div className="bg-white dark:bg-white/[0.03] p-4 rounded-lg shadow-sm border">
            //             <div className="text-2xl font-bold text-gray-900 dark:text-white">
            //               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
            //             </div>
            //             <div className="text-sm text-gray-600 dark:text-gray-300">
            //               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            //             </div>
            //           </div>
            //           <div className="bg-white dark:bg-white/[0.03] p-4 rounded-lg shadow-sm border">
            //             <div className="text-2xl font-bold text-green-600 dark:text-green-300">
            //               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
            //             </div>
            //             <div className="text-sm text-gray-600 dark:text-gray-300">
            //               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            //             </div>
            //           </div>
            //           <div className="bg-white dark:bg-white/[0.03] p-4 rounded-lg shadow-sm border">
            //             <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
            //               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
            //             </div>
            //             <div className="text-sm text-gray-600 dark:text-gray-300">
            //               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            //             </div>
            //           </div>
            //         </div>
            //         {[...Array(5)].map((_, index) => (
            //           <div key={index} className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm border">
            //             <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            //             <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
            //             <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            //           </div>
            //         ))}
            //       </div>
            //     </div>
            //   </div>
            // </div>
          )}

          {/* Error */}
          {error && (
            <></>
            // <div className="min-h-screen">
            //   <div className="mx-auto">
            //     <div className="border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            //       <div className="text-red-600 dark:text-red-300 text-lg font-medium mb-2">Error</div>
            //       <div className="text-red-700 dark:text-red-200">{error}</div>
            //       <button 
            //         onClick={() => window.location.reload()}
            //         className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-300 text-white dark:text-gray-900 rounded-lg hover:bg-red-700 dark:hover:bg-red-200 transition-colors"
            //       >
            //         Retry
            //       </button>
            //     </div>
            //   </div>
            // </div>
          )}

          {/* Toast Notifications */}
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
              <div
                key={toast.id}
                className={`flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 ${
                  toast.type === 'success' ? 'bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-100' :
                  toast.type === 'error' ? 'bg-red-100 dark:bg-red-800 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100' :
                  'bg-yellow-100 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-100'
                }`}
              >
                {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-300" />}
                {toast.type === 'error' && <ErrorIcon className="w-5 h-5 text-red-600 dark:text-red-300" />}
                {toast.type === 'warning' && <AlertIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />}
                <span className="text-sm font-medium">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Header */}
          {/*
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300">Manage and monitor your automated workflows</p>
          </div>
          */}

          {/* Stats */}
          {/*
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-white/[0.03] p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{workflows.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Workflows</div>
            </div>
            <div className="bg-white dark:bg-white/[0.03] p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                {workflows.filter(w => w.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
            </div>
            <div className="bg-white dark:bg-white/[0.03] p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {workflows.reduce((sum, w) => sum + w.runCount, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Runs</div>
            </div>
          </div>
          */}

          {/* Workflow List */}
          {/*
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => handleReadWorkflow(workflow.id)}
                className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm border hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(workflow.status)}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        {workflow.name}
                      </h3>
                      <span className={getStatusBadge(workflow.status)}>
                        {workflow.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{workflow.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <CalenderIcon className="w-4 h-4" />
                        Created {formatDate(workflow.createdAt)}
                      </div>
                      {workflow.lastRun && (
                        <div className="flex items-center gap-1">
                          <TimeIcon className="w-4 h-4" />
                          Last run {formatDate(workflow.lastRun)}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">{workflow.runCount}</span> runs
                      </div>
                    </div>
                  </div>
                  
                  <AngleRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-4" />
                </div>
              </div>
            ))}
          </div>
          */}

          {/*
          {workflows.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No workflows found</div>
              <p className="text-gray-400 dark:text-gray-500">Create your first workflow to get started</p>
            </div>
          )}
          */}

          {/* Updated: [13-06-2025] v0.1.1 */}
          <div className="p-0">
            <div className="mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Workflows</h1> */}
                    <p className="text-gray-600 dark:text-gray-300">Manage and monitor your automated workflows</p>
                  </div>
                  <Button
                    onClick={handleCreateWorkflow}
                    variant="primary"
                  >
                    {/* <PlusIcon className="w-5 h-5" /> */}
                    Create Workflow
                  </Button>
                </div>

                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* Search */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={searchInput}
                        // onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search workflows..."
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      variant="dark"
                      className="h-11"
                    >
                      Search
                    </Button>
                  </div>

                  {/* Display Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">View:</span>
                    <div className="flex rounded-lg overflow-hidden">
                      <Button
                        onClick={() => setDisplayMode('card')}
                        className="rounded-r-none"
                        variant={`${
                          displayMode === 'card' 
                            ? 'primary' 
                            : 'outline'
                        }`}
                      >
                        <GridIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setDisplayMode('table')}
                        className="rounded-l-none"
                        variant={`${
                          displayMode === 'table' 
                            ? 'primary' 
                            : 'outline'
                        }`}
                      >
                        <ListIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Select
                      // defaultValue={filterConfig.status}
                      value={filterConfig.status}
                      // onChange={(e) => handleFilter('status', e.target.value)}
                      onChange={(value) => handleFilter('status', value)}
                      options={filterOptions}
                      placeholder="Select Status"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Select
                      // defaultValue={filterConfig.category}
                      value={filterConfig.category}
                      // onChange={(e) => handleFilter('category', e.target.value)}
                      onChange={(value) => handleFilter('category', value)}
                      options={getUniqueCategoriesOptions}
                      placeholder="Select Category"
                    />
                  </div>

                  {/* Clear Filters */}
                  {(filterConfig.search || filterConfig.status || filterConfig.category) && (
                    <Button
                      onClick={clearFilters}
                      className="h-11"
                    >
                      <CloseIcon className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {startEntry}-{endEntry} of {filteredAndSortedWorkflows.length} workflows
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
                  <Select
                    // defaultValue={pagination.pageSize.toString()}
                    value={pagination.pageSize.toString()}
                    // onChange={(e) => setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value), page: 1 }))}
                    onChange={(value) => setPagination(prev => ({ ...prev, pageSize: parseInt(value), page: 1 }))}
                    options={paginationOptions}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">entries</span>
                </div>
              </div>

              {/* Content */}
              {displayMode === 'card' ? (
                /* Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedWorkflows.map((workflow) => {
                    const config = statusConfig[workflow.status];
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={workflow.id}
                        className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                              {config.label}
                            </span>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="xs"
                              >
                                <MoreDotIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{workflow.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <CalenderIcon className="w-4 h-4" />
                            {formatDate(workflow.createdAt)}
                          </div>
                          <div className="font-medium">{workflow.runCount} runs</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleReadWorkflow(workflow.id)}
                            variant="primary"
                          >
                            {/* <EyeIcon className="w-4 h-4 inline mr-1" /> */}
                            View
                          </Button>
                          <Button
                            onClick={() => handleUpdateWorkflow(workflow.id)}
                            variant="warning"
                          >
                            {/* <PencilIcon className="w-4 h-4" /> */}
                            Edit
                          </Button>
                          <Button
                            onClick={() => setConfirmDialog({
                              isOpen: true,
                              type: 'delete',
                              workflowId: workflow.id,
                              workflowName: workflow.name
                            })}
                            variant="error"
                          >
                            {/* <TrashBinIcon className="w-4 h-4" /> */}
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View */
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-none overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('name')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Name
                              {sortConfig.key === 'name' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('status')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Status
                              {sortConfig.key === 'status' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('createdAt')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Created
                              {sortConfig.key === 'createdAt' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('runCount')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Runs
                              {sortConfig.key === 'runCount' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedWorkflows.map((workflow) => {
                          const config = statusConfig[workflow.status];
                          const Icon = config.icon;
                          
                          return (
                            <tr key={workflow.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{workflow.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{workflow.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Select
                                  // defaultValue={workflow.status}
                                  value={workflow.status}
                                  // onChange={(e) => setConfirmDialog({
                                  //   isOpen: true,
                                  //   type: 'status',
                                  //   workflowId: workflow.id,
                                  //   workflowName: workflow.name,
                                  //   newStatus: e.target.value as Workflow['status']
                                  // })}
                                  onChange={(value) => setConfirmDialog({
                                    isOpen: true,
                                    type: 'status',
                                    workflowId: workflow.id,
                                    workflowName: workflow.name,
                                    newStatus: value as Workflow['status']
                                  })}
                                  className={`px-2 py-1 rounded-full text-xs font-medium border-0`}
                                  options={filterOptions}
                                >
                                </Select>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(workflow.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                {workflow.runCount}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => handleReadWorkflow(workflow.id)}
                                    variant="ghost-primary"
                                    title="View"
                                  >
                                    {/* <EyeIcon className="w-4 h-4" /> */}
                                    View
                                  </Button>
                                  <Button
                                    onClick={() => console.log('Edit workflow', workflow.id)}
                                    variant="ghost-warning"
                                    title="Edit"
                                  >
                                    {/* <PencilIcon className="w-4 h-4" /> */}
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => setConfirmDialog({
                                      isOpen: true,
                                      type: 'delete',
                                      workflowId: workflow.id,
                                      workflowName: workflow.name
                                    })}
                                    variant="ghost-error"
                                    title="Delete"
                                  >
                                    {/* <TrashBinIcon className="w-4 h-4" /> */}
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page {pagination.page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            onClick={() => setPagination(prev => ({ ...prev, page }))}
                            variant={`${
                              pagination.page === page
                                ? 'info'
                                : 'primary'
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                      disabled={pagination.page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* No Results */}
              {paginatedWorkflows.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No workflows found</div>
                  <p className="text-gray-400 dark:text-gray-500 mb-4">
                    {filterConfig.search || filterConfig.status || filterConfig.category
                      ? 'Try adjusting your filters or search terms'
                      : 'Create your first workflow to get started'
                    }
                  </p>
                  {(filterConfig.search || filterConfig.status || filterConfig.category) && (
                    <Button
                      onClick={clearFilters}
                      className="h-11"
                      variant="primary"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Dialog */}
          {confirmDialog.isOpen && (
            <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({ isOpen: false, type: 'delete', workflowId: '', workflowName: '' })} className="max-w-4xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmDialog.type === 'delete' ? 'Delete Workflow' : 'Update Status'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {confirmDialog.type === 'delete' 
                      ? 'This action cannot be undone'
                      : 'Change workflow status'
                    }
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-200 mb-6">
                {confirmDialog.type === 'delete' 
                  ? `Are you sure you want to delete "${confirmDialog.workflowName}"?`
                  : `Change "${confirmDialog.workflowName}" status to ${confirmDialog.newStatus}?`
                }
              </p>
              
              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => setConfirmDialog({ isOpen: false, type: 'delete', workflowId: '', workflowName: '' })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDialog.type === 'delete' ? handleDeleteWorkflow : handleUpdateStatus}
                  variant={`${
                    confirmDialog.type === 'delete'
                      ? 'error'
                      : 'primary'
                  }`}
                >
                  {confirmDialog.type === 'delete' ? 'Delete' : 'Update'}
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkflowListComponent;
