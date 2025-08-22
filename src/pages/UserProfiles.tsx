import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserMetaCard from "@/components/UserProfile/UserMetaCard";
import UserInfoCard from "@/components/UserProfile/UserInfoCard";
import UserOrganizationCard from "@/components/UserProfile/UserOrganizationCardCard";
import UserAuditLog from "@/components/UserProfile/UserAuditLog";
import PageMeta from "@/components/common/PageMeta";
import Switch from "@/components/form/switch/Switch";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function UserProfiles() {
  const { t } = useTranslation();
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>("");

  // Get current user's username from localStorage
  useEffect(() => {
    try {
      const profileString = localStorage.getItem("profile");
      if (profileString) {
        const profile = JSON.parse(profileString);
        setCurrentUsername(profile?.username || "");
      }
    } catch (error) {
      console.error("Error parsing profile from localStorage:", error);
    }
  }, []);

  const handleAuditLogToggle = (checked: boolean) => {
    setShowAuditLog(checked);
  };

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Profile" />
      
      <div className="space-y-6">
        {/* Audit Log Toggle Section - ย้ายขึ้นมาบนสุด */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-between mb-6">
          
            <Switch
              label={t('userform.auditLogToggle') || 'แสดง Audit Log'}
            
              onChange={handleAuditLogToggle}
              color="blue"
            />
          </div>

          {/* Audit Log Content */}
          {showAuditLog && currentUsername && (
            <UserAuditLog username={currentUsername} />
          )}
          
          {showAuditLog && !currentUsername && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('userform.cannotLoadUserData') || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'}
            </div>
          )}
        </div>

        {/* Profile Information Section - แสดงเสมอ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="space-y-6">
            <UserMetaCard />
            <UserInfoCard />
            <UserOrganizationCard />
          </div>
        </div>
      </div>
    </>
  );
}
