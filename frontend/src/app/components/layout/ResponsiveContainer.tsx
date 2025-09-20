"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  full: "max-w-full"
};

const paddingClasses = {
  none: "",
  sm: "p-2 sm:p-4",
  md: "p-3 sm:p-4 lg:p-6",
  lg: "p-4 sm:p-6 lg:p-8"
};

export default function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = "4xl",
  padding = "md"
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "w-full mx-auto",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}
