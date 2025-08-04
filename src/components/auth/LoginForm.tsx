// /src/components/auth/LoginForm.tsx
import React, { useState } from "react";
import { AlertIcon, CloseIcon, EnvelopeIcon, EyeCloseIcon, EyeIcon,  } from "@/icons";
import { API_CONFIG } from "@/config/api";
import { Autocomplete } from "@/components/form/form-elements/Autocomplete";
import { useAuth } from "@/hooks/useAuth";
import type { LoginCredentials } from "@/types/auth";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";

export const LoginForm: React.FC = () => {
  const { state, login, forgotPassword, clearError } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
    organization: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);

  // console.log("🔐 LoginForm rendered - Network:", state.networkStatus, "Loading:", state.isLoading);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!credentials.username) {
      errors.username = "Username is required";
    }
    
    if (!credentials.password) {
      errors.password = "Password is required";
    }
    else if (credentials.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!credentials.organization) {
      errors.organization = "Organization is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (state.networkStatus === "offline") {
      setValidationErrors({ network: "No internet connection. Please check your connection and try again." });
      return;
    }
    
    clearError();
    await login(credentials);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setValidationErrors({ forgotEmail: "Email is required" });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setValidationErrors({ forgotEmail: "Email is invalid" });
      return;
    }

    try {
      await forgotPassword(forgotEmail);
      setIsPasswordResetSent(true);
      setValidationErrors({});
    }
    catch (error) {
      setValidationErrors({ 
        forgotEmail: error instanceof Error ? error.message : "Failed to send reset email" 
      });
    }
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
                  {showForgotPassword ? "Reset Password" : "Sign In"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {showForgotPassword ? "Enter your email to reset password" : "Enter your username, password, and organization to sign in!"}
                </p>
              </div>

              {/* Network Status */}
              {/*
              <div className={`mb-4 p-3 rounded-lg flex items-center text-sm ${
                state.networkStatus === "online" 
                  ? "bg-green-50 border border-green-200 text-green-700" 
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {state.networkStatus === "online" ? (
                  <CheckLineIcon className="w-4 h-4 mr-2" />
                ) : (
                  <CloseIcon className="w-4 h-4 mr-2" />
                )}
                <span>
                  {state.networkStatus === "online" ? "Connected" : "Offline - Some features may not work"}
                </span>
              </div>
              */}

              {/* Account lockout warning */}
              {state.isLocked && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertIcon className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">
                      Account temporarily locked due to multiple failed attempts. Please try again later.
                    </span>
                  </div>
                </div>
              )}

              {/* Error message */}
              {state.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertIcon className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{state.error}</span>
                  </div>
                </div>
              )}

              {/* Network error */}
              {validationErrors.network && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center">
                    <CloseIcon className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="text-orange-700 text-sm">{validationErrors.network}</span>
                  </div>
                </div>
              )}

              <div>
                {showForgotPassword ? (
                  // Forgot Password Form
                  <div className="space-y-6">
                    {isPasswordResetSent ? (
                      <div className="text-center">
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-700 text-sm">
                            Password reset instructions have been sent to your email address.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setShowForgotPassword(false);
                            setIsPasswordResetSent(false);
                            setForgotEmail("");
                          }}
                          className="text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                                validationErrors.forgotEmail ? "border-red-300 bg-red-50" : "border-gray-300"
                              }`}
                              placeholder="Enter your email"
                            />
                          </div>
                          {validationErrors.forgotEmail && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.forgotEmail}</p>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={handleForgotPassword}
                            className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Send Reset Email
                          </button>
                          <button
                            onClick={() => setShowForgotPassword(false)}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Username field */}
                    <div>
                      <Label>
                        Username <span className="text-error-500 dark:text-error-400">*</span>{" "}
                      </Label>
                      <Input
                        value={credentials.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="Enter your username"
                        disabled={state.isLoading || state.isLocked || state.networkStatus === "offline"}
                        required
                      />
                    </div>
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
                          disabled={state.isLoading || state.isLocked || state.networkStatus === "offline"}
                          required
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

                    {/* Organization field */}
                    <div>
                      <Label>
                        Organization <span className="text-error-500 dark:text-error-400">*</span>{" "}
                      </Label>
                      <Autocomplete
                        value={credentials.organization}
                        onSelect={(value) => handleInputChange("organization", value)}
                        placeholder="Type an organization..."
                        disabled={state.isLoading || state.isLocked || state.networkStatus === "offline"}
                        required
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
                          // id="remember-me"
                          checked={credentials.rememberMe}
                          onChange={(checked) => handleInputChange("rememberMe", checked)}
                          disabled={state.isLoading || state.isLocked || state.networkStatus === "offline"}
                        />
                        <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-200">
                          Keep me logged in
                        </span>
                      </div>
                      <a
                        // href="/reset-password"
                        href="#"
                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500"
                      >
                        Forgot password?
                      </a>
                    </div>

                    {/* Submit button */}
                    <div>
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={state.isLoading || state.isLocked || state.networkStatus === "offline"}
                      >
                        {state.isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </div>

                    {!API_CONFIG.DEMO_MODE && (
                      <div className="bg-yellow-100 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                        <p className="text-xs text-yellow-700 dark:text-yellow-200 mb-2">API Mode Active:</p>
                        <div className="text-xs text-yellow-600 dark:text-yellow-300">
                          <p>• Backend: {API_CONFIG.BASE_URL}</p>
                          <p>• Use your real account credentials</p>
                          <p>• Ensure backend server is running</p>
                          <p>• CORS must be configured properly</p>
                        </div>
                      </div>
                    )}

                    {/* Demo credentials */}
                    <div className="bg-blue-100 dark:bg-blue-800 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-200 mb-2">Demo credentials:</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-300">Username: wisarud.tec</p>
                          <p className="text-xs text-blue-600 dark:text-blue-300">Password: P@ssw0rd</p>
                          <p className="text-xs text-blue-600 dark:text-blue-300">Organization: SKY-AI</p>
                        </div>
                        <Button
                          onClick={() => {
                            setCredentials({
                              username: "wisarud.tec",
                              password: "P@ssw0rd",
                              organization: "SKY-AI",
                              rememberMe: true
                            });
                            setValidationErrors({});
                          }}
                          disabled={state.isLoading || state.isLocked || state.networkStatus === "offline"}
                          variant="info"
                          size="xs"
                        >
                          Auto-fill
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Don&apos;t have an account? {""}
                    <a
                      // href="/signup"
                      href="/#"
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
