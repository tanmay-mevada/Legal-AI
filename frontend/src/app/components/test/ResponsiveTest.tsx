"use client";

import React from "react";

export default function ResponsiveTest() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Responsive Design Test</h2>
      
      {/* Breakpoint Indicators */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Current Breakpoint:</h3>
        <div className="space-y-1 text-sm">
          <div className="xs:block hidden text-green-600">Extra Small (xs: 475px+)</div>
          <div className="sm:block hidden text-green-600">Small (sm: 640px+)</div>
          <div className="md:block hidden text-green-600">Medium (md: 768px+)</div>
          <div className="lg:block hidden text-green-600">Large (lg: 1024px+)</div>
          <div className="xl:block hidden text-green-600">Extra Large (xl: 1280px+)</div>
          <div className="2xl:block hidden text-green-600">2X Large (2xl: 1536px+)</div>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h4 className="font-semibold">Card 1</h4>
          <p className="text-sm">This card adapts to different screen sizes.</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
          <h4 className="font-semibold">Card 2</h4>
          <p className="text-sm">Responsive grid layout example.</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
          <h4 className="font-semibold">Card 3</h4>
          <p className="text-sm">Third card for larger screens.</p>
        </div>
      </div>

      {/* Responsive Typography */}
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-semibold">Responsive Typography</h3>
        <p className="text-sm sm:text-base">
          This text scales appropriately across different screen sizes.
        </p>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Smaller text for mobile, larger for desktop.
        </p>
      </div>

      {/* Responsive Buttons */}
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-semibold">Responsive Buttons</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base">
            <span className="hidden sm:inline">Full Button Text</span>
            <span className="sm:hidden">Short</span>
          </button>
          <button className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg text-sm sm:text-base">
            Secondary
          </button>
        </div>
      </div>

      {/* Responsive Spacing */}
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-semibold">Responsive Spacing</h3>
        <div className="p-2 sm:p-4 lg:p-6 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <p className="text-sm sm:text-base">
            This container has responsive padding: p-2 on mobile, p-4 on small screens, p-6 on large screens.
          </p>
        </div>
      </div>
    </div>
  );
}
