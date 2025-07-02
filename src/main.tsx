import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { LanguageProvider } from "./context/LanguageContext";
import { TranslationLoader } from './components/common/TranslationLoader';

import LoadingScreen from "./components/common/LoadingScreen";

import { AuthProvider } from "@/providers/AuthProvider";
import { SessionTimeoutWarning } from "@/components/auth/SessionTimeoutWarning";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <TranslationLoader fallback={<LoadingScreen />}>
          <AuthProvider>
            <SessionTimeoutWarning />
            <ProtectedRoute>
              <AppWrapper>
                <App />
              </AppWrapper>
            </ProtectedRoute>
          </AuthProvider>
        </TranslationLoader>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);
