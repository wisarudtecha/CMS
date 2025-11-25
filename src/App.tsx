// /src/App.tsx
// React Imports
import { BrowserRouter as Router, Routes, Route } from "react-router";

// Template Imports
import { ScrollToTop } from "@/components/common/ScrollToTop";
import DynamicForm from "@/components/form/dynamic-form/DynamicForm";
import AppLayout from "@/layout/AppLayout";
import SignIn from "@/pages/AuthPages/SignIn";
import SignUp from "@/pages/AuthPages/SignUp";
import Blank from "@/pages/Blank";
import Calendar from "@/pages/Calendar";
import LineChart from "@/pages/Charts/LineChart";
import BarChart from "@/pages/Charts/BarChart";
// import Home from "@/pages/Dashboard/Home";
import FormElements from "@/pages/Forms/FormElements";
import NotFound from "@/pages/OtherPage/NotFound";
import Alerts from "@/pages/UiElements/Alerts";
import Avatars from "@/pages/UiElements/Avatars";
import Badges from "@/pages/UiElements/Badges";
import Buttons from "@/pages/UiElements/Buttons";
import ButtonsCustomize from "@/pages/UiElements/ButtonsCustomize";
import Images from "@/pages/UiElements/Images";
import Tabs from "@/pages/UiElements/Tabs";
import Videos from "@/pages/UiElements/Videos";
import BasicTables from "@/pages/Tables/BasicTables";
import UserProfiles from "@/pages/UserProfiles";

// Case Management Imports
import CasesAssignment from "@/pages/Case/caseAssignment";
import CaseHistoryPage from "@/pages/Case/CaseHistory";
// Case Management (No Longer Used) Imports
// import CasesView from "@/pages/Case/caseView";
// import Kanban from "@/pages/Task/kanban";

// Dashboard Imports
import Dashboard from "@/components/dashboard/Dashboard";
// Dashboard Mock Data (Archived) Imports
import AgentStatusDashboard from "@/components/dashboard/AgentStatusDashboard";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import CallcenterDashboard from "@/components/dashboard/CallcenterDashboard";
import ServiceDashboard from "@/components/dashboard/ServiceDashboard";

// Form Builder Imports
import FormManagement from "@/pages/Forms/FormManagement"
// Form Builder (No Longer Used) Imports
// import LoadDynamicFrom from "@/components/form/dynamic-form/LoadDynamicForm";

// Workflow Imports
import WorkflowListPage from "@/pages/Workflow/List";
import WorkflowEditorPage from "@/pages/Workflow/Editor";
// Workflow (Archived Version) Imports
import WorkflowEditorV1Page from "@/pages/Workflow/v1/Editor";
import WorkflowEditorV2Page from "@/pages/Workflow/v2/Editor";

// User Management Imports
import UserManagementPage from "@/pages/Admin/UserManagement";
import UserForm from "@/pages/Admin/UserForm";
import RolePrivilegeManagementPage from "@/pages/Admin/RolePrivilegeManagement";
import OrganizationManagementPage from "@/pages/Admin/OrganizationManagement";
import AuditLog from "@/pages/Admin/AuditLog";

// System Configuration Imports
import AreaManagementPage from "@/pages/Admin/AreaManagement";
import PropertyManagementPage from "@/pages/Admin/PropertyManagement";
import ServiceManagementPage from "@/pages/Admin/ServiceManagement";
import SkillManagementPage from "@/pages/Admin/SkillManagement";
import UnitFormPage from "@/pages/Admin/UnitForm";
import UnitManagementPage from "@/pages/Admin/UnitManagement";

// Authentication Imports
import { AuthenticatedContent } from "@/components/auth/AuthenticatedContent";

// Security & Error Handling Imports
import ErrorBoundary from "@/components/security/ErrorBoundary";
import LoadingSystem from "@/components/ui/loading/LoadingSystem";
import SecurityAlerts from "@/components/security/SecurityAlerts";
import OfflineState from "@/components/offline/OfflineManager";

// Custom Theme Imports
import ThemeDebugger from "@/components/debug/ThemeDebugger";
import CaseDetailView from "@/components/case/CaseDetailView";
import CaseDetailViewSchedule from "./components/case/createCase/createCaseSchedule";
import CaseCreation from "./components/case/createCase/createCase";
import ReportPage from "./pages/Report/Report";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Lingui (No Longer Used) Imports
// import { i18n } from "@lingui/core";
// import { I18nProvider } from "@lingui/react";
// import { messages as enMessages } from "@/locales/en/messages";
// import { messages as thMessages } from "@/locales/th/messages";
// import Lingui from "@/pages/Test/Lingui";
// i18n.load({
//   en: enMessages,
//   th: thMessages,
// });
// i18n.activate("en");

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Dashboard Layout */}
        <Route element={<AppLayout />}>
          {/* Home Page */}
          {/* <Route index path="/" element={<Home />} /> */}
          <Route path="/" element={<ServiceDashboard />} />

          {/* Case Management (Latest) */}
          <Route path="/case/assignment" element={<CasesAssignment />} />
          <Route path="/case/creation" element={<ProtectedRoute requiredPermissions={["case.create"]}><CaseCreation/></ProtectedRoute>} />
          <Route path="/case/creation_schedule_date" element={<ProtectedRoute requiredPermissions={["case.create"]}><CaseDetailViewSchedule caseData={undefined}/></ProtectedRoute>}/>
          <Route path="/case/history" element={<CaseHistoryPage />} />
          {/* Case Management (Archived) */}
          <Route path="/case-assignment" element={<CasesAssignment />} />
          <Route path="/case-creation" element={<ProtectedRoute requiredPermissions={["case.create"]}><CaseCreation/></ProtectedRoute>} />
          <Route path="/case/:caseId" element={<ProtectedRoute requiredPermissions={["case.assign"]}><CaseDetailView /></ProtectedRoute>} />
          {/* Case Management (No Longer Used) */}
          {/* <Route path="/case-view" element={<CasesView />} /> */}
          {/* <Route path="/kanban" element={<Kanban />} /> */}

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Dashboard Mock Data (Archived) */}
          <Route path="/dashboard/agent-status" element={<AgentStatusDashboard />} />
          <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
          <Route path="/dashboard/callcenter" element={<CallcenterDashboard />} />
          <Route path="/dashboard/service" element={<ServiceDashboard />} />

          {/* Forms Builder */}
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/dynamic-form" element={<ProtectedRoute requiredPermissions={["form.create"]}><DynamicForm enableSelfBg={true}/></ProtectedRoute>} />
          <Route path="/form-management" element={<FormManagement />} />
          {/* Forms Builder (No Longer Used) */}
          {/* <Route path="/load-dynamic-form" element={<LoadDynamicFrom />} /> */}

          {/* Workflow Management (SOP) */}
          <Route path="/workflow/list" element={<WorkflowListPage />} />
          {/* Workflow Builder (Latest Version: v0.3.0) */}
          <Route path="/workflow/editor/v3" element={<WorkflowEditorPage />} />
          <Route path="/workflow/editor/v3/:id" element={<WorkflowEditorPage />} />
          <Route path="/workflow/editor/v3/:id/:action" element={<WorkflowEditorPage />} />
          {/* Workflow Builder (Archived Version: v0.1.0) */}
          <Route path="/workflow/editor/v1" element={<WorkflowEditorV1Page />} />
          <Route path="/workflow/editor/v1/:id" element={<WorkflowEditorV1Page />} />
          <Route path="/workflow/editor/v1/:id/:action" element={<WorkflowEditorV1Page />} />
          {/* Workflow Builder (Archived Version: v0.2.0) */}
          <Route path="/workflow/editor/v2" element={<WorkflowEditorV2Page />} />
          <Route path="/workflow/editor/v2/:id" element={<WorkflowEditorV2Page />} />
          <Route path="/workflow/editor/v2/:id/:action" element={<WorkflowEditorV2Page />} />
	  
          {/* Report */}
          <Route path="/report" element={<ReportPage />} />

          {/* User Management */}
          <Route path="/user" element={<UserManagementPage />} />
          <Route path="/user/create" element={<UserForm />} />
          <Route path="/user/edit/:id" element={<UserForm />} />
          <Route path="/user/:id" element={<UserForm />} /> 
          <Route path="/role-privilege" element={<RolePrivilegeManagementPage />} />
          <Route path="/organization" element={<OrganizationManagementPage />} />
          <Route path="/auditlog" element={<AuditLog />} />

          {/* System Configuration */}
          <Route path="/area" element={<AreaManagementPage />} />
          <Route path="/property" element={<PropertyManagementPage />} />
          <Route path="/service" element={<ServiceManagementPage />} />
          <Route path="/skill" element={<SkillManagementPage />} />
          <Route path="/unit" element={<UnitManagementPage />} />
          <Route path="/unit/create" element={<UnitFormPage />} />
          <Route path="/unit/:id" element={<UnitFormPage />} />
          <Route path="/unit/:id/edit" element={<UnitFormPage />} />

          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          {/* <Route path="/kanban" element={<Kanban />} /> */}
          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />
          {/* Ui Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/buttons-customize" element={<ButtonsCustomize />} />
          <Route path="/images" element={<Images />} />
          <Route path="/tabs" element={<Tabs />} />
          <Route path="/videos" element={<Videos />} />
          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          {/* Authentication */}
          <Route path="/authenticate" element={<AuthenticatedContent />} />
          {/* Security & Error Handling */}
          <Route path="/security/error-boundaries" element={<ErrorBoundary />} />
          <Route path="/security/loading-system" element={<LoadingSystem />} />
          <Route path="/security/security-alerts" element={<SecurityAlerts />} />
          <Route path="/security/offline-state" element={<OfflineState />} />

          {/* Test Page */}
          {/* Lingui (No Longer Used) */}
          {/* <Route path="/test/lingui" element={<Lingui />} /> */}
          {/* Custom Theme */}
          <Route path="/theme-debugger" element={<ThemeDebugger />} />
        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
