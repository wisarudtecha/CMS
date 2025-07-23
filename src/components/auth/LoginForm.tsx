// /src/components/auth/LoginForm.tsx
import React, { useState } from "react";
import
  {
    EyeCloseIcon,
    EyeIcon
  }
from "@/icons";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import type { LoginCredentials } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { Autocomplete } from "@/components/form/form-elements/Autocomplete";

export const LoginForm: React.FC = () => {
  const { state, login, clearError } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    // Updated: [17-07-2025] v0.1.2
    username: "admin",
    // email: "admin@cms.com",
    // Updated: [17-07-2025] v0.1.2
    password: "P@ssw0rd",
    // Updated: [17-07-2025] v0.1.2
    organization: "skyai",
    rememberMe: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Updated: [06-07-2025] v0.1.1
  console.log("🔐 LoginForm rendered at:", new Date().toISOString(), {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Updated: [17-07-2025] v0.1.2
    if (!credentials.username) {
      errors.username = "Username is required";
    }
    
    // if (!credentials.email) {
    //   errors.email = "Email is required";
    // }
    // else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
    //   errors.email = "Email is invalid";
    // }
    
    if (!credentials.password) {
      errors.password = "Password is required";
    }
    else if (credentials.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Updated: [17-07-2025] v0.1.2
    if (!credentials.organization) {
      errors.organization = "Organization is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    clearError();
    await login(credentials);
  
    //Mock up User by Delta 22/7 เเทนที่ด้วยข้อมูลจริงจาก API 
    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTMyNTk4MDIsIm9yZ0lkIjoiNDM0YzBmMTYtYjdlYS00YTdiLWE3NGItZTJlMGY4NTlmNTQ5IiwidXNlcm5hbWUiOiJwYXR0YXJhZGFuYWkuamVyIn0.1H-vR9fLbCZp_UhAiXdLOoe1JtkAeJ7n4JdvtL6Sc-Y";
    const firstName = "Pattaradanai";
    const middleName = "D.";
    const lastName = "Jermpinitpoca";
    const profile = JSON.stringify({
      username: "pattaradanai.jer",
      orgId: "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
      photo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf3hbXeK8w0ezCgtk3DLsksnNnxnRTrvqc4A&s",
      displayName:"Pattaradanai Je",
      email:"pattaradanai.jer@sky.ao.co.th",
       fullName: `${firstName} ${middleName} ${lastName}`
    });
    localStorage.setItem("profile", profile);
    localStorage.setItem("access_token", accessToken);
  };
  

  const handleInputChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleShowPassword = () => {
    if (!state.isLoading && !state.isLocked) {
      setShowPassword(!showPassword);
    }
  }

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8 place-items-center">
                <img className="dark:hidden" src="/images/logo/logo.png" alt="Logo" />
                <img className="hidden dark:block" src="/images/logo/logo.png" alt="Logo" />
              </div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Sign In
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {/* Enter your email and password to sign in! */}
                  {/* Updated: [17-07-2025] v0.1.2 */}
                  Enter your username, password, and organization to sign in!
                </p>
              </div>
              <div>
                <div className="space-y-6">
                  {/* Updated: [06-07-2025] v0.1.1 */}
                  {/* Lock message */}
                  {state.isLocked && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-800 border border-red-200 dark:border-red-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-red-700 dark:text-red-200 text-sm">
                          Account temporarily locked due to multiple failed attempts. Please try again later.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {state.error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-800 border border-red-200 dark:border-red-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-red-700 dark:text-red-200 text-sm">{state.error}</span>
                      </div>
                    </div>
                  )}

                  {/* Username field */}
                  <div>
                    <Label>
                      Username <span className="text-error-500 dark:text-error-400">*</span>{" "}
                    </Label>
                    <Input
                      // type="email"
                      // value={credentials.email}
                      // Updated: [17-07-2025] v0.1.2
                      value={credentials.username}
                      // onChange={(e) => handleInputChange("email", e.target.value)}
                      // Updated: [17-07-2025] v0.1.2
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      // placeholder="Enter your email"
                      // Updated: [17-07-2025] v0.1.2
                      placeholder="Enter your username"
                      disabled={state.isLoading || state.isLocked}
                    />
                  </div>
                  {/* 
                  {validationErrors.email && (
                    <div className="relative flex justify-center text-sm text-red-600 dark:text-red-300">
                      {validationErrors.email}
                    </div>
                  )}
                  */}
                  {/* Updated: [17-07-2025] v0.1.2 */}
                  {validationErrors.username && (
                    <div className="relative flex justify-center text-sm text-red-600 dark:text-red-300">
                      {validationErrors.username}
                    </div>
                  )}

                  {/* Password field */}
                  <div>
                    <Label>
                      Password <span className="text-error-500 dark:text-error-400">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="Enter your password"
                        disabled={state.isLoading || state.isLocked}
                      />
                      <span
                        onClick={() => handleShowPassword()}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  {validationErrors.password && (
                    <div className="relative flex justify-center text-sm text-red-600 dark:text-red-300">
                      {validationErrors.password}
                    </div>
                  )}

                  {/* Updated: [17-07-2025] v0.1.2 */}
                  {/* Organization field */}
                  <div>
                    <Label>
                      Organization <span className="text-error-500 dark:text-error-400">*</span>{" "}
                    </Label>
                    <Autocomplete
                      // suggestions={["bma", "skyai"]}
                      placeholder="Type an organization..."
                      onSelect={(value) => handleInputChange("organization", value)}
                      value={credentials.organization}
                    />
                  </div>
                  {validationErrors.organization && (
                    <div className="relative flex justify-center text-sm text-red-600 dark:text-red-300">
                      {validationErrors.organization}
                    </div>
                  )}

                  {/* Remember me */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="remember-me"
                        checked={credentials.rememberMe}
                        onChange={(checked: boolean) => handleInputChange("rememberMe", checked)}
                        disabled={state.isLoading || state.isLocked}
                      />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-200">
                        Keep me logged in
                      </span>
                    </div>
                    <a
                      href="/reset-password"
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Demo credentials */}
                  <div className="bg-blue-100 dark:bg-blue-800 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                    <p className="text-xs text-blue-700 dark:text-blue-200 mb-2">Demo credentials:</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {/* Updated: [17-07-2025] v0.1.2 */}
                        <p className="text-xs text-blue-600 dark:text-blue-300">Username: admin</p>
                        {/* <p className="text-xs text-blue-600 dark:text-blue-300">Email: admin@cms.com</p> */}
                        {/* Updated: [17-07-2025] v0.1.2 */}
                        <p className="text-xs text-blue-600 dark:text-blue-300">Password: P@ssw0rd</p>
                        {/* Updated: [17-07-2025] v0.1.2 */}
                        <p className="text-xs text-blue-600 dark:text-blue-300">Organization: skyai</p>
                      </div>
                      <Button
                        onClick={() => {
                          setCredentials({
                            // Updated: [17-07-2025] v0.1.2
                            username: "admin",
                            // email: "admin@cms.com",
                            // Updated: [17-07-2025] v0.1.2
                            password: "P@ssw0rd",
                            // Updated: [17-07-2025] v0.1.2
                            organization: "skyai",
                            rememberMe: true
                          });
                        }}
                        disabled={state.isLoading || state.isLocked}
                        variant="info"
                        size="xs"
                      >
                        Auto-fill
                      </Button>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={handleSubmit}
                      disabled={state.isLoading || state.isLocked}
                    >
                      {state.isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Don&apos;t have an account? {""}
                    <a
                      href="/signup"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500"
                    >
                      Sign Up
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
