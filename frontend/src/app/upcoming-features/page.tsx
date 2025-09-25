"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Brain, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  MessageSquare, 
  FileSearch,
  Database,
  BarChart3,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpcomingFeaturesPage() {
  const upcomingFeatures = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Advanced AI Models",
      description: "Integration with GPT-4 Turbo and Claude 3 for more sophisticated document analysis",
      category: "AI Enhancement",
      timeline: "Q1 2026",
      status: "In Development"
    },
    {
      icon: <FileSearch className="w-8 h-8" />,
      title: "Multi-Document Comparison",
      description: "Compare multiple contracts side-by-side with AI-powered difference detection",
      category: "Document Analysis",
      timeline: "Q2 2026",
      status: "Planned"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Share documents, collaborate on reviews, and manage team access controls",
      category: "Collaboration",
      timeline: "Q1 2026",
      status: "In Development"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Interactive Q&A Chat",
      description: "Ask specific questions about your documents and get instant AI-powered answers",
      category: "AI Enhancement",
      timeline: "Q1 2026",
      status: "Coming Soon"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Document Templates Library",
      description: "Access a vast library of legal document templates with AI-guided customization",
      category: "Templates",
      timeline: "Q2 2026",
      status: "Planned"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Track document processing history, risk trends, and team productivity metrics",
      category: "Analytics",
      timeline: "Q2 2026",
      status: "Planned"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Advanced Security",
      description: "End-to-end encryption, SOC 2 compliance, and enterprise-grade security features",
      category: "Security",
      timeline: "Q1 2026",
      status: "In Development"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Language Support",
      description: "Support for documents in Spanish, French, German, and other major languages",
      category: "Localization",
      timeline: "Q3 2026",
      status: "Research"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "API & Integrations",
      description: "RESTful API and integrations with popular legal software and CRM systems",
      category: "Integration",
      timeline: "Q2 2026",
      status: "Planned"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Compliance Automation",
      description: "Automated compliance checking against GDPR, CCPA, and industry regulations",
      category: "Compliance",
      timeline: "Q3 2026",
      status: "Research"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Coming Soon":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "In Development":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Planned":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Research":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI Enhancement":
        return "text-blue-600 dark:text-blue-400";
      case "Document Analysis":
        return "text-green-600 dark:text-green-400";
      case "Collaboration":
        return "text-purple-600 dark:text-purple-400";
      case "Security":
        return "text-red-600 dark:text-red-400";
      case "Analytics":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to TautologyAI
            </Button>
          </Link>
          
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <Sparkles className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            
            <h1 className="mb-4 text-3xl font-semibold text-gray-900 dark:text-white">
              Upcoming Features
            </h1>
            
            <p className="max-w-2xl mx-auto text-base text-gray-600 dark:text-gray-400">
              TautologyAI is currently a <span className="font-medium text-gray-800 dark:text-gray-200">prototype</span> showcasing 
              AI-driven legal document analysis. Heres whats coming next.
            </p>
          </div>

          {/* Prototype Notice */}
          <div className="p-4 mb-8 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Sparkles className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                  Current Version: Prototype
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Youre experiencing an early version of TautologyAI. The features below represent our development roadmap.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {upcomingFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-4 transition-colors bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              {/* Icon and Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-gray-100 rounded dark:bg-gray-700">
                  {React.cloneElement(feature.icon, { 
                    className: "w-5 h-5 text-gray-600 dark:text-gray-400" 
                  })}
                </div>
                <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-400">
                  {feature.status}
                </span>
              </div>

              {/* Content */}
              <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-white">
                {feature.title}
              </h3>
                
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {feature.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {feature.timeline}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
              Stay Updated
            </h2>
            <p className="max-w-md mx-auto mb-4 text-sm text-gray-600 dark:text-gray-400">
              Follow our development progress and try the current prototype. Your feedback helps shape our roadmap.
            </p>
            <div className="flex justify-center">
              <Link href="/">
                <Button className="text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                  Try Current Prototype
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-center text-gray-500 dark:text-gray-400">
          <p>
            Features and timelines are subject to change based on user feedback and development priorities.
          </p>
        </div>
      </div>
    </div>
  );
}