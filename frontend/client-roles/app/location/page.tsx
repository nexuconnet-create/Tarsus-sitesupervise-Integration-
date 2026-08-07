"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LocationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 md:px-10 py-4 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Site Supervise" className="w-10 h-10" />
          <span className="text-lg font-extrabold text-[#021422] hidden sm:block tracking-wide">
            SITE SUPERVISE
          </span>
        </div>

        {/* Proceed button */}
        <button
          onClick={() => router.push("/onboarding")}
          className="bg-[#021422] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#0F181F] transition"
        >
          Proceed to dashboard
        </button>
      </div>

      {/* Map area */}
      <div className="flex-1 px-4 md:px-8 pb-4 md:pb-8">
        <div className="h-full min-h-[calc(100vh-80px)] rounded-2xl overflow-hidden shadow-lg">
          <iframe
            title="Construction Site Location"
            width="100%"
            height="100%"
            style={{ border: 0, display: "block", minHeight: "calc(100vh - 100px)" }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3356.3!2d-86.8025!3d33.5186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88891f1bd47d49b1%3A0x7a9ca4e5cd5c614b!2sBirmingham%2C%20AL!5e0!3m2!1sen!2sus!4v1700000000000"
          />
        </div>
      </div>
    </div>
  );
}
