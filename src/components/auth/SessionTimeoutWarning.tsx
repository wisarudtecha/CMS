// /src/components/auth/SessionTimeoutWarning.tsx
import React, { useEffect, useState } from "react";
import { AlertIcon } from "@/icons";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/button/Button";

export const SessionTimeoutWarning: React.FC = () => {
  const { state, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!state.sessionTimeout) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil((state.sessionTimeout! - Date.now()) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.sessionTimeout, logout]);

  if (state && !state.sessionTimeout) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-400/50 bg-opacity-50 flex items-center justify-center z-999999 backdrop-blur-[32px]">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <AlertIcon className="h-12 w-12 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Session Timeout Warning</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your session will expire in {timeLeft} seconds due to inactivity.
          </p>
          <div className="flex space-x-3 justify-center">
            <Button
              // onClick={() => window.location.reload()}
              onClick={() => window.location.replace("/")} // For development mode only
            >
              Stay Logged In
            </Button>
            <Button
              onClick={logout}
              variant="error"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
