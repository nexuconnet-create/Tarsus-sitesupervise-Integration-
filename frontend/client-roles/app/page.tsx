"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import MobileMenuButton from "@/components/MobileMenuButton";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Steps from "@/components/Steps";
import FeatureCard from "@/components/FeatureCard";
import Contact from "@/components/Contact";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import { CTA_BUTTON, SOLID } from "@/constants";
// import {logo_group} from "@/components/index.js"

export default function Page() {
  return (
    <main className="font-sans antialiased overflow-hidden relative">
      {/* Top right rectangle - 45 degrees tilted, half inside screen */}
      <div className="absolute lg:-top-90 right-0 lg:-right-30 -top-15 md:-top-50  md:-right-30 w-[20rem] md:left-150 lg:w-220 h-[20rem] md:h-120 lg:h-[60rem] bg-[#001b33] rotate-45 pointer-events-none -z-10"></div>
      <div className="h-8 bg-[#021422] z-10"></div>
      <div className="py-8 md:pb-15 px-3 md:px-24 flex items-center gap-3 relative overflow-hidden">
        <div className="w-20 h-20 flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210692/logo_myiwr5.png"
            alt="Site Supervise Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </div>
        <span className="font-extrabold text-xl mr-10 lg:text-xl text-[#021422] tracking-wide flex flex-col md:flex-row">
          SITE <span>SUPERVISE</span>
        </span>
        {/* Mobile Menu Toggle beside logo */}
        <div className="lg:hidden ml-auto relative ">
          <MobileMenuButton />
        </div>
      </div>
      <div className="m-0  lg:mr-36 ">
        <div className="w-full flex justify-center align-center ">
          <Navbar />
        </div>

        <Hero />
      </div>
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col gap-12 ml-13">
          <div className="flex justify-center md:justify-between w-full">
            <div>
              <img
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1763214914/Group_9_n3o2kh.png"
                alt=""
              />

              <h2 className="text-xl md:text-2xl font-bold mr-10 text-slate-900 leading-tight mb-4">
                Why Choose Our Construction Dashboard?
              </h2>
            </div>

            <div className="hidden md:flex justify-center items-center ">
              <button className={`${CTA_BUTTON} ${SOLID} mr-20 h-12  `}>
                Get Started
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-2">
            <FeatureCard
              image="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210700/control-system_1_dn88cf.svg"
              title="Centralized Control of All Construction Activities"
              desc="Manage multiple projects, workers, and resources from one unified platform. Gain complete visibility into every stage of construction."
            />
            <FeatureCard
              image="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210699/bin_wswhyj.svg"
              title="Reduced Material Wastage and Cost Overruns"
              desc="Track material usage and expenses accurately to prevent shortages, overstocking, and unnecessary spending."
            />
            <FeatureCard
              image="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210693/multiple-users-silhouette_1_zgma62.svg"
              title="Improved Staff Accountability and Efficiency"
              desc="Monitor attendance, task completion, and performance metrics to ensure every team member stays productive and responsible."
            />
            <FeatureCard
              image="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210693/presentation_bl9ltw.svg"
              title="Accurate Project Performance Analytics"
              desc="Access detailed charts and KPIs that show progress, resource usage, and overall performance for smarter management decisions."
            />
            <FeatureCard
              image="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210701/insight_1_wdx9wt.svg"
              title="Faster Decision-Making Through Real-Time Insights"
              desc="Receive instant data updates from your sites, helping you address issues quickly and keep projects on schedule."
            />
            <FeatureCard
              image="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210697/promotion_1_h6qjrq.svg"
              title="Easy Communication Between Site Workers and Management"
              desc="Enhance collaboration with built-in messaging and project update features that keep every team member informed and connected."
            />
          </div>
        </div>
        <div className="mt-6 md:hidden w-full flex items-center  ">
          <button className={`${CTA_BUTTON} ${SOLID} py-4 px-4 mx-auto`}>
            Get Started
          </button>
        </div>
      </section>

      <Steps />

      <Projects />

      <Contact />

      <Footer />
    </main>
  );
}
