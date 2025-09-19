import React from 'react';
import { X } from 'lucide-react';
import { Comments } from './Comment';
import { useTranslation } from '@/hooks/useTranslation';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseId: string;
    caseTitle?: string;
}

export const CommentModal: React.FC<CommentModalProps> = ({
    isOpen,
    onClose,
    caseId,
    caseTitle
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl mx-4 h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {t("case.sop_card.comment")} - {caseTitle || 'Case Comments'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Case ID: {caseId}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-hidden">
                    <div className="h-full">
                        <ModalComments caseId={caseId} isOpen={isOpen} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ModalComments: React.FC<{ caseId: string; isOpen: boolean }> = ({ caseId, isOpen }) => {
    return (
        <div className="h-full flex flex-col">
            <Comments caseId={caseId} isOpen={isOpen} isModal={true} />
        </div>
    );
};