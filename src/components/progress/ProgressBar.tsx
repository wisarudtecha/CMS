// components/progress/ProgressBar.tsx
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import DateStringToDateFormat from '../date/DateToString';

interface ProgressSteps {
    id: string;
    title: string;
    completed: boolean;
    current?: boolean;
    type?: string;
    description?: string;
    timeline?: {
        completedAt?: string;
        duration?: number;
        userOwner?: string;
    };
}

interface ProgressStepPreviewProps {
    progressSteps: ProgressSteps[];
}

const ProgressStepPreview: React.FC<ProgressStepPreviewProps> = ({ progressSteps }) => {
    const getTimeDifference = (fromStep: ProgressSteps, toStep: ProgressSteps): string => {
        
        if (!fromStep.timeline?.completedAt || !toStep.timeline?.completedAt) {
            return '';
        }
       
        const fromTime = new Date(fromStep.timeline.completedAt).getTime();
        const toTime = new Date(toStep.timeline.completedAt).getTime();
        const diffMs = toTime - fromTime;

        if (diffMs <= 0) return '';

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);

        if (diffHours > 0) {
            const remainingMinutes = diffMinutes % 60;
            return `${diffHours}h ${remainingMinutes}m`;
        } else if (diffMinutes > 0) {
            const remainingSeconds = diffSeconds % 60;
            return `${diffMinutes}m ${remainingSeconds}s`;
        } else {
            return `${diffSeconds}s`;
        }
    };

    return (
        <div className="mb-6">

            <div className="flex items-start justify-between relative" style={{ minHeight: '120px' }}>
                {progressSteps.map((step, index) => {
                    const isLastStep = index === progressSteps.length - 1;
                    const nextStep = !isLastStep ? progressSteps[index + 1] : null;

                    // Determine line color for this segment
                    const shouldShowActiveLine =
                        (step.completed && nextStep?.completed) ||
                        (step.completed && nextStep?.current) ||
                        (step.current);

                    return (
                        <div key={step.id} className="flex flex-col items-center relative flex-1">
                            {/* Connecting Line to Next Step */}

                            {step.current ? <div className="absolute flex top-4 left-0  w-full h-0.5 z-0" style={{ transform: 'translateY(-1px)' }}>
                                <div className={`
                                        w-1/2 h-full
                                        ${shouldShowActiveLine ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                                    `}></div>
                                <div className={`
                                        w-1/2 h-full  
                                        bg-gray-300 dark:bg-gray-600
                                    `}></div>
                            </div>
                                : <div className="absolute top-4 left-0  w-full h-0.5 z-0" style={{ transform: 'translateY(-1px)' }}>
                                    <div className={`
                                        w-full h-full
                                        ${shouldShowActiveLine ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                                    `}></div>
                                </div>}


                            {/* Step Circle */}
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 bg-white dark:bg-gray-800 relative z-10
                                ${step.completed
                                    ? 'border-blue-500 text-blue-500'
                                    : step.current
                                        ? 'border-blue-500 text-blue-500'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-400'
                                }
                            `}>
                                {step.completed ? (
                                    <CheckCircle className="w-5 h-5 fill-current" />
                                ) : (
                                    <Circle className={`w-3 h-3 ${step.current ? 'fill-current' : ''}`} />
                                )}
                            </div>

                            {/* Time Difference Badge - Show time FROM previous step TO current step */}
                            {index > 0 && progressSteps[index - 1] && step.timeline?.completedAt && (
                                <div className="absolute top-1 left-0 transform -translate-x-1/2 z-20">
                                    {(() => {
                                        const timeDiff = getTimeDifference(progressSteps[index - 1], step);
                                        return timeDiff && (
                                            <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                                                {timeDiff}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Step Label and Time */}
                            <div className="text-center px-2 mt-6">
                                <div className={`
                                    text-xs font-medium mb-1 leading-tight
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
                                        {DateStringToDateFormat(step.timeline.completedAt,true)}
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

export default ProgressStepPreview;