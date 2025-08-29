// /src/components/case/CaseHierarchyView.tsx
import React, { useCallback, useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Plus } from "lucide-react";
import { AlertIcon, CheckCircleIcon, FileIcon, PencilIcon, TaskIcon, TrashBinIcon } from "@/icons";
import type { EnhancedCaseSubType, EnhancedCaseType, TypeAnalytics } from "@/types/case";

// Priority levels configuration
const PRIORITY_LEVELS = [
  { value: 1, label: "Low", color: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 border-green-200 dark:border-green-700" },
  { value: 2, label: "Medium", color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700" },
  { value: 3, label: "High", color: "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100 border-orange-200 dark:border-orange-700" },
  { value: 4, label: "Critical", color: "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 border-red-200 dark:border-red-700" },
  { value: 5, label: "Emergency", color: "bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 border-purple-200 dark:border-purple-700" }
];

const CaseHierarchyContent: React.FC<{
  analytics: Record<string, TypeAnalytics>,
  caseSubTypes: EnhancedCaseSubType[],
  filteredTypes: EnhancedCaseType[],
  showInactive: boolean,
  setCaseTypes: React.Dispatch<React.SetStateAction<EnhancedCaseType[]>>,
  setIsLoading: (value: boolean) => void
}> = ({
  analytics,
  caseSubTypes,
  filteredTypes,
  showInactive,
  setCaseTypes,
  setIsLoading
}) => {
  // State management
  const [caseSubType, setCaseSubType] = useState<EnhancedCaseSubType[]>(caseSubTypes);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(["EMERGENCY"]));

  // Modals and dialogs
  const [, setShowCreateSubTypeModal] = useState(false);
  const [, setShowEditModal] = useState(false);

  const getSubTypesForType = useCallback((typeId: string) => {
    return caseSubType.filter(subType => 
      subType.typeId === typeId && 
      (showInactive || subType.active)
    );
  }, [caseSubType, showInactive]);

  // Event handlers
  const toggleTypeExpansion = (typeId: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeId)) {
      newExpanded.delete(typeId);
    }
    else {
      newExpanded.add(typeId);
    }
    setExpandedTypes(newExpanded);
  };

  const handleCreateSubType = (typeId: string) => {
    setSelectedType(typeId);
    setShowCreateSubTypeModal(true);
  };

  const handleEditType = (type: EnhancedCaseType) => {
    setSelectedType(type.id);
    setShowEditModal(true);
  };

  const handleEditSubType = (subType: EnhancedCaseSubType) => {
    setSelectedSubType(subType.id);
    setShowEditModal(true);
  };

  const handleDeleteType = async (typeId: string) => {
    if (confirm("Are you sure you want to delete this case type? This action cannot be undone.")) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCaseTypes(prev => prev.filter(type => type.id !== typeId));
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleDeleteSubType = async (subTypeId: string) => {
    if (confirm("Are you sure you want to delete this sub-type? This action cannot be undone.")) {
      setIsLoading(true);
      setTimeout(() => {
        setCaseSubType(prev => prev.filter(subType => subType.id !== subTypeId));
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleDuplicateType = (type: EnhancedCaseType) => {
    const newType: EnhancedCaseType = {
      ...type,
      id: Date.now().toString(),
      typeId: `${type.typeId}_COPY`,
      en: `${type.en} (Copy)`,
      th: `${type.th} (สำเนา)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCaseTypes(prev => [...prev, newType]);
  };

  const handleToggleActive = (id: string, isType: boolean) => {
    if (isType) {
      setCaseTypes(prev => prev.map(type => 
        type.id === id ? { ...type, active: !type.active } : type
      ));
    }
    else {
      setCaseSubType(prev => prev.map(subType => 
        subType.id === id ? { ...subType, active: !subType.active } : subType
      ));
    }
  };

  return (
    <div className="space-y-2">
      {filteredTypes.map((type) => {
        const isExpanded = expandedTypes.has(type.typeId);
        const subTypes = getSubTypesForType(type.typeId);
        const analytic = analytics[type.typeId];

        return (
          <div key={type.id}>
            <div 
              className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 xl:flex space-y-2 xl:space-y-0 items-center justify-between border border-gray-200 dark:border-gray-700 ${
                selectedType === type.id ? "bg-blue-100 dark:bg-blue-800" : ""
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTypeExpansion(type.typeId);
                  }}
                  className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-400 dark:text-gray-500"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  ) : (
                    <Folder className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  )}
                  
                  <span className="text-2xl">{type.icon}</span>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {type.en}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({type.th})
                      </span>
                      {!type.active && (
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {type.typeId} • {subTypes.length} sub-types
                      {analytic && (
                        <span className="ml-2">
                          • {analytic.usageCount} cases • {analytic.slaCompliance}% SLA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border-2"
                  style={{ backgroundColor: type.color, borderColor: type.color }}
                />
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateSubType(type.typeId);
                    }}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                    title="Add Sub-Type"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditType(type);
                    }}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    title="Edit Type"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateType(type);
                    }}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    title="Duplicate"
                  >
                    <TaskIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(type.id, true);
                    }}
                    className={`p-1 rounded ${
                      type.active 
                        ? "text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800"
                        : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    title={type.active ? "Deactivate" : "Activate"}
                  >
                    {type.active ? <CheckCircleIcon className="w-4 h-4" /> : <AlertIcon className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteType(type.id);
                    }}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                    title="Delete"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sub-types */}
            {isExpanded && subTypes.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 ml-8 border-t-0">
                {subTypes.map((subType) => {
                  const priorityConfig = PRIORITY_LEVELS.find(p => p.value.toString() === subType.priority);
                  
                  return (
                    <div
                      key={subType.id}
                      className={`p-4 border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 xl:flex space-y-2 xl:space-y-0 items-center justify-between ${
                        selectedSubType === subType.id ? "bg-gray-200 dark:bg-gray-700" : ""
                      }`}
                      onClick={() => setSelectedSubType(subType.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileIcon className="w-4 h-4 text-green-600 dark:text-green-300" />
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {subType.en}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({subType.th})
                            </span>
                            {priorityConfig && (
                              <span className={`px-2 py-1 text-xs border rounded ${priorityConfig.color}`}>
                                {priorityConfig.label}
                              </span>
                            )}
                            {!subType.active && (
                              <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {subType.sTypeCode} • SLA: {subType.caseSla}min • {subType.skillRequirements.length} skills required
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSubType(subType);
                          }}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          title="Edit Sub-Type"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(subType.id, false);
                          }}
                          className={`p-1 rounded ${
                            subType.active
                              ? "text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800"
                              : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          title={subType.active ? "Deactivate" : "Activate"}
                        >
                          {subType.active ? <CheckCircleIcon className="w-4 h-4" /> : <AlertIcon className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubType(subType.id);
                          }}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                          title="Delete"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {isExpanded && subTypes.length === 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No sub-types defined</p>
                <button
                  onClick={() => handleCreateSubType(type.typeId)}
                  className="mt-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 text-sm"
                >
                  Add first sub-type
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CaseHierarchyContent;
