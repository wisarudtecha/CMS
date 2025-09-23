// components/progress/ProgressBar.tsx
import React, { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
    getTimeDifference,
    isSlaViolated,
    ProgressStepPreviewProps,
} from "../sopStepTranForm";
import { CompactCountdownTimer } from "@/components/countDownSla/countDownSla";
import { formatDate } from "@/utils/crud";

const formatAdjustedDate = (date: string | Date) =>
    formatDate(
        new Date(new Date(date).getTime() - 7 * 3600 * 1000).toISOString()
    );

const formatDueDate = (date: string | Date, sla: number) =>
    formatDate(
        new Date(
            new Date(date).getTime() + sla * 3600 * 1000 - 7 * 3600 * 1000
        ).toISOString()
    );

const StepCircle: React.FC<{
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
        const actualDurationHours = actualDurationMs / (1000 * 60 * 60);
        const slaDurationHours = step.sla;
        
        const difference = actualDurationHours - slaDurationHours;
        const isOverdue = difference > 0;
        
        return {
            actualDuration: actualDurationHours,
            slaDuration: slaDurationHours,
            difference: Math.abs(difference),
            isOverdue
        };
    };

    const slaPerformance = calculateSlaPerformance();

    const formatDuration = (hours: number) => {
        if (hours < 1) {
            const minutes = Math.round(hours * 60);
            return `${minutes} ${t("time.Minutes")}`;
        } else if (hours < 24) {
            return `${Math.round(hours * 10) / 10} ${t("time.Hours")}`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round((hours % 24) * 10) / 10;
            return `${days} ${t("time.Days")} ${remainingHours} ${t("time.Hours")}`;
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
        } else if (step.sla) {
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

const TimeBadge: React.FC<{ from: any; to: any; violated: boolean }> = ({
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

const ProgressStepPreview: React.FC<ProgressStepPreviewProps> = ({
    progressSteps,
}) => {
    const { t } = useTranslation();
    const currentStepIndex = progressSteps.findIndex((s) => s.current);
    const currentStep =
        currentStepIndex >= 0 ? progressSteps[currentStepIndex] : null;
    
    return (
        <div className="mb-4 sm:mb-6 w-full">
            {/* Mobile Layout */}
            <div className="block sm:hidden space-y-3">
                {progressSteps.map((step, index) => {
                    const isLastStep = index === progressSteps.length - 1;
                    const violated = isSlaViolated(step);
                    const previousStep = index > 0 ? progressSteps[index - 1] : null;

                    return (
                        <div
                            key={step.id}
                            className="flex items-start space-x-3 relative"
                        >
                            {!isLastStep && (
                                <div className="absolute left-4 top-8 w-0.5 h-13 bg-gray-300 dark:bg-gray-600 z-0" />
                            )}

                            <StepCircle
                                completed={step.completed}
                                current={step.current as boolean}
                                violated={violated}
                                step={step}
                                previousStep={previousStep}
                            />

                            <div className="flex-1 min-w-0 pt-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div
                                        className={`text-sm font-medium mb-1 ${step.completed || step.current
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-500 dark:text-gray-400"
                                            }`}
                                    >
                                        {step.title}
                                    </div>

                                    <div className="flex flex-col space-y-1">
                                        {step.timeline?.completedAt && (
                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                {formatAdjustedDate(step.timeline.completedAt)}
                                            </div>
                                        )}

                                        {index > 0 &&
                                            progressSteps[index - 1] &&
                                            step.timeline?.completedAt && (
                                                <TimeBadge
                                                    from={progressSteps[index - 1]}
                                                    to={step}
                                                    violated={violated}
                                                />
                                            )}

                                        {step.nextStage &&
                                            currentStep?.timeline?.completedAt &&
                                            step.sla ? (
                                                <>  
                                                    <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                                                        {t("case.sop_card.due")}:{" "} {formatDueDate(currentStep.timeline.completedAt, step.sla)}
                                                    </div>
                                                    <CompactCountdownTimer
                                                        createdAt={currentStep.timeline.completedAt}
                                                        sla={step.sla}
                                                        size="sm"
                                                        className="px-2 py-1 rounded-md text-xs font-medium self-start"
                                                    />
                                                </>
                                            ):null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Layout */}
            <div
                className="hidden sm:flex items-start justify-between relative"
                style={{ minHeight: "120px" }}
            >
                {progressSteps.map((step, index) => {
                    const isLastStep = index === progressSteps.length - 1;
                    const nextStep = !isLastStep ? progressSteps[index + 1] : null;
                    const violated = isSlaViolated(step);
                    const previousStep = index > 0 ? progressSteps[index - 1] : null;

                    const activeLine =
                        (step.completed && nextStep?.completed) ||
                        (step.completed && nextStep?.current) ||
                        step.current;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center relative flex-1"
                        >
                            {/* Line */}
                            <div
                                className="absolute top-4 left-0 w-full h-0.5 z-0 flex"
                                style={{ transform: "translateY(-1px)" }}
                            >
                                {step.current ? (
                                    <>
                                        <div
                                            className={`w-1/2 h-full ${activeLine
                                                ? "bg-blue-500"
                                                : "bg-gray-300 dark:bg-gray-600"
                                                }`}
                                        />
                                        <div className="w-1/2 h-full bg-gray-300 dark:bg-gray-600" />
                                    </>
                                ) : (
                                    <div
                                        className={`w-full h-full ${activeLine
                                            ? "bg-blue-500"
                                            : "bg-gray-300 dark:bg-gray-600"
                                            }`}
                                    />
                                )}
                            </div>

                            <StepCircle
                                completed={step.completed}
                                current={step.current as boolean}
                                violated={violated}
                                step={step}
                                previousStep={previousStep}
                            />

                            {index > 0 &&
                                progressSteps[index - 1] &&
                                step.timeline?.completedAt &&
                                !step.nextStage && (
                                    <div className="absolute top-1 left-0 transform -translate-x-1/2 z-20">
                                        <TimeBadge
                                            from={progressSteps[index - 1]}
                                            to={step}
                                            violated={violated}
                                        />
                                    </div>
                                )}

                            {step.nextStage &&
                                currentStep?.timeline?.completedAt &&
                                (
                                    <div className="absolute top-1 left-0 transform -translate-x-1/2 z-20">
                                        <CompactCountdownTimer
                                            createdAt={currentStep.timeline.completedAt}
                                            sla={step.sla}
                                            size="sm"
                                        />
                                    </div>
                                )}

                            <div className="text-center px-1 md:px-2 mt-6">
                                <div
                                    className={`text-xs md:text-sm font-medium mb-1 leading-tight ${step.completed || step.current
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-500 dark:text-gray-400"
                                        }`}
                                >
                                    {step.title}
                                </div>

                                {step.timeline?.completedAt && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                                        {formatAdjustedDate(step.timeline.completedAt)}
                                    </div>
                                )}

                                {step.nextStage &&
                                    currentStep?.timeline?.completedAt &&
                                    step.sla ? (
                                    <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                                        {t("case.sop_card.due")}:{" "}
                                        {formatDueDate(currentStep.timeline.completedAt, step.sla)}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressStepPreview;