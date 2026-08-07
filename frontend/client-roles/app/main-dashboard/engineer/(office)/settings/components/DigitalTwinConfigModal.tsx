import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface DigitalTwinConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DigitalTwinConfigModal({ isOpen, onClose }: DigitalTwinConfigModalProps) {
  const [modelSource, setModelSource] = useState("Autodesk BIM 360");
  const [permissions, setPermissions] = useState(["Project Engineer", "QA/QC inspector"]);

  const togglePermission = (role: string) => {
    setPermissions(prev => 
      prev.includes(role) 
        ? prev.filter(p => p !== role)
        : [...prev, role]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative z-10 flex flex-col p-6 md:p-8 max-h-[90vh] overflow-y-auto"
      >
          <div className="flex justify-between items-center mb-8 shrink-0">
               <h2 className="text-xl font-bold text-[#021422] border-b-2 border-[#021422] pb-1">Digital Twin & AR Config</h2>
               <button onClick={onClose} className="text-sm font-bold underline">Go Back</button>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 md:p-8 space-y-8">
              <p className="font-medium text-[#021422]">This configures the 3D data used for AR verification and guidance on site</p>

              {/* Source */}
              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#021422]">Primary 3D Model Source:</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                       {["Autodesk BIM 360", "Trimble Connect", "Custom Server"].map((source) => (
                           <label key={source} className="flex items-center gap-3 cursor-pointer group">
                               <div className="relative">
                                    <input 
                                        type="radio" 
                                        name="modelSource"
                                        className="sr-only"
                                        checked={modelSource === source}
                                        onChange={() => setModelSource(source)}
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                        modelSource === source 
                                            ? "bg-[#021422] border-[#021422]" 
                                            : "border-[#021422] group-hover:bg-gray-100"
                                    }`}>
                                        {modelSource === source && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                               </div>
                               <span className="font-medium text-[#021422]">{source}</span>
                           </label>
                       ))}
                  </div>
              </div>

               {/* Permissions */}
              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#021422]">AR Feature Permissions:</h3>
                  <p className="text-xs text-gray-500">Users with the following roles can initiate AR verifications:</p>
                  <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-8">
                       {["Project Engineer", "QA/QC inspector", "Site Supervisor", "Foreman"].map((role) => {
                           const isChecked = permissions.includes(role);
                           return (
                               <label key={role} className="flex items-center gap-3 cursor-pointer group">
                                   <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only"
                                            checked={isChecked}
                                            onChange={() => togglePermission(role)}
                                        />
                                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border-2 ${
                                            isChecked
                                                ? "bg-[#22c55e] border-[#22c55e]" 
                                                : "border-[#021422] group-hover:bg-gray-100"
                                        }`}>
                                            {isChecked && <Check size={14} className="text-white" />}
                                        </div>
                                   </div>
                                   <span className="font-medium text-[#021422]">{role}</span>
                               </label>
                           );
                       })}
                  </div>
              </div>

               {/* Site Registration */}
              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#021422]">Site Registration for Markerless AR</h3>
                  <p className="text-xs text-gray-500">To improve AR across large site, define known location points</p>
                  
                  <button className="px-4 py-2 bg-[#021422] text-white text-xs font-bold rounded-lg w-fit">
                      Add New Point
                  </button>

                  <div className="space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                          <span className="font-bold">Point 1:</span>
                          <span className="font-medium break-all">&apos;Main Site Office&apos; | GPS: [12.3456, -98.7654 | Status: Calibrated</span>
                          <div className="w-3 h-3 bg-[#22c55e] rounded-sm shrink-0"></div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                          <span className="font-bold">Point 2:</span>
                          <span className="font-medium break-all">&apos;North Foundation Grid A1&apos; | GPS: [12.3456, -98.7654 | Status: Calibrated</span>
                          <div className="w-3 h-3 bg-[#22c55e] rounded-sm shrink-0"></div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="mt-8 shrink-0">
              <button className="px-8 py-3 bg-[#021422] text-white rounded-lg font-bold hover:bg-gray-900 transition-colors w-full md:w-auto">
                  Save Changes
              </button>
          </div>
      </motion.div>
    </div>  );
}
