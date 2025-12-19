// src/hooks/useSSOSync.ts
import { useEffect, useRef } from "react";
import { isSSOAvailable } from "@/config/api";

export const useSSOSync = (onSSOLogout: () => void) => {
  const lastSSOState = useRef<boolean | null>(null);

  useEffect(() => {
    const checkSSO = () => {
      const hasSSO = Boolean(isSSOAvailable());

      if (lastSSOState.current === null) {
        lastSSOState.current = hasSSO;
        return;
      }

      // SSO existed → now gone = parent logout
      if (lastSSOState.current && !hasSSO) {
        onSSOLogout();
      }

      lastSSOState.current = hasSSO;
    };

    // Initial check
    checkSSO();

    // Polling interval (lightweight)
    const interval = setInterval(checkSSO, 1500);

    return () => clearInterval(interval);
  }, [onSSOLogout]);
};
