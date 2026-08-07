"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition border border-white/20"
    >
      <ArrowLeft size={16} />
      Go Back
    </button>
  );
}
