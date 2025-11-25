import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionTimeoutWarning } from "@/components/auth/SessionTimeoutWarning";
import { AppWrapper } from "@/components/common/PageMeta.tsx";
import { TranslationLoader } from "@/components/common/TranslationLoader";
import { ToastProvider } from "@/components/crud/ToastGlobal";
import { WebSocketProvider } from "@/components/websocket/websocket";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/providers/AuthProvider";
import { store } from "@/store";
import App from "@/App.tsx";
import LoadingScreen from "@/components/common/LoadingScreen";
import "@/index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <TranslationLoader fallback={<LoadingScreen />}>
            <AuthProvider>
              <ToastProvider>
                <SessionTimeoutWarning />
                <ProtectedRoute>
                  <AppWrapper>
                    <WebSocketProvider autoConnect={true}>
                      <App />
                    </WebSocketProvider>
                  </AppWrapper>
                </ProtectedRoute>
              </ToastProvider>
            </AuthProvider>
          </TranslationLoader>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
