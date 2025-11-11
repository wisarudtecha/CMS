// /src/components/common/Input.tsx
import React from "react";
import "@/styles/Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input: React.FC<InputProps> = ({ error, className = "", ...props }) => {
  return (
    <input
      className={`input ${error ? "input-error" : ""} ${className}`}
      {...props}
    />
  );
};

export default Input;
