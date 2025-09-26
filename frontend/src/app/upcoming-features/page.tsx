"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Brain, 
  Users, 
  Globe, 
  Shield, 
  BarChart3,
  FileText,
  Clock,
  MessageSquare,
  Smartphone,
  Database,
  Search,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UpcomingFeaturesPage() {
  const features = [
    {
      title: "Advanced AI Legal Research",
      description: "Enhanced natural language processing for complex legal queries with citation verification and precedent analysis.",
      icon: <Brain className="w-6 h-6" />,
      status: "In Development",
      timeline: "Q2 2024",
      priority: "High"
    },
    {
      title: "Multi-Language Document Support",
      description: "Process and analyze legal documents in 15+ languages with automated translation and cultural context awareness.",
      icon: <Globe className="w-6 h-6" />,
      status: "Planned",
      timeline: "Q3 2024", 
      priority: "High"
    },
    {
      title: "Collaborative Workspace",
      description: "Real-time collaboration tools for legal teams with secure document sharing, comments, and version control.",
      icon: <Users className="w-6 h-6" />,
      status: "In Development",
      timeline: "Q2 2024",
      priority: "Medium"
    },
    {
      title: "Mobile Application",
      description: "Native iOS and Android apps with offline document access and voice-to-text legal note taking.",
      icon: <Smartphone className="w-6 h-6" />,
      status: "Planning",
      timeline: "Q4 2024",
      priority: "Medium"
    },
    {
      title: "Advanced Analytics Dashboard", 
      description: "Comprehensive insights into document patterns, case outcomes, and predictive legal analytics.",
      icon: <BarChart3 className="w-6 h-6" />,
      status: "In Development",
      timeline: "Q3 2024",
      priority: "High"
    },
    {
      title: "Smart Contract Analysis",
      description: "AI-powered review of smart contracts with vulnerability detection and compliance checking.",
      icon: <Shield className="w-6 h-6" />,
      status: "Research",
      timeline: "Q4 2024",
      priority: "Low"
    },
    {
      title: "Automated Document Generation",
      description: "Generate legal documents from templates with AI-assisted clause recommendations and customization.",
      icon: <FileText className="w-6 h-6" />,
      status: "Planned",
      timeline: "Q3 2024",
      priority: "Medium"
    },
    {
      title: "Real-Time Case Monitoring",
      description: "Track ongoing cases with automated updates from court systems and relevant legal developments.",
      icon: <Clock className="w-6 h-6" />,
      status: "Research",
      timeline: "2025",
      priority: "Low"
    },
    {
      title: "AI Legal Assistant Chat",
      description: "Intelligent chatbot for instant legal guidance, document explanations, and procedural help.",
      icon: <MessageSquare className="w-6 h-6" />,
      status: "Prototype",
      timeline: "Q2 2024",
      priority: "High"
    },
    {
      title: "Enhanced Search & Filtering",
      description: "Advanced semantic search with boolean operators, date ranges, and jurisdiction-specific filtering.",
      icon: <Search className="w-6 h-6" />,
      status: "In Development",
      timeline: "Q2 2024",
      priority: "High"
    },
    {
      title: "Cloud Storage Integration",
      description: "Seamless integration with major cloud providers (AWS, Google Drive, OneDrive) for document management.",
      icon: <Database className="w-6 h-6" />,
      status: "Planned",
      timeline: "Q3 2024",
      priority: "Medium"
    },
    {
      title: "Performance Optimization",
      description: "Enhanced processing speed with distributed computing and improved caching for large document sets.",
      icon: <Zap className="w-6 h-6" />,
      status: "Ongoing",
      timeline: "Continuous",
      priority: "High"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Development":
        return "bg-blue-100 text-blue-800";
      case "Planned":
        return "bg-green-100 text-green-800";
      case "Research":
        return "bg-purple-100 text-purple-800";
      case "Prototype":
        return "bg-orange-100 text-orange-800";
      case "Planning":
        return "bg-yellow-100 text-yellow-800";
      case "Ongoing":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Upcoming Features
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600">
            Discover the exciting new capabilities coming to TautologyAI. 
            Our roadmap focuses on enhancing user experience, expanding AI capabilities, 
            and building the future of legal technology.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="transition-shadow duration-200 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                  <span className="text-xs font-medium text-gray-500">
                    {feature.timeline}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Have a Feature Suggestion?
              </h2>
              <p className="mb-6 text-gray-600">
                We are always looking to improve TautologyAI based on user feedback. 
                Share your ideas and help shape the future of legal AI technology.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a 
                  href="/about#contact"
                  className="inline-flex items-center justify-center px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Contact Us
                </a>
                <a 
                  href="https://github.com/tanmay-mevada/Legal-AI/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  GitHub Issues
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
