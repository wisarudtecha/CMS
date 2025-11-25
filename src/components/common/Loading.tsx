import { useTranslation } from "@/hooks/useTranslation";
import { SpinnerIcon } from "@/icons/SpinnerIcon";

export const LoadingModal = () => {
    const { t } = useTranslation();
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100000">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <div className="text-center">
              <div className="text-lg text-gray-700 dark:text-gray-200 font-semibold">{t("common.loading")}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

const Loading = () => {
    const { t } = useTranslation();
    return (
        <div className="flex justify-center text-gray-500 items-center">
            <SpinnerIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 animate-spin mr-2" />
            {t("common.loading")}
        </div>
    );
};

export default Loading;
