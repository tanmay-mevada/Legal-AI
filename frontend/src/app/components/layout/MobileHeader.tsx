"use client";

import React from "react";
import Link from "next/link";

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
    <div className="flex items-center justify-between p-3 border-b border-gray-200 sm:p-4 dark:border-gray-700">
      <div className="flex items-center flex-1 min-w-0 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-gray-900 truncate sm:text-lg dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Upcoming Features Link */}
        <Link 
          href="/upcoming-features"
          className="items-center hidden px-2 py-1 text-xs text-gray-600 transition-colors sm:flex dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Upcoming Features
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Mobile Upcoming Features Link */}
        <Link 
          href="/upcoming-features"
          className="px-2 py-1 text-xs text-gray-600 transition-colors sm:hidden dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Features
        </Link>
        
        {/* {showNewChatButton && onNewChat && (
          <button
            onClick={onNewChat}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            <span className="hidden sm:inline">New Chat</span>
            <span className="sm:hidden">New</span>
          </button>
        )} */}
      </div>
    </div>
  );
}
