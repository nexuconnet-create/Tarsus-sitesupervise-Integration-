/* --------------------------------- Navbar --------------------------------- */
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        className="p-2 rounded bg-[#001b33] text-white hover:bg-[#002244] transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-menu"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile Slide-in Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            {/* Slide Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50"
            >
              <div className="p-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <nav className="flex flex-col mt-8 space-y-4">
                  <a
                    href="#home"
                    className="text-lg text-gray-700 hover:text-[#001b33] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </a>
                  <a
                    href="landing/features"
                    className="text-lg text-gray-700 hover:text-[#001b33] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="landing/solutions"
                    className="text-lg text-gray-700 hover:text-[#001b33] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Solutions
                  </a>
                  <a
                    href="landing/pricing"
                    className="text-lg text-gray-700 hover:text-[#001b33] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </a>
                  <a
                    href="landing/contact"
                    className="text-lg text-gray-700 hover:text-[#001b33] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </a>
                  <Link
                    href="/signin"
                    className="mt-6 bg-[#001b33] text-white px-6 py-3 rounded text-sm font-semibold hover:bg-[#002244] transition-all text-center"
                  >
                    LOGIN
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
