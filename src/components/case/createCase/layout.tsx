import { memo, ReactNode } from "react";
import { CaseDetails } from "@/types/case";
import { TranslationParams } from "@/types/i18n";
import CasePanel from "../CasePanel";
import { CaseHeader } from "./caseHeader";


interface CaseLayoutProps {
    disablePageMeta?: boolean;
    onBack?: () => void;
    isCreate: boolean;
    title?: string;
    showBackButton?: boolean;
    showPanelButton?: boolean;
    customHeaderActions?: ReactNode;
    t: (key: string, params?: TranslationParams | undefined) => string;
    isPanelOpen: boolean;
    onPanelClose: () => void;
    onPanelOpen: () => void;
    caseItem: CaseDetails;
    referCaseList?: any[];
    customPanelHeader?: ReactNode;
    customPanelContent?: ReactNode;
    children: ReactNode;
    showToast?: ReactNode;
    className?: string;
}

export const CaseLayout = memo<CaseLayoutProps>(({
    disablePageMeta,
    onBack,
    title,
    showBackButton = true,
    showPanelButton = true,
    customHeaderActions,
    t,
    isPanelOpen,
    onPanelClose,
    onPanelOpen,
    caseItem,
    referCaseList,
    children,
    showToast,
    className = ""
}) => {
    return (
        <div className={`flex flex-col  ${className}`}>
            {/* Toast */}
            {showToast}

            {/* Header */}
            <CaseHeader
                disablePageMeta={disablePageMeta}
                onBack={onBack}
                onOpenCustomerPanel={onPanelOpen}
                t={t}
                title={title}
                showBackButton={showBackButton}
                showPanelButton={showPanelButton}
                customActions={customHeaderActions}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 md:flex rounded-2xl custom-scrollbar">
                <div className="flex flex-col md:flex-row h-full gap-1 w-full">

                    {/* Left Panel - Main Content */}
                    <div className="overflow-y-auto w-full md:w-2/3 lg:w-3/4 custom-scrollbar">
                        <div className="pr-0">
                            <div className="px-4 mt-5 mb-5">
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className={`
                        fixed top-0 right-0 h-full w-[90%] max-w-md z-40
                        transition-transform duration-300 ease-in-out
                        md:relative md:h-auto md:w-1/3 lg:w-1/4 md:translate-x-0 md:z-auto
                        md:border-l md:border-gray-200 md:dark:border-gray-800 px-1
                        ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}>
                        <CasePanel
                            onClose={onPanelClose}
                            caseItem={caseItem}
                            referCaseList={referCaseList}
                        />
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={onPanelClose}
                />
            )}
        </div>
    );
});

CaseLayout.displayName = 'CaseLayout';