import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog/dialog";
import Button from "@/components/ui/button/Button";
import PasswordInput from "@/components/form/input/PasswordInput";
import Label from "@/components/form/Label";
import { useTranslation } from "@/hooks/useTranslation";
import { AlertIcon, CheckCircleIcon } from "@/icons";
import { validatePassword } from "@/utils/passwordValidation";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cms-api-1-production.up.railway.app";

export default function ResetPasswordModal({
  isOpen,
  onClose,
  userId,
  onSuccess
}: ResetPasswordModalProps) {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!newPassword) {
      setError(t('userform.newPasswordRequired') || 'กรุณากรอกรหัสผ่านใหม่');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('userform.passwordMismatch') || 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 8) {
      setError(t('userform.passwordTooShort') || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    // Check password validation
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(t('userform.pwdHint') || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ตัวใหญ่ 1 ตัว และอักขระพิเศษ 1 ตัว');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/users/reset_password/${userId}`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Reset password error:', err);
      setError(t('userform.resetPasswordError') || 'ไม่สามารถรีเซ็ตรหัสผ่านได้');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
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
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            {t('userform.resetPassword') || 'รีเซ็ตรหัสผ่าน'}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-6 space-y-4">
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
            <p className="text-center text-green-600 dark:text-green-400">
              {t('userform.resetPasswordSuccess') || 'รีเซ็ตรหัสผ่านสำเร็จ!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertIcon className="w-5 h-5 text-red-500" />
                <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {t('userform.newPassword') || 'รหัสผ่านใหม่'}
              </Label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                placeholder={t('userform.enterNewPassword') || 'กรอกรหัสผ่านใหม่'}
                className="w-full"
              />
              
              {/* Password validation indicators */}
              {newPassword && (
                <div className="space-y-1 text-xs">
                  {(() => {
                    const validation = validatePassword(newPassword);
                    return (
                      <>
                        <div className={`flex items-center space-x-2 ${validation.hasMinLength ? 'text-green-600' : 'text-red-600'}`}>
                          <span>{validation.hasMinLength ? '✓' : '✗'}</span>
                          <span>{t('userform.passwordValidation.minLength') || 'อย่างน้อย 8 ตัวอักษร'}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${validation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                          <span>{validation.hasUppercase ? '✓' : '✗'}</span>
                          <span>{t('userform.passwordValidation.uppercase') || 'อย่างน้อยตัวใหญ่ 1 ตัว'}</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${validation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                          <span>{validation.hasSpecialChar ? '✓' : '✗'}</span>
                          <span>{t('userform.passwordValidation.specialChar') || 'อย่างน้อยอักขระพิเศษ 1 ตัว'}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('userform.confirmPassword') || 'ยืนยันรหัสผ่าน'}
              </Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder={t('userform.confirmNewPassword') || 'ยืนยันรหัสผ่านใหม่'}
                className="w-full"
              />
              
              {/* Password match indicator */}
              {confirmPassword && (
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center space-x-2 ${newPassword === confirmPassword && newPassword !== "" ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{newPassword === confirmPassword && newPassword !== "" ? '✓' : '✗'}</span>
                    <span>{newPassword === confirmPassword && newPassword !== "" ? 
                      (t('userform.passwordsMatch') || 'รหัสผ่านตรงกัน') : 
                      (t('userform.passwordsDoNotMatch') || 'รหัสผ่านไม่ตรงกัน')
                    }</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>{t('userform.passwordRequirements') || 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'}</p>
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
              {t('common.cancel') || 'ยกเลิก'}
            </Button>
            <Button
              variant="primary"
              onClick={handleReset}
              disabled={loading}
            >
              {loading 
                ? (t('userform.resetting') || 'กำลังรีเซ็ต...')
                : (t('userform.resetPassword') || 'รีเซ็ตรหัสผ่าน')
              }
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
