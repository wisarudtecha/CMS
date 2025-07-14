// /src/App.tsx
// React Imports
import { BrowserRouter as Router, Routes, Route } from "react-router";

// Template Imports
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import ButtonsCustomize from "./pages/UiElements/ButtonsCustomize";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import DynamicForm from "./components/form/dynamic-form/DynamicForm";
import Blank from "./pages/Blank";
import Home from "./pages/Dashboard/Home";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Authentication Imports
import { AuthenticatedContent } from "@/components/auth/AuthenticatedContent";

// Case Management Imports
import CasesAssignment from "./pages/Case/caseAssignment";
import CaseCreation from "./components/case/CaseCreation";
import CaseHistoryPage from "./pages/Case/CaseHistory";
// Case Management (Archived) Imports 
import Kanban from "./pages/Task/kanban";
// Case Management (No Longer Used) Imports
// import CasesView from "./pages/Case/caseView";

// Dashboard Imports
import Dashboard from "./components/dashboard/Dashboard";
// Dashboard Mock Data (Archived) Imports
import AgentStatusDashboard from "@/components/dashboard/AgentStatusDashboard";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import CallcenterDashboard from "@/components/dashboard/CallcenterDashboard";
import ServiceDashboard from "@/components/dashboard/ServiceDashboard";

// Form Builder Imports
import FormManagement from "./pages/Forms/FormManagement"
// Form Builder (Archived) Imports
import LoadDynamicFrom from "./components/form/dynamic-form/LoadDynamicForm";

// Workflow Imports
import WorkflowListPage from "./pages/Workflow/List";
import WorkflowEditorPage from "./pages/Workflow/Editor";
// Workflow (Archived Version) Imports
import WorkflowEditorV1Page from "./pages/Workflow/v1/Editor";

// Lingui (No Longer Used) Imports
// import { i18n } from "@lingui/core";
// import { I18nProvider } from "@lingui/react";
// import { messages as enMessages } from "./locales/en/messages";
// import { messages as thMessages } from "./locales/th/messages";
// import Lingui from "./pages/Test/Lingui";
// i18n.load({
//   en: enMessages,
//   th: thMessages,
// });
// i18n.activate("en");

export default function App() {
  return (
    // <I18nProvider i18n={i18n}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Home Page */}
            <Route index path="/" element={<Home />} />

            {/* Authentication */}
            <Route path="/authenticate" element={<AuthenticatedContent />} />

            {/* Case Management (Latest) */}
            <Route path="/case/assignment" element={<CasesAssignment />} />
            <Route path="/case/creation" element={<CaseCreation/>} />
            <Route path="/case/history" element={<CaseHistoryPage />} />
            {/* Case Management (Archived) */}
            <Route path="/case-assignment" element={<CasesAssignment />} />
            <Route path="/case-creation" element={<CaseCreation/>} />
            <Route path="/kanban" element={<Kanban />} />
            {/* Case Management (No Longer Used) */}
            {/* <Route path="/case-view" element={<CasesView />} /> */}

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Dashboard Mock Data (Archived) */}
            <Route path="/dashboard/agent-status" element={<AgentStatusDashboard />} />
            <Route path="/dashboard/analytics" element={<AnalyticsDashboard />} />
            <Route path="/dashboard/callcenter" element={<CallcenterDashboard />} />
            <Route path="/dashboard/service" element={<ServiceDashboard />} />

            {/* Forms Builder */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/dynamic-form" element={<DynamicForm />} />
            <Route path="/form-management" element={<FormManagement />} />
            {/* Forms Builder (Archived) */}
            <Route path="/load-dynamic-form" element={<LoadDynamicFrom />} />

            {/* Workflow Management (SOP) */}
            <Route path="/workflow/list" element={<WorkflowListPage />} />
            {/* Workflow Builder (Latest Version: v0.2.0) */}
            <Route path="/workflow/editor/v2" element={<WorkflowEditorPage />} />
            <Route path="/workflow/editor/v2/:id" element={<WorkflowEditorPage />} />
            <Route path="/workflow/editor/v2/:id/edit" element={<WorkflowEditorPage />} />
            {/* Workflow Builder (Archived Version: v0.1.0) */}
            <Route path="/workflow/editor/v1" element={<WorkflowEditorV1Page />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/kanban" element={<Kanban />} />
            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/buttons-customize" element={<ButtonsCustomize />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            {/* Test Page */}
            {/* Lingui (No Longer Used) */}
            {/* <Route path="/test/lingui" element={<Lingui />} /> */}
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    // </I18nProvider>
  );
}
