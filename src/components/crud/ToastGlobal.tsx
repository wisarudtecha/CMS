import React, { useEffect, useRef } from "react";
import { useToast } from "@/hooks";
import { ToastContainer } from "./ToastContainer";

interface ToastGlobalContainerProps {
    children: React.ReactNode;
}

export const ToastGlobalContainer: React.FC<ToastGlobalContainerProps> = ({ children }) => {
    const { toasts, addToast, removeToast } = useToast();
    const loadingToastIdRef = useRef<string | null>(null);
    

    useEffect(() => {
        const handleLoadingStart = () => {
            if (loadingToastIdRef.current) {
                removeToast(loadingToastIdRef.current);
            }
            const id = Date.now().toString();
            loadingToastIdRef.current = id;
            addToast("info", "case.display.toast.loading_case", 0,true);
        };

        const handleLoadingEnd = () => {
            if (loadingToastIdRef.current) {
                removeToast(loadingToastIdRef.current);
                loadingToastIdRef.current = null;
            }
            addToast("success", "case.display.toast.loading_case_success", 3000 ,true);
        };

        const handleLoadingProgress = (e: Event) => {
            const customEvent = e as CustomEvent<{ current: number; total: number }>;
            const { current, total } = customEvent.detail;
            
            if (loadingToastIdRef.current) {
                removeToast(loadingToastIdRef.current);
                const id = Date.now().toString();
                loadingToastIdRef.current = id;
                addToast("info", `Loading cases... (${current}/${total})`, 0);
            }
        };

        window.addEventListener('caseLoadingStart', handleLoadingStart);
        window.addEventListener('caseLoadingEnd', handleLoadingEnd);
        window.addEventListener('caseLoadingProgress', handleLoadingProgress);

        return () => {
            window.removeEventListener('caseLoadingStart', handleLoadingStart);
            window.removeEventListener('caseLoadingEnd', handleLoadingEnd);
            window.removeEventListener('caseLoadingProgress', handleLoadingProgress);
        };
    }, [addToast, removeToast]);

    return (
        <>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} disbleCloseButton={true} />
        </>
    );
};