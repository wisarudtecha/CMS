"use client"
import React from 'react';
import { X } from 'lucide-react';
import { Comments } from './Comment';
import { useTranslation } from '@/hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog";
import { ScrollArea } from "@/components/ui/scorllarea/scroll-area";

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                aria-describedby="comment-modal-desc" 
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-4xl w-[95vw] h-[85vh] flex flex-col z-999999 rounded-md"
            >
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                            {t("case.sop_card.comment")} - {caseTitle || 'Case Comments'}
                        </DialogTitle>
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
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-6">
                            <ModalComments caseId={caseId} isOpen={isOpen} />
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};


const ModalComments: React.FC<{ caseId: string; isOpen: boolean }> = ({ caseId, isOpen }) => {
    return (
        <div className="h-full">
            <Comments caseId={caseId} isOpen={isOpen} isModal={true} />
        </div>
    );
};