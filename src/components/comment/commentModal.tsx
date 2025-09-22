"use client"
import React from 'react';
import { Comments } from './Comment';
import { Dialog, DialogContent } from "@/components/ui/dialog/dialog";

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

}) => {

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                aria-describedby="comment-modal-desc" 
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-4xl w-[95vw] h-[85vh] flex flex-col z-999999 rounded-md"
            >


                {/* Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                            <ModalComments caseId={caseId} isOpen={isOpen} />
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