/* ------------------------------- Hero Section ------------------------------ */
"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="home" className="relative bg-white overflow-hidden">
      {/* <Navbar/> */}
      <div
        className="relative min-h-screen lg:h-[90vh] flex items-center bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage:
            "url(https://res.cloudinary.com/depeqzb6z/image/upload/v1763210703/bg-hero_mvvqi1.png)",
        }}
      >
        {/* Angled dark overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 -skew-x-12 origin-top-left">
            <div className="bg-gradient-to-r from-[#001b33]/55 to-transparent w-full h-full" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full  ml-10 px-6 md:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 items-center gap-10">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <p className="text-[12px] top-30 sm:text-xl text-white font-bold">
                Manage, Monitor and
              </p>
              <h1 className="text-4xl sm:text-2xl md:text-2xl lg:text-4xl font-extrabold leading-tight text-white drop-shadow-sm">
                Optimize{" "}
                <span className="text-[#001220] text-4xl">Every Construction</span>{" "}
                <br />
                <span className="text-[#021422] text-3xl">
                  Project From One Dashboard with Artificial Intelligence support
                </span>
              </h1>

              <p className="mt-6 text-slate-200 text-base md:text-lg max-w-xl leading-relaxed mx-auto lg:mx-0">
                A complete web solution for project control, staff management, material tracking, and performance analytics designed with AI to simplify construction operations.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  className={` hover:bg-[#021422] w-70 h-20 text-sm text-white px-2 sm:px-20 py-4 sm:py-5 rounded-md  bg-[#0F181F]  sm:text-lg`}
                >
                  <p className="text-[12px]"> Get Started</p>
                </button>
                <button
                  className={`hover:bg-[#0F181F]   w-70 h-20 border border-[#0F181F] text-white px-8 sm:px-20 py-4 sm:py-5 rounded-md sm:text-lg`}
                >
                  <p className="text-[12px]">Request a Demo</p>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
