// /src/components/UserProfile/ChangePasswordModal.tsx
import { useState } from "react";
import { AlertIcon, CheckCircleIcon } from "@/icons";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { APP_CONFIG } from "@/utils/constants";
import { validatePassword, PasswordValidation } from "@/utils/passwordValidation";
import type { ChangePasswordModalProps } from "@/types/user";
import PasswordInput from "@/components/form/input/PasswordInput";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

const ChangePasswordModal = ({
  isOpen,
  onClose,
  userId,
  onSuccess
}: ChangePasswordModalProps) => {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    isValid: false,
    hasMinLength: false,
    hasUppercase: false,
    hasSpecialChar: false
  });

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setError(t("userform.currentPasswordRequired"));
      return;
    }

    if (!newPassword) {
      setError(t("userform.newPasswordRequired"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("userform.passwordMismatch"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("userform.passwordTooShort"));
      return;
    }

    // Check password validation
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(t("userform.pwdHint"));
      return;
    }

    if (currentPassword === newPassword) {
      setError(t("userform.samePassword"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/users/change_password/${userId}`, {
        method: "PATCH",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        if (response.status === 400) {
          setError(t("userform.incorrectCurrentPassword"));
        }
        else if (response.status === 401) {
          setError(t("userform.unauthorized"));
        }
        else {
          setError(t("userform.changePasswordError"));
        }
        return;
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
    catch (err) {
      console.error("Change password error:", err);
      setError(t("userform.changePasswordError"));
    }
    finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-md w-[90vw] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("userform.changePassword")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("userform.changePasswordDescription")}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-6 space-y-4">
            <CheckCircleIcon className="w-16 h-16 text-green-400 dark:text-green-500" />
            <p className="text-center text-green-500 dark:text-green-400">
              {t("userform.changePasswordSuccess")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900 border border-red-100 dark:border-red-800 rounded-lg">
                <AlertIcon className="w-5 h-5 text-red-400 dark:text-red-500" />
                <span className="text-red-500 dark:text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t("userform.currentPassword")}
              </Label>
              <PasswordInput
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("userform.enterCurrentPassword")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {t("userform.newPassword")}
              </Label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordValidation(validatePassword(e.target.value));
                }}
                placeholder={t("userform.enterNewPassword")}
                className="w-full"
              />
              
              {/* Password validation indicators */}
              {newPassword && (
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasMinLength ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}>
                    <span>{passwordValidation.hasMinLength ? "✓" : "✗"}</span>
                    <span>{t("userform.passwordValidation.minLength")}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasUppercase ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}>
                    <span>{passwordValidation.hasUppercase ? "✓" : "✗"}</span>
                    <span>{t("userform.passwordValidation.uppercase")}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasSpecialChar ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}>
                    <span>{passwordValidation.hasSpecialChar ? "✓" : "✗"}</span>
                    <span>{t("userform.passwordValidation.specialChar")}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("userform.confirmPassword")}
              </Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("userform.confirmNewPassword")}
                className="w-full"
              />
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>{t("userform.passwordRequirements")}</p>
            </div>
          </div>
        )}

        {!success && (
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading 
                ? (t("common.loading"))
                : (t("userform.changePassword"))
              }
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordModal;
