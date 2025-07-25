// /src/components/workflow/list/List.tsx
import
React,
{
  useEffect,
  useMemo,
  useState
}
  from 'react';
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import {
  AlertIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  ErrorIcon,
  GridIcon,
  ListIcon,
} from "@/icons";
import OnBackOnly from "@/components/ui/pagesTemplate/onBackOnly"
// Import the new TicketCard component
import FormCard from './formCard';
// Import the new TableRowActions component
import ButtonAction from './ButtonAction';
import { statusConfig } from '../ui/status/status';
import { FormField, FormManager } from '../interface/FormField';
import DynamicForm from '../form/dynamic-form/DynamicForm';
import { getAvatarIconFromString } from '../avatar/createAvatarFromString';
import { useGetAllFormsQuery, useUpdateStatusMutation } from '@/store/api/formApi';
// TypeScript interfaces
import { v4 as uuidv4 } from 'uuid';


interface SortConfig {
  key: keyof FormManager | null;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  status?: boolean;
  isDraft?: boolean;
  category: string;
  search: string;
}

interface PaginationConfig {
  page: number;
  pageSize: number;
}

interface ConfirmDialog {
  isOpen: boolean;
  type: 'delete' | 'status';
  FormManagerId: string;
  FormManagerName: string;
  newStatus?: FormManager['active'];
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}










const FormListComponent: React.FC = () => {
  const [showDynamicForm, setShowDynamicForm] = useState<boolean>(false);
  const [dynamicEditFormAction, setDynamicEditFormAction] = useState<boolean>(false);
  const [dynamicEditDataFormAction, setDynamicEditDataFormAction] = useState<boolean>(false);
  const [forms, setForms] = useState<FormManager[]>([]);
  const [SelectForm, setSelectForm] = useState<FormField | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: AllFormsData } = useGetAllFormsQuery(null);
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('card');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    isDraft: undefined,
    status: undefined,
    category: '',
    search: ''
  });
  const [updateFormStatus] = useUpdateStatusMutation();
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 10
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    type: 'delete',
    FormManagerId: '',
    FormManagerName: '',
    newStatus: undefined
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');

  const filterOptions = [
    { value: "active", label: "Active", status: true },
    { value: "inactive", label: "Inactive", status: false },
    { value: "draft", label: "Draft", isDraft: true },
  ];

  const paginationOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];
  const handleOnEdit = (form: FormField) => {
    setSelectForm(form)
    setDynamicEditFormAction(true)
    setDynamicEditDataFormAction(true)
    setShowDynamicForm(true)
  }
  const handleOnView = (form: FormField) => {
    setSelectForm(form)
    setDynamicEditFormAction(false)
    setDynamicEditDataFormAction(false)
    setShowDynamicForm(true)
  }
  const handleOnCreate = () => {
    setSelectForm(undefined)
    setDynamicEditFormAction(true)
    setDynamicEditDataFormAction(true)
    setShowDynamicForm(true)
  }
  const onBack = () => {
    setSelectForm(undefined)
    setShowDynamicForm(false)
  }
  // The `dropdownChild` function is no longer needed since actions are handled within TicketCard/TableRowActions
  // const dropdownChild = (): ReactNode => {
  //   const downdownClassName = "flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300";
  //   return (
  //     <>
  //     </>
  //   );
  // };

  useEffect(() => {
    const loadFormManagers = async () => {
      try {
        setLoading(true);
        setError(null);
        AllFormsData && setForms(AllFormsData.data ?? []);
      }
      catch (err) {
        setError('Failed to fetch forms. Please try again.');
        console.error('Error fetching forms:', err);
      }
      finally {
        setLoading(false);
      }
    };

    loadFormManagers();
  }, [AllFormsData]);
  // Add toast notification
  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);

    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Remove toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle search
  const handleSearch = () => {
    setFilterConfig(prev => ({ ...prev, search: searchInput }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle sort
  const handleSort = (key: keyof FormManager) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle filter
  const handleFilter = (key: keyof FilterConfig, value: string) => {
    if (key === 'status') {
      const selectedOption = filterOptions.find(option => option.value === value);
      setFilterConfig(prev => ({
        ...prev,
        status: selectedOption ? selectedOption.status : undefined,
        isDraft: selectedOption ? selectedOption.isDraft : undefined
      }));
    } else {
      setFilterConfig(prev => ({ ...prev, [key]: value }));
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };


  // Clear filters
  const clearFilters = () => {
    setFilterConfig({ category: '', search: '', status: undefined });
    setSearchInput('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleUpdateStatus = async () => {
    // if (!confirmDialog.newStatus) {
    //   return;
    // }
    try {
     
      if (typeof confirmDialog.newStatus === 'undefined') {
        addToast('error', 'New status or Form ID is missing.');
        return;
      }

      let response=await updateFormStatus({
        formId: confirmDialog.FormManagerId,
        active: confirmDialog.newStatus // This must be a boolean here
      }).unwrap();
      if (response?.data?.msg == "Success") {
        setForms(prev => prev.map(f =>
          f.formId === confirmDialog.FormManagerId
            ? { ...f, active: confirmDialog.newStatus ?? f.active }
            : f
        ));
       
        addToast('error', 'Update Unsuccess');
      }
      setConfirmDialog({ isOpen: false, type: 'status', FormManagerId: '', FormManagerName: '' });
    }
    catch (err) {
      addToast('error', `Failed to update Flow status, ${err}`);
    }
  };


  // Filter and sort forms
  const filteredAndSortedFormManagers = useMemo(() => {
    const filtered = forms.filter(form => {
      const matchesSearch = !filterConfig.search ||
        form.formName.toLowerCase().includes(filterConfig.search.toLowerCase());

      const matchesStatus = filterConfig.status === undefined || form.active === filterConfig.status; // Check for undefined to not filter if no status is selected
      const matchesDraft = filterConfig.isDraft === undefined || (form.versions === "draft" && filterConfig.isDraft) || (form.versions !== "draft" && !filterConfig.isDraft); // Assuming 'publish' being false means it's a draft
      const matchesCategory = !filterConfig.category || form.type === filterConfig.category;

      return matchesSearch && matchesStatus && matchesDraft && matchesCategory;
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
  }, [forms, filterConfig, sortConfig]);

  // Paginated forms
  const paginatedFormManagers = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredAndSortedFormManagers.slice(startIndex, endIndex);
  }, [filteredAndSortedFormManagers, pagination]);

  // Pagination info
  const totalPages = Math.ceil(filteredAndSortedFormManagers.length / pagination.pageSize);
  const startEntry = (pagination.page - 1) * pagination.pageSize + 1;
  const endEntry = Math.min(pagination.page * pagination.pageSize, filteredAndSortedFormManagers.length);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // const getUniqueCategories = () => {
  //   return [...new Set(forms.map(w => w.type).filter(Boolean))];
  // };

  // const getUniqueCategoriesOptions = getUniqueCategories()
  //   .filter((category): category is string => typeof category === 'string')
  //   .map(category => ({
  //     value: category,
  //     label: category
  //   }));
  const onSetStatusInactive = (formId: string, formName: string, newStatus: FormManager['active']) => {
    setConfirmDialog({
      isOpen: true,
      type: 'status', // Set type to 'status' for status updates
      FormManagerId: formId,
      FormManagerName: formName,
      newStatus: newStatus, // Pass 'inactive' as the new status
    });
  };
  if (showDynamicForm) {
    return <OnBackOnly onBack={onBack}>
      <div className='rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12'>
        <DynamicForm initialForm={SelectForm} edit={dynamicEditFormAction} editFormData={dynamicEditDataFormAction}  >
        </DynamicForm>
      </div>
    </OnBackOnly>
  }
  return (
    <>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          {/* Loading */}
          {loading && (
            <div className="text-center py-10">Loading forms...</div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-10 text-red-500">{error}</div>
          )}

          {/* Toast Notifications */}
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
              <div
                key={toast.id}
                className={`flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-100' :
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

          <div className="p-0">
            <div className="mx-auto">
              {/* Header */}
              <div className="mb-8">
                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* Search */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                    <Input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search FormManager..."
                      className="w-full sm:w-auto"
                    />
                    <Button
                      onClick={handleSearch}
                      variant="dark"
                      className="h-11 w-full sm:w-auto"
                    >
                      Search
                    </Button>
                  </div>

                  {/* Display Mode Toggle and Create Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                    <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">View:</span>
                    <div className="flex rounded-lg overflow-hidden w-full sm:w-auto">
                      <Button
                        onClick={() => setDisplayMode('card')}
                        className="rounded-r-none flex-grow sm:flex-grow-0"
                        variant={`${displayMode === 'card'
                          ? 'primary'
                          : 'outline'
                          }`}
                      >
                        <GridIcon className="w-4 h-4 mr-2 sm:mr-0" />
                        <span className="sm:hidden">Card</span>
                      </Button>
                      <Button
                        onClick={() => setDisplayMode('table')}
                        className="rounded-l-none flex-grow sm:flex-grow-0"
                        variant={`${displayMode === 'table'
                          ? 'primary'
                          : 'outline'
                          }`}
                      >
                        <ListIcon className="w-4 h-4 mr-2 sm:mr-0" />
                        <span className="sm:hidden">Table</span>
                      </Button>
                    </div>
                    <Button
                      onClick={handleOnCreate}
                      variant="primary"
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      Create Form
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mt-4">
                  {/* Status Filter */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                      value={
                        filterConfig.status === true
                          ? "active"
                          : filterConfig.status === false
                            ? "inactive"
                            : filterConfig.isDraft === true
                              ? "draft"
                              : ""
                      }
                      onChange={(value) => handleFilter('status', value)}
                      options={filterOptions}
                      placeholder="Select Status"
                      className="w-full"
                    />
                  </div>

                  {/* Category Filter */}
                  {/* <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                      value={filterConfig.category}
                      onChange={(value) => handleFilter('category', value)}
                      options={getUniqueCategoriesOptions}
                      placeholder="Select Category"
                      className="w-full"
                    />
                  </div> */}

                  {/* Clear Filters */}
                  {(filterConfig.search || filterConfig.status != undefined || filterConfig.isDraft != undefined) && (
                    <Button
                      onClick={clearFilters}
                      className="h-11 w-full sm:w-auto"
                    >
                      <CloseIcon className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Info */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {startEntry}-{endEntry} of {filteredAndSortedFormManagers.length} forms
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
                  <Select
                    value={pagination.pageSize.toString()}
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
                  {paginatedFormManagers.map((form) => (
                    <FormCard
                      key={uuidv4()}
                      form={form}
                      handleOnEdit={() => handleOnEdit(form)}
                      handleOnView={() => handleOnView(form)}
                      formatDate={formatDate}
                      onSetStatusInactive={onSetStatusInactive}
                    />
                  ))}
                </div>
              ) : (
                /* Table View */
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-none overflow-hidden mb-8">
                  <div className="overflow-x-auto"> {/* Added overflow-x-auto for horizontal scrolling on small screens */}
                    <table className="w-full table-auto"><thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left whitespace-nowrap">
                          <button
                            onClick={() => handleSort('formName')}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            Name
                            {sortConfig.key === 'formName' && (
                              sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap">
                          <button
                            onClick={() => handleSort('active')}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            Status
                            {sortConfig.key === 'active' && (
                              sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap">
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
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Create By
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedFormManagers.map((form) => {
                          const status = form.active === true ? "active" : "inactive"
                          const config = statusConfig[status]

                          return (
                            <tr key={uuidv4()} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{form.formName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">
                                      {/* {form.description} */}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap`}>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                  {status}
                                </span>
                                {form.versions === "draft" && <span className={`px-2 py-1 mx-2 rounded-full text-xs font-medium ${statusConfig["draft"].color}`}>
                                  draft
                                </span>}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(form.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                <div className="flex items-left  gap-2">
                                  {getAvatarIconFromString(form.createdBy, "bg-blue-600 dark:bg-blue-700")}
                                  {form.createdBy}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  <ButtonAction
                                    form={form}
                                    type='list'
                                    onSetStatusChange={onSetStatusInactive}
                                    handleOnEdit={() => handleOnEdit(form)}
                                    handleOnView={() => handleOnView(form)} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                            variant={`${pagination.page === page
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
              {paginatedFormManagers.length === 0 && !loading && !error && (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No forms found</div>
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
            <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({ isOpen: false, type: 'delete', FormManagerId: '', FormManagerName: '' })} className="max-w-4xl p-6">
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
                  ? `Are you sure you want to delete "${confirmDialog.FormManagerName}"?`
                  : `Change "${confirmDialog.FormManagerName}" status to ${confirmDialog.newStatus}?`
                }
              </p>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => setConfirmDialog({ isOpen: false, type: 'delete', FormManagerId: '', FormManagerName: '' })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  variant={`${confirmDialog.type === 'delete'
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

export default FormListComponent;