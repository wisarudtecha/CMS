// /src/components/ui/animation/AnimatedNumber.tsx
import React, { useEffect, useState } from "react";

interface AnimatedNumberProps {
  className?: string;
  duration?: number;
  value: number;
  format?: (value: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  className = "",
  duration = 1000,
  value,
  format = (val) => Math.floor(val).toString()
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();
    // const endTime = startTime + duration;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className={`${className} transition-all duration-300`}>
      {format(displayValue)}
    </span>
  );
};

interface AnimatedPercentageProps {
  value: string | number;
  className?: string;
  duration?: number;
}

export const AnimatedPercentage: React.FC<AnimatedPercentageProps> = ({
  value,
  className = "",
  duration = 1000
}) => {
  const numericValue = typeof value === "string" 
    ? parseFloat(value.replace("%", "")) 
    : value;

  return (
    <AnimatedNumber
      value={numericValue}
      className={className}
      duration={duration}
      format={(val) => `${Math.round(val)}%`}
    />
  );
};
