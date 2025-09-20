"use client";

import React from "react";
import { AlertTriangle, Shield, AlertCircle } from "lucide-react";

interface RiskWarningBarProps {
  riskLevel: "Low" | "Medium" | "High";
  riskFactors?: string[];
}

export default function RiskWarningBar({ riskLevel, riskFactors }: RiskWarningBarProps) {
  const getRiskConfig = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return {
          icon: AlertTriangle,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-800 dark:text-red-200",
          iconColor: "text-red-600 dark:text-red-400",
          label: "High Risk"
        };
      case "medium":
        return {
          icon: AlertCircle,
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-800 dark:text-yellow-200",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          label: "Medium Risk"
        };
      case "low":
        return {
          icon: Shield,
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-800 dark:text-green-200",
          iconColor: "text-green-600 dark:text-green-400",
          label: "Low Risk"
        };
      default:
        return null;
    }
  };

  const config = getRiskConfig(riskLevel);
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 mb-4`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${config.textColor}`}>
              {config.label}
            </span>
          </div>
          {riskFactors && riskFactors.length > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p className="mb-1">Key concerns:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {riskFactors.slice(0, 3).map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
                {riskFactors.length > 3 && (
                  <li>...and {riskFactors.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
