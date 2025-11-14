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
import {
  AlertIcon,
  CheckCircleIcon,
  CloseIcon,
  ErrorIcon,
  GridIcon,
  ListIcon,
} from "@/icons";
import OnBackOnly from "@/components/ui/pagesTemplate/onBackOnly"
import FormCard from './formCard';

import { FormManager } from '../interface/FormField';
import DynamicForm from '../form/dynamic-form/DynamicForm';
import { useGetAllFormsQuery, useUpdateStatusMutation } from '@/store/api/formApi';
import { v4 as uuidv4 } from 'uuid';
import ListViewFormManager from './ListView';
import FormVersionsModal from './formVersionModal';


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


interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}










const FormManagerComponent: React.FC = () => {
  const [showDynamicForm, setShowDynamicForm] = useState<boolean>(false);
  const [dynamicEditFormAction, setDynamicEditFormAction] = useState<boolean>(false);
  const [dynamicEditDataFormAction, setDynamicEditDataFormAction] = useState<boolean>(false);
  const [forms, setForms] = useState<FormManager[]>([]);
  const [SelectForm, setSelectForm] = useState<FormManager | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: AllFormsData, isLoading } = useGetAllFormsQuery(null
    , { refetchOnMountOrArgChange: true }
  );

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
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const filterOptions = [
    { value: "active", label: "Active", status: true },
    { value: "inactive", label: "Inactive", status: false },
    { value: "draft", label: "Draft", isDraft: true },
  ];
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false)
  const paginationOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];
  const handleOnEdit = (form: FormManager) => {
    setSelectForm(form)
    setDynamicEditFormAction(true)
    setDynamicEditDataFormAction(true)
    setShowDynamicForm(true)
  }

  const handleOnView = (form: FormManager) => {
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await getFormLinkWf(null);
  //       if (response?.data?.data) {
  //         setSelectFormLinkWf(response.data.data);
  //       }
  //     } catch (error) {
  //       addToast('error', `${error}`);
  //     }
  //   };

  //   fetchData();
  // }, [SelectForm]);


  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
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

  // Handles status update for a form
  const handleUpdateStatus = async (
    formId: string,
    formName: string,
    newStatus: FormManager['active']
  ) => {
    try {
      const response = await updateFormStatus({
        formId,
        active: newStatus,
      }).unwrap();

      if (response?.msg === "Success") {
        setForms(prev =>
          prev.map(f =>
            f.formId === formId
              ? { ...f, active: newStatus }
              : f
          )
        );
        addToast(
          'success',
          `Form "${formName}" has been set to ${newStatus ? "Active" : "Inactive"}.`
        );
      } else {
        addToast(
          'error',
          response?.data?.msg || `Failed to update status for "${formName}".`
        );
      }
    } catch (err) {
      addToast(
        'error',
        `Failed to update status for "${formName}". ${(err as any)?.message || err}`
      );
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Filter and sort forms
  const filteredAndSortedFormManagers = useMemo(() => {
    const filtered = forms.filter(form => {
      const matchesSearch = !filterConfig.search ||
        form.formName.toLowerCase().includes(filterConfig.search.toLowerCase()) ||
        formatDate(form.createdAt!).toLowerCase().includes(filterConfig.search.toLowerCase());
      ;

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




  const onSetStatusInactive = async (formId: string, formName: string, newStatus: FormManager['active']) => {

    handleUpdateStatus(formId, formName, newStatus)

  };
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOnVersion = (form: FormManager) => {
    setSelectForm(form)
    setShowVersionModal(true)
  }


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
          {SelectForm && <FormVersionsModal isOpen={showVersionModal} onClose={() => {
            setShowVersionModal(false)
            setSelectForm(undefined)
          }} form={SelectForm} />}
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
                      onKeyDown={handleKeyDown}
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
                      setForms={setForms}
                      handleOnEdit={() => handleOnEdit(form)}
                      handleOnView={() => handleOnView(form)}
                      formatDate={formatDate}
                      onSetStatusInactive={onSetStatusInactive}
                      handleOnVersion={handleOnVersion}
                    />
                  ))}
                </div>
              ) : (
                /* Table View */
                <ListViewFormManager
                  forms={paginatedFormManagers}
                  handleSort={handleSort}
                  sortConfig={sortConfig}
                  formatDate={formatDate}
                  setForms={setForms}
                  onSetStatusInactive={onSetStatusInactive}
                  handleOnEdit={handleOnEdit}
                  handleOnView={handleOnView}
                  handleOnVersion={handleOnVersion}
                />
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
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">{isLoading ? "Loading..." : "No forms found"}</div>
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
          {/* <ConfirmationModal
            isOpen={showPubModal}
            onClose={() => {
              setSelectForm(undefined)
              setShowPubModal(false)
            }}
            onConfirm={() => {
              SelectForm && handleOnPubUnPub(SelectForm)
              setSelectForm(undefined)
            }}
            title={SelectForm?.publish ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            description={SelectForm?.publish ? "คุณต้องการที่จะเปิดใช้งานฟอร์มนี้ใช่ไหม" : "คุณต้องการที่จะปิดใช้งานฟอร์มนี้ใช่ไหม"}

            confirmButtonVariant="error"

          /> */}
        </div>
      </div>
    </>
  );
};

export default FormManagerComponent;