"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Phone,
  Smartphone,
  Glasses,
  MoreHorizontal,
  Download,
  Play,
  Upload,
  ChevronRight,
  MapPin,
  AlertTriangle,
  Shield,
  HardHat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { onboardingService } from "@/lib/services";
import { getErrorMessage } from "@/lib/error";

interface SafetyFlowProps {
  onComplete: () => void;
  onClose: () => void;
  projectSlug?: string | null;
  projectId?: number | null;
  roleId?: string | null;
}

export default function SafetyFlow({ onComplete, onClose, projectSlug, projectId, roleId }: SafetyFlowProps) {
  const resolvedProjectSlug = projectSlug ?? (projectId != null ? String(projectId) : null);
  const [step, setStep] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [sendReminder, setSendReminder] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedHazards, setSelectedHazards] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);  const [safetyBriefingConfirmed, setSafetyBriefingConfirmed] = useState(false);
  const [emergencyProceduresConfirmed, setEmergencyProceduresConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Check if emergency procedure video has been seen before
  const hasSeenEmergencyProcedure = typeof window !== "undefined" && localStorage.getItem("emergency_procedure_seen") === "true";
  const handleContinue = async () => {
    // For steps 1, 2, 3, confirmation is mandatory
    if (step <= 3 && !isConfirmed) return;
    // For step 4, we require at least one device selected (or just allow if that's the design)
    if (step === 4 && selectedDevices.length === 0) return;

    if (step === 1) {
      setSafetyBriefingConfirmed(true);
      setStep(4); // "when the continue button is clicked it goes to the forth page"
    } else if (step === 2) {
      setEmergencyProceduresConfirmed(true);
      // Mark emergency procedure as seen so it's never shown again
      localStorage.setItem("emergency_procedure_seen", "true");
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else if (step === 5) {
      // Submit onboarding data to API
      await submitOnboarding();
    }
    setIsConfirmed(false);
  };

  const submitOnboarding = async () => {
    // TODO: Uncomment when backend is ready for project-onboarding API
    // if (!resolvedProjectSlug || !roleId) {
    //   onComplete();
    //   return;
    // }

    // try {
    //   await onboardingService.create(onboardingData);
    //   onComplete();
    // } catch (err) {
    //   console.error("Onboarding submission failed:", err);
    //   setSubmitError(getErrorMessage(err));
    // } finally {
    //   setSubmitting(false);
    // }

    // For now, just complete without API call
    onComplete();
  };

  const handleRedProcedure = () => {
    if (!isConfirmed) return;
    setSafetyBriefingConfirmed(true);
    
    // Skip emergency procedure video if already seen before
    if (hasSeenEmergencyProcedure) {
      setEmergencyProceduresConfirmed(true);
      setStep(3);
    } else {
      setStep(2);
    }
    setIsConfirmed(false);
  };

  const toggleHazard = (id: string) => {
    setSelectedHazards((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );
  };

  const toggleDevice = (id: string) => {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
              <Image
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop"
                alt="Safety Briefing"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="p-6 bg-black rounded-full text-white">
                  <Play size={40} fill="white" />
                </div>
              </div>
            </div>
            <div className="mt-8 w-full flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isConfirmed ? "bg-[#0070D4] border-[#0070D4]" : "border-gray-300 group-hover:border-[#0070D4]"}`}
                >
                  {isConfirmed && (
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                <span className="text-sm font-semibold text-[#021422]">
                  I confirm I have watched and understood the safety briefing.
                </span>
              </label>
              <button
                onClick={handleContinue}
                disabled={!isConfirmed}
                className={`
                                    px-12 py-4 bg-[#0070D4] text-white rounded-lg font-bold text-sm shadow-lg transition-all
                                    ${!isConfirmed ? "opacity-50 cursor-not-allowed" : "hover:bg-[#005bb5] hover:shadow-xl active:scale-95"}
                                `}
              >
                Continue
              </button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Emergency Contact", icon: Phone },
                { title: "Evacuation Assembly Point", icon: MapPin },
                { title: "Incident Reporting Process", icon: AlertTriangle },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#021422] rounded-2xl p-8 flex flex-col items-center justify-center aspect-square shadow-xl group hover:scale-[1.02] transition-transform"
                >
                  <item.icon size={48} className="text-white mb-6" />
                  <h4 className="text-white font-bold text-center text-lg">
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-start px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isConfirmed ? "bg-[#0070D4] border-[#0070D4]" : "border-gray-300 group-hover:border-[#0070D4]"}`}
                >
                  {isConfirmed && (
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                <span className="text-sm font-semibold text-[#021422]">
                  I understand the emergency procedures.
                </span>
              </label>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <h4 className="text-xl font-bold text-[#021422] mb-4">
              Assigned Site
            </h4>
            <p className="text-sm text-gray-500 mb-8">
              Select all that may apply:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "High risk zones",
                "Required PPE",
                "Restricted areas",
                "Ongoing hazardous activities",
              ].map((hazard) => (
                <div
                  key={hazard}
                  onClick={() => toggleHazard(hazard)}
                  className={`
                                        relative border-2 rounded-2xl p-8 h-48 flex items-center justify-center cursor-pointer transition-all
                                        ${selectedHazards.includes(hazard) ? "border-[#0070D4] bg-[#0070D4]/5" : "border-gray-100 bg-white hover:border-[#0070D4]/30"}
                                    `}
                >
                  <div
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedHazards.includes(hazard) ? "bg-[#0070D4] border-[#0070D4]" : "border-gray-200"}`}
                  >
                    {selectedHazards.includes(hazard) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-bold text-[#021422] text-center">
                    {hazard}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-start px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isConfirmed ? "bg-[#0070D4] border-[#0070D4]" : "border-gray-300 group-hover:border-[#0070D4]"}`}
                >
                  {isConfirmed && (
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                <span className="text-sm font-semibold text-[#021422]">
                  I understand the emergency procedures.
                </span>
              </label>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <h4 className="text-xl font-bold text-[#021422] mb-8">
              What devices will you use?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Phone", icon: Smartphone },
                { name: "Tablet", icon: Smartphone }, // Could be Tablet icon if available
                { name: "AR Glasses", icon: Glasses },
                { name: "Others", icon: MoreHorizontal },
              ].map((device) => (
                <div
                  key={device.name}
                  onClick={() => toggleDevice(device.name)}
                  className={`
                                        relative border-2 rounded-2xl p-8 h-48 flex flex-col items-center justify-center cursor-pointer transition-all
                                        ${selectedDevices.includes(device.name) ? "border-[#0070D4] bg-[#0070D4]/5" : "border-gray-100 bg-white hover:border-[#0070D4]/30"}
                                    `}
                >
                  <div
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedDevices.includes(device.name) ? "bg-[#0070D4] border-[#0070D4]" : "border-gray-200"}`}
                  >
                    {selectedDevices.includes(device.name) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <device.icon size={48} className="text-[#021422] mb-4" />
                  <span className="font-bold text-[#021422]">
                    {device.name}
                  </span>
                </div>
              ))}
            </div>
            {/* No checkbox on step 4 based on image, but logic says "until the end". 
                            However, Step 4 & 5 images don't show the checkbox.
                            I'll allow "Continue" if it's the pattern, or skip isConfirmed check for these visually.
                            User said: "Again if the check button isn't clicked button don't proceed then continue button proceeds and the pattern repeats till the end"
                            So I'll add a confirmation for Step 4 too if needed, but visually it's not there.
                            Wait, Step 5 has a checkbox too in the prompt image? No, Step 5 has "Send renewal reminder".
                            Let's follow the visual for checkbox but the "Continue" logic for confirmation where required.
                        */}
            <div className="mt-12 h-6"></div>{" "}
            {/* Spacer to keep layout consistent */}
            <div className="hidden">
              <input type="checkbox" checked={true} onChange={() => {}} />
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col items-center"
          >
            <h4 className="text-xl font-bold text-[#021422] mb-8 text-center uppercase tracking-wider">
              Manual Upload
            </h4>
            <div className="w-full flex flex-col items-center">
              <input
                type="file"
                id="cert-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="cert-upload"
                className="w-full max-w-2xl aspect-[4/3] bg-[#021422] rounded-3xl flex flex-col items-center justify-center text-white cursor-pointer group shadow-2xl hover:scale-[1.01] transition-transform"
              >
                <div className="relative p-8 mb-4">
                  <Upload size={80} strokeWidth={1.5} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={80} strokeWidth={3} />
                  </div>
                </div>
                <span className="text-xl font-medium tracking-tight">
                  {uploadedFile ? uploadedFile.name : "Upload Certificate"}
                </span>
                {uploadedFile && (
                  <span className="mt-2 text-sm text-gray-400">
                    Click to change file
                  </span>
                )}
              </label>
            </div>
            <div className="mt-12 w-full flex flex-col items-start px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setSendReminder(!sendReminder)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${sendReminder ? "bg-[#0070D4] border-[#0070D4]" : "border-gray-300 group-hover:border-[#0070D4]"}`}
                >
                  {sendReminder && (
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={sendReminder}
                  onChange={(e) => setSendReminder(e.target.checked)}
                />
                <span className="text-sm font-semibold text-[#021422]">
                  Send renewal reminder before expiry
                </span>
              </label>
              {submitError && (
                <p className="mt-4 text-red-500 text-sm">{submitError}</p>
              )}
            </div>
          </motion.div>
        );
    }
  };

  const getHeaderTitle = () => {
    switch (step) {
      case 1:
        return "Safety Video /Acknowledgement";
      case 2:
        return "Emergency Procedure Quick Guide";
      case 3:
        return "Site Specific Hazard Briefing";
      case 4:
        return "Devices Used on Site";
      case 5:
        return "Tool Certification Tracking Integration";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F4F6F8] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-6 flex justify-between items-center shrink-0">
        <div className="flex items-center h-12">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1763210692/logo_myiwr5.png"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <div className="w-[1px] h-full bg-gray-200 mx-8"></div>
          <h2 className="text-2xl font-bold text-[#021422] tracking-tight">
            {getHeaderTitle()}
          </h2>
        </div>
        {step === 1 && (
          <button
            onClick={handleRedProcedure}
            disabled={!isConfirmed}
            className={`
                            px-8 py-4 bg-red-600 text-white rounded-lg text-sm font-bold tracking-tight shadow-md transition-all
                            ${!isConfirmed ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700 hover:shadow-lg active:scale-95"}
                        `}
          >
            Emergency Procedure
          </button>
        )}
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16 flex flex-col items-center">
        <div className="w-full max-w-6xl flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </div>

          {/* Footer Actions */}
          {step !== 1 && (
            <div className="mt-16 flex justify-between items-center pt-8 border-t border-gray-100 shrink-0">
              <div className="flex gap-4">
                {step === 2 && (
                  <button className="flex items-center gap-2 px-8 py-4 bg-[#021422] text-white rounded-lg font-bold text-sm shadow-md hover:bg-black transition-all">
                    <Download size={18} />
                    Download PDF
                  </button>
                )}
                {step === 5 && (
                  <button
                    onClick={onComplete}
                    className="px-10 py-4 bg-[#021422] text-white rounded-lg font-bold text-sm shadow-md hover:bg-black transition-all"
                  >
                    Skip
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleContinue}
                  disabled={
                    submitting ||
                    (step <= 3 && !isConfirmed) ||
                    (step === 4 && selectedDevices.length === 0)
                  }
                  className={`
                                      flex items-center gap-3 px-12 py-4 bg-[#0070D4] text-white rounded-lg font-bold text-sm shadow-lg transition-all
                                      ${submitting || (step <= 3 && !isConfirmed) || (step === 4 && selectedDevices.length === 0) ? "opacity-50 cursor-not-allowed" : "hover:bg-[#005bb5] hover:shadow-xl active:scale-95"}
                                  `}
                >
                  {submitting ? "Submitting..." : step === 5 ? "Proceed to Dashboard" : "Continue"}
                  {!submitting && <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
