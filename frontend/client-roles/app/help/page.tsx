"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, Headphones } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    category: "Getting Started",
    items: [
      { q: "How do I register as a vendor?", a: "Go to the Vendor Register page, fill in your company details, and create an account. After registration, complete the KYC verification to get approved." },
      { q: "What documents do I need for KYC?", a: "You'll need your NIN, BVN, CAC registration number, TIN, director's ID, and bank account details. Each document is verified individually." },
      { q: "How long does KYC approval take?", a: "Typically 24-48 hours. You'll receive a notification once your account is approved." },
    ],
  },
  {
    category: "Orders & Quotes",
    items: [
      { q: "How do I find available requisitions?", a: "Check the Requisitions Inbox page for live RFQs from project managers. You can filter by priority and status." },
      { q: "How do I submit a quote?", a: "Open a requisition, click Submit RFQ, enter your pricing per item, set a delivery estimate, and submit. The PM will review and respond." },
      { q: "What happens when a PM counters my quote?", a: "You'll see a Counter Offer banner in the requisition details. You can Accept the counter, Decline it, or submit a new counter." },
    ],
  },
  {
    category: "Deliveries",
    items: [
      { q: "How do I update delivery status?", a: "Open the delivery from the Deliveries page. Tap the status button to advance: Loading → Dispatched → En Route → Arrived." },
      { q: "What is the QR code for?", a: "Each delivery has a QR code that the site supervisor scans on arrival to confirm delivery. You can download it from the delivery drawer." },
      { q: "When is a delivery marked as complete?", a: "After the supervisor scans the QR code and confirms receipt. You'll see 'Delivery Completed' in the status flow." },
    ],
  },
  {
    category: "Payments",
    items: [
      { q: "How do I submit an invoice?", a: "Open a delivered purchase order and click 'Submit Invoice' in the PO details drawer. Enter your final pricing and submit." },
      { q: "When do I get paid?", a: "After the PM approves your invoice, the escrow payment is released. You can track payment status on the Payouts page." },
      { q: "Where can I see my earnings?", a: "The Payouts page shows all settlements: paid, pending, and processing. You can also see your Revenue MTD on the dashboard." },
    ],
  },
  {
    category: "Account & Profile",
    items: [
      { q: "How do I update my company profile?", a: "Go to Profile and click 'Edit Profile'. A drawer opens where you can update contact details, bank account, logo, and description." },
      { q: "How do I change my bank account?", a: "Open Edit Profile from the Profile page and scroll to the Bank Account section. Update the details and click 'Verify Bank Account'." },
      { q: "How do I reset my password?", a: "Use the 'Forgot Password' link on the sign-in page to reset your password via email." },
    ],
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#0D1B2A] flex items-center justify-center mx-auto mb-4">
            <Headphones size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">Help Center</h1>
          <p className="text-gray-500">Find answers to common questions about the vendor portal.</p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((section, si) => (
            <div key={section.category}>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{section.category}</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                {section.items.map((faq, fi) => {
                  const idx = si * 100 + fi;
                  return (
                    <div key={fi}>
                      <button
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-[#0D1B2A]">{faq.q}</span>
                        <ChevronDown
                          size={18}
                          className={`text-gray-400 transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openIndex === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <Mail size={24} className="mx-auto mb-3 text-gray-400" />
          <h2 className="text-lg font-bold text-[#0D1B2A] mb-2">Still need help?</h2>
          <p className="text-sm text-gray-500 mb-4">Contact our support team and we&apos;ll get back to you within 24 hours.</p>
          <Link
            href="mailto:support@sitesupervise.tech"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            <Mail size={16} /> Email Support
          </Link>
        </div>
      </div>
    </div>
  );
}
