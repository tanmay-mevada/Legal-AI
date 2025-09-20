"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onNewChat?: () => void;
  showNewChatButton?: boolean;
}

export default function MobileHeader({ 
  title, 
  subtitle, 
  onNewChat, 
  showNewChatButton = false 
}: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {showNewChatButton && onNewChat && (
        <button
          onClick={onNewChat}
          className="ml-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <span className="hidden sm:inline">New Chat</span>
          <span className="sm:hidden">New</span>
        </button>
      )}
    </div>
  );
}
