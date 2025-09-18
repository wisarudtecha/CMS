// components/progress/ProgressBar.tsx
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import DateStringToDateFormat from '../../date/DateToString';
import { useTranslation } from '@/hooks/useTranslation';
import { getTimeDifference, isSlaViolated, ProgressStepPreviewProps } from '../sopStepTranForm';

const ProgressStepPreviewUnit: React.FC<ProgressStepPreviewProps> = ({ progressSteps }) => {

    const {language} = useTranslation();
    return (
        <div className="mb-6">
            <div className="flex flex-col">
                {progressSteps.map((step, index) => {
                    const isLastStep = index === progressSteps.length - 1;
                    const nextStep = !isLastStep ? progressSteps[index + 1] : null;
                    const violated = isSlaViolated(step);
                    // Determine line color for this segment
                    const shouldShowActiveLine =
                        (step.completed && nextStep?.completed) ||
                        (step.completed && nextStep?.current) ||
                        (step.current);

                    return (
                        <div key={step.id} className="flex items-start justify-between relative">
                            {/* Left side - Circle and connecting line */}
                            <div className="flex flex-col items-center relative">
                                {/* Step Circle */}
                                <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-800 relative z-10 flex-shrink-0
                                ${step.completed
                                        ? violated
                                            ? 'border-red-500 text-red-500'
                                            : 'border-blue-500 text-blue-500'
                                        : step.current
                                            ? violated ? 'border-red-500 text-red-500'
                                                : 'border-blue-500 text-blue-500'
                                            : 'border-gray-300 dark:border-gray-600 text-gray-400'
                                    }
                            `}>
                                    {step.completed ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <Circle className={`w-3 h-3 ${step.current ? 'fill-current' : ''}`} />
                                    )}
                                </div>

                                {/* Vertical Connecting Line to Next Step */}
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
                                        {index < progressSteps.length - 1 && progressSteps[index + 1]?.timeline?.completedAt && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                                {(() => {
                                                    const timeDiff = getTimeDifference(step, progressSteps[index + 1]);
                                                    return timeDiff && (
                                                        <div className={`${!violated?"bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300":"bg-red-100 dark:bg-red-900 border-red-500 text-red-500 dark:text-red-300"} px-2 py-1 rounded text-xs font-medium whitespace-nowrap`}>
                                                            {timeDiff}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right side - Step Label and Time */}
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
                                        {DateStringToDateFormat(step.timeline.completedAt, true,language)}
                                    </div>
                                )}

                                {step.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                                        {step.description}
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