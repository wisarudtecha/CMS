import { useTranslation } from "@/hooks/useTranslation";
import { formatDate } from "@fullcalendar/core/index.js";
import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
import { getTimeDifference } from "../sopStepTranForm";

export const formatAdjustedDate = (date: string | Date) =>
    formatDate(
        new Date(new Date(date).getTime() - 7 * 3600 * 1000).toISOString()
    );


export const formatDueDate = (date: string | Date, sla: number) =>
    formatDate(
        new Date(
            new Date(date).getTime() + sla * 60 * 1000 - 7 * 3600 * 1000
        ).toISOString()
    );

export const StepCircle: React.FC<{
    completed: boolean;
    current: boolean;
    violated: boolean;
    step: any;
    previousStep?: any;
}> = ({ completed, current, violated, step, previousStep }) => {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);

    const base =
        "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-800 relative z-10 flex-shrink-0 cursor-pointer";
    const stateClasses = completed
        ? violated
            ? "border-red-500 text-red-500"
            : "border-blue-500 text-blue-500"
        : current
            ? violated
                ? "border-red-500 text-red-500"
                : "border-blue-500 text-blue-500"
            : "border-gray-300 dark:border-gray-600 text-gray-400";

    const calculateSlaPerformance = () => {
        if (!step.sla || (!completed && !current) || !step.timeline?.completedAt || !previousStep?.timeline?.completedAt ) {
            return null;
        }

        const startTime = new Date(previousStep.timeline.completedAt).getTime();
        const endTime = new Date(step.timeline.completedAt).getTime();
        const actualDurationMs = endTime - startTime;
        const actualDurationMinutes = actualDurationMs / (1000 * 60);
        const slaDurationMinutes = step.sla;
        
        const difference = actualDurationMinutes - slaDurationMinutes;
        const isOverdue = difference > 0;
        
        return {
            actualDuration: actualDurationMinutes,
            slaDuration: slaDurationMinutes,
            difference: Math.abs(difference),
            isOverdue
        };
    };

    const slaPerformance = calculateSlaPerformance();

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${Math.round(minutes)} ${t("time.Minutes")}`;
        } else if (minutes < 1440) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = Math.round(minutes % 60);
            return remainingMinutes > 0 
                ? `${hours} ${t("time.Hours")} ${remainingMinutes} ${t("time.Minutes")}`
                : `${hours} ${t("time.Hours")}`;
        } else {
            const days = Math.floor(minutes / 1440);
            const remainingHours = Math.floor((minutes % 1440) / 60);
            const remainingMinutes = Math.round(minutes % 60);
            let result = `${days} ${t("time.Days")}`;
            if (remainingHours > 0) {
                result += ` ${remainingHours} ${t("time.Hours")}`;
            }
            if (remainingMinutes > 0) {
                result += ` ${remainingMinutes} ${t("time.Minutes")}`;
            }
            return result;
        }
    };

    const renderTooltipContent = () => {
        if ((completed || current) && slaPerformance) {
            return (
                <div className="space-y-1">
                    <div className="font-semibold text-gray-700 dark:text-gray-300">
                        {step.title}
                    </div>
                    <div className="text-sm">
                        <div className="text-gray-600 dark:text-gray-400">
                            {t("progress.sla")}: {formatDuration(slaPerformance.slaDuration)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                            {t("progress.actual")}: {formatDuration(slaPerformance.actualDuration)}
                        </div>
                        <div className={`font-medium ${slaPerformance.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {slaPerformance.isOverdue 
                                ? `${t("progress.overdue_by")}: ${formatDuration(slaPerformance.difference)}`
                                : `${t("progress.faster_by")}: ${formatDuration(slaPerformance.difference)}`
                            }
                        </div>
                    </div>
                </div>
            );
        } else if (!step.sla) {
            return (
                <div className="space-y-1">
                    <div className="font-semibold text-gray-700 dark:text-gray-300">
                        {step.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("progress.sla")}: {formatDuration(step.sla)}
                    </div>
                    {!completed && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                            {current ? t("progress.in_progress") : t("progress.pending")}
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div className="space-y-1">
                    <div className="font-semibold text-gray-700 dark:text-gray-300">
                        {step.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("progress.no_sla")}
                    </div>
                </div>
            );
        }
    };

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`${base} ${stateClasses}`}>
                {completed ? (
                    <CheckCircle className="w-5 h-5" />
                ) : (
                    <Circle className={`w-3 h-3 ${current ? "fill-current" : ""}`} />
                )}
            </div>
            
            {isHovered && (
                <div className="absolute z-50 bottom-1/2 left-1/2 transform  mb-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg whitespace-nowrap">
                    {renderTooltipContent()}
                    {/* Arrow */}
                    <div className="absolute top-1/2 left-1/2 transform  w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
                </div>
            )}
        </div>
    );
};

export const TimeBadge: React.FC<{ from: any; to: any; violated: boolean }> = ({
    from,
    to,
    violated,
}) => {
    const timeDiff = getTimeDifference(from, to);
    if (!timeDiff) return null;
    const style = !violated
        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
        : "bg-red-100 dark:bg-red-900 border-red-500 text-red-500 dark:text-red-300";
    return (
        <div
            className={`${style} px-2 py-1 w-fit rounded text-xs font-medium whitespace-nowrap`}
        >
            {timeDiff}
        </div>
    );
};