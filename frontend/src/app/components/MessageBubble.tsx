"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { User, Bot, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  type: "user" | "ai" | "error";
  content: string;
  timestamp: Date;
  title?: string;
  fileName?: string;
  isMarkdown?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === "user";
  const isError = message.type === "error";

  return (
    <div className={cn(
      "flex gap-3 max-w-4xl",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isError 
            ? "bg-red-100 dark:bg-red-900/20" 
            : "bg-blue-100 dark:bg-blue-900/20"
        )}>
          {isError ? (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          ) : (
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>
      )}
      
      <div className={cn(
        "flex flex-col gap-1 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          isUser 
            ? "bg-blue-600 text-white" 
            : isError
            ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
        )}>
          {message.title && !isUser && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {message.title}
              </span>
            </div>
          )}
          
          <div className={cn(
            "text-sm",
            isUser ? "text-white" : "text-gray-900 dark:text-white"
          )}>
            {message.isMarkdown ? (
              <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                {message.content}
              </ReactMarkdown>
            ) : (
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {isUser && (
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </div>
          )}
          <span>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
      )}
    </div>
  );
}

