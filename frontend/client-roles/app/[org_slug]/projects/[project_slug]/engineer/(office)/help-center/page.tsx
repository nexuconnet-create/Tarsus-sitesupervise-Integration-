"use client";

import { use, useState } from "react";
import { useMemberships } from "@/lib/hooks/useMemberships";
import EngineerHeader from "../components/EngineerHeader";
import {
  Book,
  MessageCircle,
  Mail,
  Video,
  Search,
  HelpCircle,
  ChevronRight,
  FileText,
  Users,
  Settings,
  Shield,
  CheckCircle,
} from "lucide-react";

interface HelpCenterPageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

const helpCategories = [
  { icon: Book, title: "Documentation", description: "User guides, tutorials, and API references", color: "bg-blue-500" },
  { icon: MessageCircle, title: "Live Chat", description: "Get instant help from our support team", color: "bg-green-500" },
  { icon: Mail, title: "Email Support", description: "Send us a message and we'll respond within 24 hours", color: "bg-purple-500" },
  { icon: Video, title: "Video Tutorials", description: "Watch step-by-step guides on YouTube", color: "bg-red-500" },
];

const faqs = [
  { question: "How do I create a new task?", answer: "Navigate to the Tasks page and click the 'Add Tasks' button. Fill in the required details and click Save." },
  { question: "How do I assign a crew to a task?", answer: "Open a task details and use the 'Assign Crew' option in the work package modal." },
  { question: "How do I track project progress?", answer: "Use the Dashboard to view overall project progress, or check individual task status in the Tasks page." },
  { question: "How do I add a new team member?", answer: "Go to Settings > Team Members and click 'Invite Member' to send an invitation." },
];

const quickLinks = [
  { icon: FileText, label: "Getting Started Guide" },
  { icon: Users, label: "Team Management" },
  { icon: Settings, label: "Project Settings" },
  { icon: Shield, label: "Safety Protocols" },
  { icon: CheckCircle, label: "Quality Standards" },
];

export default function HelpCenterPage({ params }: HelpCenterPageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFaq, setShowFaq] = useState(false);

  return (
    <>
      <EngineerHeader
        title={project ? (project as { name?: string }).name : project_slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        badge="SUPPORT"
      >
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070D4] focus:border-transparent w-64"
          />
        </div>
      </EngineerHeader>

      <div className="p-4 md:p-8 space-y-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.title}
                onClick={() => setSelectedCategory(selectedCategory === category.title ? null : category.title)}
                className={`${category.color} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left ${
                  selectedCategory === category.title ? "ring-2 ring-[#0070D4] ring-offset-2" : ""
                }`}
              >
                <Icon className="text-white mb-4" size={32} />
                <h3 className="font-bold text-white mb-2">{category.title}</h3>
                <p className="text-sm text-white/80">{category.description}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <button
              onClick={() => setShowFaq(!showFaq)}
              className="w-full px-6 py-4 flex items-center justify-between bg-[#021422] text-white hover:bg-gray-900 transition-colors rounded-t-xl"
            >
              <span className="font-bold">Frequently Asked Questions</span>
              <HelpCircle size={24} />
            </button>

            {showFaq && (
              <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`p-6 ${idx !== faqs.length - 1 ? "border-b border-gray-200" : ""} hover:bg-gray-50 transition-colors cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#021422] font-medium">{faq.question}</span>
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#021422] text-white p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide">Quick Links</h3>
            </div>
            <div className="p-4 space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Icon size={18} className="text-[#0070D4]" />
                    <span className="text-sm font-medium text-[#021422]">{link.label}</span>
                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-[#0070D4] rounded-xl p-8 text-white text-center">
          <h3 className="font-bold text-xl mb-2">Still Need Help?</h3>
          <p className="text-white/80 mb-4">Contact our support team for assistance</p>
          <button className="px-6 py-3 bg-white text-[#0070D4] rounded-lg font-bold hover:bg-gray-100 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </>
  );
}
