import Link from "next/link";
import BackButton from "./not-found-back";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#021422] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <img
            src="/images/white_logo.svg"
            alt="Site Supervise"
            className="w-24 opacity-80"
          />
          <p className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase mt-2">
            Site Supervise
          </p>
        </div>

        {/* 404 number */}
        <p className="text-[80px] font-extrabold leading-none text-white/10 select-none">
          404
        </p>

        {/* Message */}
        <div className="-mt-4 mb-10">
          <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            Check the URL or use the buttons below to get back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <BackButton />
          <Link
            href="/select-org"
            className="w-full sm:w-auto px-6 py-3 bg-white text-[#021422] rounded-xl font-semibold text-sm hover:bg-gray-100 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
