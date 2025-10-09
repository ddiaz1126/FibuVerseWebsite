// components/ui/Button.tsx
import React from "react";

interface ButtonProps {
  label?: string; // optional text label
  onClick?: () => void;
  variant?: "primary" | "success" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode; // still supports custom JSX children
}

export function Button({
  label,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  icon,
  children,
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-lg transition-colors flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
  };
  
  const sizes = {
    sm: "text-[10px] py-1 px-2",
    md: "text-xs py-2 px-3",
    lg: "text-sm py-2.5 px-4",
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {icon && <span>{icon}</span>}
      {label || children}
    </button>
  );
}
