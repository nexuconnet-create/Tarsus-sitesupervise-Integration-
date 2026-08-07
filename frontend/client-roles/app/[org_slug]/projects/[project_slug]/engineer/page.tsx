"use client";

import { use } from "react";
import Link from "next/link";
import { Briefcase, HardHat } from "lucide-react";
import Image from "next/image";

interface EngineerModeSelectProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function EngineerModeSelect({ params }: EngineerModeSelectProps) {
  const { org_slug, project_slug } = use(params);
  const base = `/${org_slug}/projects/${project_slug}/engineer`;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#001220] px-6 py-12">
      
      {/* Logo */}
      <div className="flex flex-col items-center mt-20 mb-5">
        <Image
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1769840438/logo-logo_ozrlfm.png"
          alt="Site Supervise Logo"
          width={200}
          height={200}
          className="object-contain mb-4"
        />
        {/* Sub-content below logo */}

        <p className="text-gray-300  text-center text-[16px] max-w-md">
          Please select your mode to continue: Office Mode for dashboard access or Field Mode for on-site reporting.
        </p>
      </div>

      {/* Mode Selection Grid */}
      <div className="grid grid-cols-1 mt-5 md:grid-cols-2 gap-8 max-w-3xl w-full">
        {/* Field Mode */}
        <Link
          href="/main-dashboard/engineer/field-mode"
          className="group rounded-2xl bg-white p-8 shadow hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4 mb-4">
            <HardHat className="w-8 h-8 text-green-600" />
            <h2 className="text-xl font-semibold">Field Mode</h2>
          </div>
          <p className="text-gray-600">
            Submit reports, inspections, checklists, and on-site updates.
          </p>
        </Link>
        {/* Office Mode */}
        <Link
          href={`${base}/dashboard`}
          className="group rounded-2xl bg-white p-8 shadow hover:shadow-lg transition"
        >
          <div className="flex items-center gap-4 mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-semibold">Office Mode</h2>
          </div>
          <p className="text-gray-600">
            Access planning, reports, documents, performance, and admin tools.
          </p>
        </Link>
      </div>
    </div>
  );
}
