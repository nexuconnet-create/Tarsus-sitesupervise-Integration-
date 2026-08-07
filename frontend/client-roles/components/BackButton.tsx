"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  /** Optional explicit destination. Defaults to browser back (router.back()). */
  href?: string;
  className?: string;
}

/**
 * Shared "go back" affordance for page headers. Defaults to navigating to the
 * previous entry in history; pass `href` to force a specific destination.
 */
export default function BackButton({ href, className = "" }: BackButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className={`p-1.5 rounded-lg transition-colors shrink-0 text-[#021422] hover:bg-gray-100 ${className}`}
      title="Go back"
      aria-label="Go back"
    >
      <ChevronLeft size={20} />
    </button>
  );
}
