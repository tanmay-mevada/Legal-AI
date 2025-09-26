"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Info, Shield, ExternalLink } from "lucide-react";
import { isUserAdmin } from "@/lib/admin";

interface TopNavbarProps {
  user?: {
    displayName?: string | null;
    email?: string | null;
  } | null;
}

export default function TopNavbar({ user }: TopNavbarProps) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
      {/* Logo/Title */}
      <div className="flex items-center">
        <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          TautologyAI
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-2">
        <Link href="/about">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
          >
            <Info className="w-4 h-4 mr-1" />
            About
          </Button>
        </Link>
        
        {user && isUserAdmin(user.email || null) && (
          <Link href="/admin" target="_blank">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
            >
              <Shield className="w-4 h-4 mr-1" />
              Admin
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}