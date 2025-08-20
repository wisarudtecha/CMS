// /src/components/ui/progressTimeline/ProgressTimeline.tsx
import React from "react";
import { CheckLineIcon, TimeIcon, AlertHexaIcon } from "@/icons";
import { formatDate } from "@/utils/crud";
import type { ProgressTimelineProps, TimelineStep } from "@/types/case";

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  steps,
  orientation = "horizontal",
  size = "md",
  showTimestamps = true,
  showDescriptions = false,
  animated = true,
  className = "",
  onStepClick
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        node: "w-8 h-8",
        icon: "w-4 h-4",
        line: "h-0.5",
        text: "text-xs",
        gap: "gap-2"
      },
      md: {
        node: "w-10 h-10",
        icon: "w-5 h-5",
        line: "h-0.5",
        text: "text-sm",
        gap: "gap-3"
      },
      lg: {
        node: "w-12 h-12",
        icon: "w-6 h-6",
        line: "h-1",
        text: "text-base",
        gap: "gap-4"
      }
    };
    return sizes[size];
  };

  const getStatusConfig = (status: TimelineStep["status"]) => {
    const configs = {
      // completed: {
      //   node: "bg-green-500 border-green-500 text-white",
      //   line: "bg-green-500",
      //   text: "text-green-600 dark:text-green-400",
      //   icon: CheckCircleIcon
      // },
      completed: {
        node: "bg-blue-500 border-blue-500 text-white",
        line: "bg-blue-500",
        text: "text-blue-600 dark:text-blue-400",
        icon: CheckLineIcon
      },
      // active: {
      //   node: "bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900",
      //   line: "bg-blue-500",
      //   text: "text-blue-600 dark:text-blue-400",s
      //   icon: TimeIcon
      // },
      active: {
        node: "bg-gray-400 border-gray-400 text-white ring-4 ring-blue-100 dark:ring-blue-900",
        line: "bg-gray-400",
        text: "text-gray-600 dark:text-gray-400",
        icon: TimeIcon
      },
      // pending: {
      //   node: "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400",
      //   line: "bg-gray-200 dark:bg-gray-700",
      //   text: "text-gray-600 dark:text-gray-400",
      //   icon: null
      // },
      pending: {
        node: "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400",
        line: "bg-gray-200 dark:bg-gray-700",
        text: "text-gray-600 dark:text-gray-400",
        icon: null
      },
      // error: {
      //   node: "bg-red-500 border-red-500 text-white",
      //   line: "bg-red-500",
      //   text: "text-red-600 dark:text-red-400",
      //   icon: AlertHexaIcon
      // }
      error: {
        node: "bg-red-300 border-red-300 text-white",
        line: "bg-red-300",
        text: "text-red-600 dark:text-red-400",
        icon: AlertHexaIcon
      }
    };
    return configs[status];
  };

  const completedSteps = steps.filter(step => step.status === "completed").length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  const sizeClasses = getSizeClasses();

  if (orientation === "vertical") {
    return (
      <div className={`flex flex-col ${className}`}>
        {steps.map((step, index) => {
          const statusConfig = getStatusConfig(step.status);
          const Icon = step.icon || statusConfig.icon;
          const isLast = index === steps.length - 1;
          const isClickable = !!onStepClick;

          return (
            <div key={step.id} className="flex bg-blue">
              {/* Left side - Node and line */}
              <div className="flex flex-col items-center">
                <button
                  className={`
                    ${sizeClasses.node} rounded-full border-2 flex items-center justify-center
                    ${statusConfig.node} relative z-10
                    ${animated ? 'transition-all duration-300' : ''}
                    ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                  `}
                  onClick={() => isClickable && onStepClick(step, index)}
                  disabled={!isClickable}
                >
                  {Icon ? (
                    <Icon className={sizeClasses.icon} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  )}
                </button>
                
                {!isLast && (
                  <div className={`w-0.5 flex-1 mt-0 ${statusConfig.line} min-h-8`}></div>
                )}
              </div>

              {/* Right side - Content */}
              <div className={`flex-1 ${sizeClasses.gap}`}>
                <div className={`font-medium ${statusConfig.text} ${sizeClasses.text} ml-4 mt-2`}>
                  {step.label}
                </div>
                
                {showDescriptions && step.description && (
                  <div className={`${sizeClasses.text} text-gray-600 dark:text-gray-300 mt-1`}>
                    {step.description}
                  </div>
                )}
                
                {showTimestamps && step.timestamp && (
                  <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1`}>
                    {formatDate(step.timestamp)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={`relative ${className}`}>
      {/* Progress line background */}
      <div className={`absolute top-1/5 left-0 right-0 ${sizeClasses.line} bg-gray-200 dark:bg-gray-700 transform -translate-y-1/4`}></div>
      
      {/* Progress line fill */}
      <div 
        className={`absolute top-1/5 left-0 ${sizeClasses.line} bg-blue-500 transform -translate-y-1/4 ${animated ? 'transition-all duration-500' : ''}`}
        style={{ width: `${progressPercentage}%` }}
      ></div>

      {/* Steps */}
      <div className="flex items-start justify-between relative z-10">
        {steps.map((step, index) => {
          const statusConfig = getStatusConfig(step.status);
          const Icon = step.icon || statusConfig.icon;
          const isClickable = !!onStepClick;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <button
                className={`
                  ${sizeClasses.node} rounded-full border-2 flex items-center justify-center mb-
                  ${statusConfig.node} relative z-10
                  ${animated ? 'transition-all duration-300' : ''}
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                `}
                onClick={() => isClickable && onStepClick(step, index)}
                disabled={!isClickable}
              >
                {Icon ? (
                  <Icon className={sizeClasses.icon} />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-current"></div>
                )}
              </button>
              
              <div className={`text-center max-w-20 ${sizeClasses.gap} mt-4`}>
                <div className={`font-medium ${statusConfig.text} ${sizeClasses.text}`}>
                  {step.label}
                </div>
                
                {showDescriptions && step.description && (
                  <div className={`${sizeClasses.text} text-gray-600 dark:text-gray-300 mt-1`}>
                    {step.description}
                  </div>
                )}
                
                {showTimestamps && step.timestamp && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(step.timestamp)}
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
