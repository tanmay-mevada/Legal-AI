"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResponsiveLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  sidebarWidth?: string;
}

export default function ResponsiveLayout({ 
  sidebar, 
  mainContent, 
  sidebarWidth = "w-80" 
}: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          size="sm"
          className="h-10 w-10 rounded-full p-0 bg-white dark:bg-gray-800 shadow-lg"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        flex h-full flex-col border-r bg-white dark:border-gray-800 dark:bg-gray-900
        ${sidebarWidth} lg:${sidebarWidth} lg:relative lg:translate-x-0
        fixed lg:static top-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebar}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {mainContent}
      </div>
    </div>
  );
}
