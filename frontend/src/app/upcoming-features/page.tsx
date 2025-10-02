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
  Search
} from "lucide-react";

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



  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Upcoming Features
          </h1>
          <p className="max-w-4xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed px-4">
            Discover the exciting new capabilities coming to TautologyAI. 
            Our roadmap focuses on enhancing user experience, expanding AI capabilities, 
            and building the future of legal technology.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <Badge className={`${getStatusColor(feature.status)} text-xs font-medium px-2 py-1`}>
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3rem]">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-gray-600 line-clamp-4 min-h-[5rem]">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {feature.timeline}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    feature.priority === 'High' ? 'bg-red-400' : 
                    feature.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} title={`${feature.priority} Priority`}></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center px-4">
          <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <h2 className="mb-4 text-2xl sm:text-3xl font-bold text-gray-900">
                Have a Feature Suggestion?
              </h2>
              <p className="mb-6 sm:mb-8 text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                We are always looking to improve TautologyAI based on user feedback. 
                Share your ideas and help shape the future of legal AI technology.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                <a 
                  href="/about#contact"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  Contact Us
                </a>
                <a 
                  href="https://github.com/tanmay-mevada/Legal-AI/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-gray-700 transition-all duration-200 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold"
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
