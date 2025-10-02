"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Mail, 
  MessageSquare, 
  Shield, 
  Zap, 
 
  Globe,
  ArrowLeft,
  ExternalLink,
  Github,
  Trophy,
  Send,
  User,
  Instagram
} from "lucide-react";

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamMembers = [
    { name: "Jaiveek Chauhan", email: "jaivikchauhan2007@gmail.com" },
    { name: "Tanmay Mevada", email: "tanmaymevada24@gmail.com" },
    { name: "Manash Gusani", email: "manashgusani427@gmail.com" },
    { name: "Rajveer Jadeja", email: "rajveersinhjadeja@gmail.com" },
    { name: "Nishith Bodar", email: "bodarnishith32@gmail.com" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center mb-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="transition-colors hover:text-gray-700 dark:hover:text-gray-300">
            TautologyAI
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900 dark:text-white">About & Contact</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            About TautologyAI
          </h1>
          {/* <p className="text-lg text-gray-600 dark:text-gray-400">
            Empowering legal professionals with AI-driven document analysis and insights
          </p> */}
        </div>

        {/* Hackathon Information */}
        <Card className="p-6 mb-8 bg-white border border-gray-200 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Trophy className="w-6 h-6 mr-3 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Hackathon Project
            </h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="mb-2 text-lg font-medium text-blue-900 dark:text-blue-100">Gen AI Exchange Hackathon</h3>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Problem Statement:</strong> [Student] Generative AI for Demystifying Legal Documents
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Our Solution</h3>
              <p className="text-gray-600 dark:text-gray-300">
                TautologyAI democratizes legal document analysis by making advanced AI technology 
                accessible to legal professionals, businesses, and individuals. We believe that 
                understanding legal documents shouldnt require extensive legal training or expensive 
                consultation fees.
              </p>
            </div>
          </div>
        </Card>

        {/* Team Section */}
        <Card className="p-6 mb-8 bg-white border border-gray-200 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Image src="/logo.png" alt="Team TurboC++ Logo" width={40} height={40} className="object-cover w-10 h-10 mr-3 bg-white rounded-lg dark:bg-gray-800" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Team TurboC++
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 mr-3 bg-gray-100 rounded-full dark:bg-gray-700">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Project Links */}
        <Card className="p-6 mb-8 bg-white border border-gray-200 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Project Resources
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="https://github.com/tanmay-mevada/Legal-AI"
              className="flex items-center p-4 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
            >
              <Github className="w-5 h-5 mr-3 text-gray-800 dark:text-gray-200" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">GitHub Repository</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Source code & documentation</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            
            <a
              href="https://storage.googleapis.com/vision-hack2skill-production/innovator/USER00972666/1758477302364-GenAIExchangeHackathonPrototypeSubmissionByTautologyAITurboC.pdf"
              className="flex items-center p-4 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
            >
              <FileText className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">Presentation (PPT)</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Project overview & solution</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            
            <a
              href="https://youtu.be/8r8_jnx0UBs?si=1yOqEsTlGbypWcb_"
              className="flex items-center p-4 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
            >
              <MessageSquare className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">Demo Video</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Product demonstration</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </Card>

        {/* Features */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Card className="p-6 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-2 mr-3 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Smart Document Processing
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Advanced OCR and AI analysis extract key information from PDFs, contracts, 
              and legal documents with high accuracy.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-2 mr-3 bg-green-100 rounded-lg dark:bg-green-900/30">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Instant Analysis
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Get comprehensive summaries, risk assessments, and key party identification 
              in seconds, not hours.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-2 mr-3 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Risk Detection
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Automatically identify potential risks, red flags, and important clauses 
              that require attention or negotiation.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-2 mr-3 bg-orange-100 rounded-lg dark:bg-orange-900/30">
                <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interactive Q&A
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Ask questions about your documents and get clear, contextual answers 
              backed by AI analysis.
            </p>
          </Card>
        </div>

        {/* Technology Section */}
        <Card className="p-6 mb-8 bg-white border border-gray-200 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Powered by Advanced AI
          </h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">Google Cloud Document AI for OCR and text extraction</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
              <span className="text-gray-700 dark:text-gray-300">Vertex AI and Gemini for intelligent analysis</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-700 dark:text-gray-300">Enterprise-grade security and privacy protection</span>
            </div>
          </div>
        </Card>

        {/* Contact Form */}
        <Card id="contact" className="p-6 mb-8 bg-white border border-gray-200 sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Get in Touch
          </h2>
          
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Information */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Email</div>
                    <a 
                      href="mailto:turbo.cpp.nu@gmail.com" 
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      turbo.cpp.nu@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">GitHub</div>
                    <a 
                      href="https://github.com/tanmay-mevada/legal-ai" 
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Repository
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <Instagram className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Instagram</div>
                    <a 
                      href="https://www.instagram.com/turbo.cpp.nu?igsh=bWk5MjVmcHN3cGZw&utm_source=qr" 
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Connect on Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Send us a Message
              </h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <Input
                    placeholder="Subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                    rows={4}
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
                
                {submitStatus === 'success' && (
                  <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md dark:bg-green-900/30 dark:text-green-300">
                    Message sent successfully! Well get back to you soon.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-300">
                    Failed to send message. Please try again or contact us directly.
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white rounded-full animate-spin border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <Link href="/">
              <Button className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Try TautologyAI Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 mt-12 text-sm text-center text-gray-500 border-t border-gray-200 dark:border-gray-700 dark:text-gray-400">
          <p className="mb-2">
            &copy; 2025 TautologyAI - Team TurboC++.
          </p>
          <p>
            This is a prototype application developed for the Gen AI Exchange Hackathon.
          </p>
        </div>
      </div>
    </div>
  );
}