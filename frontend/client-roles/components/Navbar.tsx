/* --------------------------------- Navbar --------------------------------- */
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-[#021422] text-white shadow-md w-7xl absolute z-20 -mt-10 hidden lg:block">
      <div className="max-w-7xl mx-auto h-22 flex items-center justify-between ">
        {/* Desktop Navigation */}
        <nav className="flex items-center gap-20 px-6 mx-auto">
          <a
            href="#home"
            className="text-sm hover:text-sky-400 transition-colors"
          >
            Home
          </a>
          <a
            href="landing/features"
            className="text-sm hover:text-sky-400 transition-colors"
          >
            Features
          </a>
          <a
            href="landing/solutions"
            className="text-sm hover:text-sky-400 transition-colors"
          >
            Solutions
          </a>
          <a
            href="landing/pricing"
            className="text-sm hover:text-sky-400 transition-colors"
          >
            Pricing
          </a>
          <a
            href="landing/contact"
            className="text-sm hover:text-sky-400 transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Desktop CTA - Full height */}
        <div className="flex h-full">
          <Link
            href="/signin"
            className="bg-white text-slate-900 px-10 h-full text-sm font-semibold  hover:bg-slate-200 transition-all text-nowrap flex items-center"
          >
            LOGIN
          </Link>
        </div>
      </div>
    </header>
  );
}
