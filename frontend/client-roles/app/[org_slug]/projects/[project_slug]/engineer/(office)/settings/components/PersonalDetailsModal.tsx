"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, User, Mail, Briefcase, MapPin } from "lucide-react";

interface PersonalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClasses = "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#021422] focus:bg-white transition-colors";

const SectionLabel = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon size={14} className="text-[#021422]" />
    <span className="text-xs font-semibold uppercase tracking-wider text-[#021422]">{children}</span>
  </div>
);

const FormField = ({ label, type = "text", placeholder = "" }: { label: string; type?: string; placeholder?: string }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-gray-500">{label}</label>
    <input type={type} placeholder={placeholder} className={inputClasses} />
  </div>
);

export default function PersonalDetailsModal({ isOpen, onClose }: PersonalDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-[#021422]">Personal Details</h2>
          <button onClick={onClose} className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <SectionLabel icon={User}>Personal Information</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" placeholder="John" />
              <FormField label="Last Name" placeholder="Doe" />
              <FormField label="Email Address" type="email" placeholder="john@example.com" />
              <FormField label="Gender" placeholder="Select gender" />
            </div>
          </section>

          <section>
            <SectionLabel icon={MapPin}>Address</SectionLabel>
            <FormField label="Residential Address" placeholder="123 Main St, City, Country" />
          </section>

          <div className="flex gap-6 pt-2">
            <div className="flex-1">
              <SectionLabel icon={ImageIcon}>Photo</SectionLabel>
              <div className="border border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center text-center bg-gray-50/30 hover:bg-gray-50 transition-colors cursor-pointer group w-32">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
                  <ImageIcon size={20} className="text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-500">Upload Photo</p>
              </div>
            </div>

            <div className="flex-1">
              <SectionLabel icon={Briefcase}>Role</SectionLabel>
              <div className="px-3 py-2.5 rounded-lg bg-gray-100 text-sm text-gray-700 font-medium">
                Site Engineer
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 bg-[#021422] text-white text-sm font-medium rounded-lg hover:bg-[#021422]/90 transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}