"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResponsiveLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
}

export default function ResponsiveLayout({ 
  sidebar, 
  mainContent
}: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <div className="fixed z-50 lg:hidden top-3 left-3">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          size="sm"
          className="p-0 transition-colors bg-white border border-gray-200 rounded-full shadow-lg h-11 w-11 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <div className={`
        flex h-full flex-col border-r bg-white dark:border-gray-800 dark:bg-gray-900
        w-80 lg:w-80 lg:relative lg:translate-x-0
        fixed lg:static top-0 left-0 z-50
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-xl lg:shadow-none
      `}>
        {sidebar}
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col flex-1 min-w-0">
        <div className="w-full h-16 lg:hidden" /> {/* Spacer for mobile menu button */}
        <div className="flex-1 overflow-hidden">
          {mainContent}
        </div>
      </div>
    </div>
  );
}
