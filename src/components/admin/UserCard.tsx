// /src/components/admin/UserCard.tsx
import React from "react";
import { CheckLineIcon, CloseIcon, TimeIcon } from "@/icons";
import { formatLastLogin } from "@/utils/crud";
import type { Role, UserEntity } from "@/types/user";

export const UserCard: React.FC<{
  user: UserEntity;
  role: Role;
}> = ({ user, role }) => {
  const statusConfig = {
    "active": { color: "text-green-600 dark:text-green-400", icon: CheckLineIcon },
    "inactive": { color: "text-yellow-600 dark:text-yellow-400", icon: TimeIcon },
    "suspended": { color: "text-red-600 dark:text-red-400", icon: CloseIcon }
  }[user.status];
  const Icon = statusConfig.icon;

  return (
    <>
      <div className={`xl:flex items-start justify-between mb-4 ${user.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}>
        <div className="xl:flex items-center gap-3 min-w-0 xl:flex-1">
          {user.meta?.avatar ? (
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src={user.meta?.avatar} alt="user" />
            </div>
          ) : (
            <div className="w-5 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <div className="xl:flex flex-col gap-1 items-end flex-shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${role?.color} mr-2 xl:mr-0 text-white`}>
            {role?.name || "Guest"}
          </span>
          <span className={`text-xs font-medium ${statusConfig.color} capitalize`}>
            <Icon className="w-4 h-4 inline mr-1" />
            {user.status}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className={`xl:flex items-center justify-between ${user.status === "suspended" ? "opacity-50 dark:opacity-70" : ""}`}>
        <div className="xl:flex items-center gap-4 text-xs ">
          <div className="xl:flex items-center gap-1 min-h-4">
            <span className="text-gray-900 dark:text-white">{user.jobTitle}</span>
          </div>
        </div>
        
        {user.lastLogin && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Last Login {formatLastLogin(user.lastLogin)}
            </span>
          </div>
        )}
      </div>
    </>
  );
};
