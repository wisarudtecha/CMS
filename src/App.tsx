// /src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router";
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
import Kanban from "./pages/Task/kanban";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import LoadDynamicFrom from "./components/form/dynamic-form/LoadDynamicForm"
import WorkflowListPage from "./pages/Workflow/List";
import WorkflowEditorPage from "./pages/Workflow/Editor";
import WorkflowEditorV1Page from "./pages/Workflow/v1/Editor";
import CasesAssignment from "./pages/Case/caseAssignment";
import TicketListComponent from "./components/ticket/List";
// Lingui
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
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/case-assignment" element={<CasesAssignment />} />
            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/dynamic-form" element={<DynamicForm />} />
            <Route path="/load-dynamic-form" element={<LoadDynamicFrom />} />
            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            {/* Ticket */}
            <Route path="/ticket" element={<TicketListComponent />} />
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

            {/* Workflow Builder (Latest) */}
            <Route path="/workflow/list" element={<WorkflowListPage />} />
            <Route path="/workflow/editor/v2" element={<WorkflowEditorPage />} />
            <Route path="/workflow/editor/v2/:id" element={<WorkflowEditorPage />} />
            <Route path="/workflow/editor/v2/:id/edit" element={<WorkflowEditorPage />} />
            {/* Workflow Builder (Archive) */}
            <Route path="/workflow/editor/v1" element={<WorkflowEditorV1Page />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />

          {/* Test Page */}
          {/* <Route path="/test/lingui" element={<Lingui />} /> */}
        </Routes>
      </Router>
    // </I18nProvider>
  );
}
