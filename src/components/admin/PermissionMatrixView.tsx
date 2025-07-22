// /src/components/admin/PermissionMatrixView.tsx
import React, {
  useMemo,
  // useState
} from "react";
import {
  AlertHexaIcon,
  CheckLineIcon,
  // DownloadIcon
} from "@/icons";
import type { Permission, Role } from "@/types/role";
import permissionCategories from "@/mocks/permissionCategories.json";

export const PermissionMatrixView: React.FC<{
  roles: Role[];
  permissions: Permission[];
  onPermissionToggle: (roleId: string, permissionId: string) => void;
}> = ({ roles, permissions, onPermissionToggle }) => {
  // const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const selectedCategory = "all";

  const filteredPermissions = useMemo(() => {
    if (selectedCategory === "all") {
      return permissions;
    }
    return permissions.filter(p => p.categoryId === selectedCategory);
  }, [permissions, selectedCategory]);

  const permissionsByCategory = useMemo(() => {
    return permissionCategories.map(category => ({
      category,
      permissions: filteredPermissions.filter(p => p.categoryId === category.id)
    })).filter(item => item.permissions.length > 0);
  }, [filteredPermissions]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Permission Matrix</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              {permissionCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export Matrix
            </button>
          </div>
        </div>
      </div> */}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700">
                Permission
              </th>
              {roles.map(role => (
                <th key={role.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider min-w-24">
                  <div className="flex flex-col items-center">
                    {/* <div className={`w-6 h-6 rounded ${role.color} mb-1`} /> */}
                    <span className="tracking-wider max-w-20">{role.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {permissionsByCategory.map(({ category, permissions }) => (
              <React.Fragment key={category.id}>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td colSpan={roles.length + 1} className="px-6 py-3">
                    <div className="flex items-center">
                      {/* <category.icon className={`w-5 h-5 mr-2 ${category.color}`} /> */}
                      <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                    </div>
                  </td>
                </tr>
                {permissions.map(permission => (
                  <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 sticky left-0 bg-white dark:bg-gray-800">
                      <div>
                        <div className="flex items-center">
                          <span 
                            className="text-sm font-medium text-gray-900 dark:text-white"
                            title={`${permission.dangerous ? "Dangerous permission" : permission.name}`}
                          >
                            {permission.name}
                          </span>
                          {permission.dangerous && (
                            <AlertHexaIcon className="w-4 h-4 ml-2 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {permission.description}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            permission.level === "read" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                            permission.level === "write" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                            permission.level === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" :
                            "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          }`}>
                            {permission.level}
                          </span>
                          {permission.dependencies && permission.dependencies.length > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400" title={`Depends on: ${permission.dependencies.join(", ")}`}>
                              Dependencies: {permission.dependencies.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {roles.map(role => {
                      const hasPermission = role.permissions.includes(permission.id);
                      const isDisabled = role.isSystem;
                      
                      return (
                        <td key={role.id} className="px-3 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => !isDisabled && onPermissionToggle(role.id, permission.id)}
                              disabled={isDisabled}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                hasPermission 
                                  ? "bg-green-500 border-green-500 text-white" 
                                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                              } ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-green-400"}`}
                            >
                              {hasPermission && <CheckLineIcon className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
