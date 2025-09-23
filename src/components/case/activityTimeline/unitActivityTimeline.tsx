import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { getTimeDifference, isSlaViolated, ProgressStepPreviewProps } from '../sopStepTranForm';
import { CompactCountdownTimer } from '@/components/countDownSla/countDownSla';
import { formatDate } from '@/utils/crud';
import { StepCircle } from './StepCircleUnit';

// const StepCircleUnit: React.FC<{
//     completed: boolean;
//     current: boolean;
//     violated: boolean;
//     step: any;
//     previousStep?: any;
// }> = ({ completed, current, violated, step, previousStep }) => {
//     const { t } = useTranslation();
//     const [isHovered, setIsHovered] = useState(false);

//     const calculateSlaPerformance = () => {
//         if (!step.sla || !completed || !step.timeline?.completedAt || !previousStep?.timeline?.completedAt) {
//             return null;
//         }

//         const startTime = new Date(previousStep.timeline.completedAt).getTime();
//         const endTime = new Date(step.timeline.completedAt).getTime();
//         const actualDurationMs = endTime - startTime;
//         const actualDurationHours = actualDurationMs / (1000 * 60 * 60);
//         const slaDurationHours = step.sla;
        
//         const difference = actualDurationHours - slaDurationHours;
//         const isOverdue = difference > 0;
        
//         return {
//             actualDuration: actualDurationHours,
//             slaDuration: slaDurationHours,
//             difference: Math.abs(difference),
//             isOverdue
//         };
//     };

//     const slaPerformance = calculateSlaPerformance();

//     const formatDuration = (hours: number) => {
//         if (hours < 1) {
//             const minutes = Math.round(hours * 60);
//             return `${minutes} ${t("time.Minutes")}`;
//         } else if (hours < 24) {
//             return `${Math.round(hours * 10) / 10} ${t("time.Hours")}`;
//         } else {
//             const days = Math.floor(hours / 24);
//             const remainingHours = Math.round((hours % 24) * 10) / 10;
//             return `${days} ${t("time.Days")} ${remainingHours} ${t("time.Hours")}`;
//         }
//     };

//     const renderTooltipContent = () => {
//         if (completed && slaPerformance) {
//             return (
//                 <div className="space-y-1">
//                     <div className="font-semibold text-gray-700 dark:text-gray-300">
//                         {step.title}
//                     </div>
//                     <div className="text-sm">
//                         <div className="text-gray-600 dark:text-gray-400">
//                             {t("progress.sla")}: {formatDuration(slaPerformance.slaDuration)}
//                         </div>
//                         <div className="text-gray-600 dark:text-gray-400">
//                             {t("progress.actual")}: {formatDuration(slaPerformance.actualDuration)}
//                         </div>
//                         <div className={`font-medium ${slaPerformance.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
//                             {slaPerformance.isOverdue 
//                                 ? `${t("progress.overdue_by")}: ${formatDuration(slaPerformance.difference)}`
//                                 : `${t("progress.faster_by")}: ${formatDuration(slaPerformance.difference)}`
//                             }
//                         </div>
//                     </div>
//                 </div>
//             );
//         } else if (step.sla) {
//             return (
//                 <div className="space-y-1">
//                     <div className="font-semibold text-gray-700 dark:text-gray-300">
//                         {step.title}
//                     </div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">
//                         {t("progress.sla")}: {formatDuration(step.sla)}
//                     </div>
//                     {!completed && (
//                         <div className="text-xs text-gray-500 dark:text-gray-500">
//                             {current ? t("progress.in_progress") : t("progress.pending")}
//                         </div>
//                     )}
//                 </div>
//             );
//         } else {
//             return (
//                 <div className="space-y-1">
//                     <div className="font-semibold text-gray-700 dark:text-gray-300">
//                         {step.title}
//                     </div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">
//                         {t("progress.no_sla")}
//                     </div>
//                 </div>
//             );
//         }
//     };

//     return (
//         <div 
//             className="relative inline-block"
//             onMouseEnter={() => setIsHovered(true)}
//             onMouseLeave={() => setIsHovered(false)}
//         >
//             <div className={`
//                 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-800 relative z-10 flex-shrink-0 cursor-pointer
//                 ${completed
//                     ? violated
//                         ? 'border-red-500 text-red-500'
//                         : 'border-blue-500 text-blue-500'
//                     : current
//                         ? violated ? 'border-red-500 text-red-500'
//                             : 'border-blue-500 text-blue-500'
//                         : 'border-gray-300 dark:border-gray-600 text-gray-400'
//                 }
//             `}>
//                 {completed ? (
//                     <CheckCircle className="w-5 h-5" />
//                 ) : (
//                     <Circle className={`w-3 h-3 ${current ? 'fill-current' : ''}`} />
//                 )}
//             </div>
            
//             {isHovered && (
//                 <div className="absolute z-50 left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg whitespace-nowrap">
//                     {renderTooltipContent()}
//                     {/* Arrow pointing left */}
//                     <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-200 dark:border-r-gray-600"></div>
//                 </div>
//             )}
//         </div>
//     );
// };

const ProgressStepPreviewUnit: React.FC<ProgressStepPreviewProps> = ({ progressSteps }) => {
    const { t } = useTranslation();

    const filteredSteps = progressSteps.length === 6
        ? progressSteps.slice(1, -1)
        : progressSteps;

    const currentStepIndex = filteredSteps.findIndex(step => step.current);
    const currentStep = currentStepIndex >= 0 ? filteredSteps[currentStepIndex] : null;

    return (
        <div className="mb-6">
            <div className="flex flex-col">
                {filteredSteps.map((step, index) => {
                    const isLastStep = index === filteredSteps.length - 1;
                    const nextStep = !isLastStep ? filteredSteps[index + 1] : null;
                    const violated = isSlaViolated(step);
                    const previousStep = index > 0 ? filteredSteps[index - 1] : null;

                    const shouldShowActiveLine =
                        (step.completed && nextStep?.completed) ||
                        (step.completed && nextStep?.current) ||
                        (step.current);

                    return (
                        <div key={step.id} className="flex items-start justify-between relative">
                            <div className="flex flex-col items-center relative">
                                <StepCircle
                                    completed={step.completed}
                                    current={step.current as boolean}
                                    violated={violated}
                                    step={step}
                                    previousStep={previousStep}
                                />

                                {!isLastStep && (
                                    <div className="relative">
                                        {step.current ? (
                                            <div className="flex flex-col w-0.5 h-16 relative z-0">
                                                <div className={`
                                                    h-1/2 w-full
                                                 bg-gray-300 dark:bg-gray-600
                                                `}></div>
                                                <div className="h-1/2 w-full bg-gray-300 dark:bg-gray-600"></div>
                                            </div>
                                        ) : (
                                            <div className={`
                                                w-0.5 h-16 relative z-0
                                                ${shouldShowActiveLine ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                                            `}></div>
                                        )}

                                        {/* Time Difference Badge - Show time FROM previous step TO current step */}
                                        {index < filteredSteps.length - 1 && filteredSteps[index + 1]?.timeline?.completedAt && !filteredSteps[index + 1]?.nextStage && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                                {(() => {
                                                    const nextStepViolated = isSlaViolated(filteredSteps[index + 1]);
                                                    const timeDiff = getTimeDifference(step, filteredSteps[index + 1]);
                                                    return timeDiff && (
                                                        <div className={`${!nextStepViolated ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "bg-red-100 dark:bg-red-900 border-red-500 text-red-500 dark:text-red-300"} px-2 py-1 rounded text-xs font-medium whitespace-nowrap`}>
                                                            {timeDiff}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {/* Countdown Timer for Next Step */}
                                        {index < filteredSteps.length - 1 && filteredSteps[index + 1]?.nextStage && currentStep?.timeline?.completedAt && filteredSteps[index + 1]?.sla && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                                <CompactCountdownTimer
                                                    createdAt={currentStep.timeline.completedAt}
                                                    sla={step.sla}
                                                    size="sm"
                                                    className='px-2 py-1 rounded-md text-xs font-medium'
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="ml-4 pb-8 flex-1">
                                <div className={`
                                    text-sm font-medium mb-1 leading-tight
                                    ${step.completed
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : step.current
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }
                                `}>
                                    {step.title}
                                </div>

                                {step.timeline?.completedAt && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
                                        {formatDate(
                                            new Date(new Date(step.timeline.completedAt).getTime()-(7 *3600*1000)).toISOString()
                                        )}
                                    </div>
                                )}

                                {step.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                                        {step.description}
                                    </div>
                                )}

                                {/* Due time for next step */}
                                {step.nextStage && currentStep?.timeline?.completedAt && step.sla && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500 leading-tight mt-1">
                                        {t("case.sop_card.due")}: {formatDate(
                                            new Date(new Date(currentStep.timeline.completedAt).getTime() + (step.sla * 3600 * 1000)-(7 *3600*1000)).toISOString()
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressStepPreviewUnit;