"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, Scan, CheckCircle, XCircle, AlertTriangle, Image, Loader2 } from "lucide-react";
import type { PurchaseOrder } from "@/lib/types/vendor";

interface QualityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  onAccept?: (poId: string) => void;
  onReject?: (poId: string) => void;
}

const QualityVerificationModal: React.FC<QualityVerificationModalProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
  onAccept,
  onReject,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"photo" | "upload">("photo");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [picturesUploaded, setPicturesUploaded] = useState(false);

  if (!purchaseOrder) return null;

  const handleAccept = async () => {
    if (!onAccept) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onAccept(purchaseOrder.id);
    setLoading(false);
    onClose();
  };

  const handleReject = async () => {
    if (!onReject) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onReject(purchaseOrder.id);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#0D1B2A]">Quality Verification</h2>
                <p className="text-sm text-gray-500 mt-0.5">{purchaseOrder.poNumber}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* PO Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Order Items</p>
                <div className="space-y-2">
                  {purchaseOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity} {item.unit} × {item.name}
                      </span>
                      <span className="font-medium text-[#0D1B2A]">
                        ₦{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-500">Total</span>
                  <span className="text-sm font-bold text-[#0D1B2A]">
                    ₦{purchaseOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tab: Photo or AR */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("photo")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                    activeTab === "photo"
                      ? "bg-[#0D1B2A] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Camera size={16} />
                  Photo Verification
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                    activeTab === "upload"
                      ? "bg-[#0D1B2A] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Scan size={16} />
                  AR Scan
                </button>
              </div>

              {/* Photo Verification Tab */}
              {activeTab === "photo" && (
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-2 transition-colors ${
                    photoUploaded
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}>
                    {photoUploaded ? (
                      <>
                        <Image size={40} className="text-green-600" />
                        <p className="text-sm font-bold text-green-700">Photo Captured</p>
                        <button
                          onClick={() => setPhotoUploaded(false)}
                          className="text-xs text-green-600 underline"
                        >
                          Retake
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera size={40} className="text-gray-400" />
                        <p className="text-sm text-gray-500">Tap to scan delivery photo for AR</p>
                        <button
                          onClick={() => setPhotoUploaded(true)}
                          className="px-4 py-1.5 bg-[#0D1B2A] text-white rounded-lg text-xs font-bold mt-1"
                        >
                          AR Scan
                        </button>
                      </>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Quality Photos</p>
                    {purchaseOrder.qualityPhotos && purchaseOrder.qualityPhotos.length > 0 ? (
                      <div className="space-y-1">
                        {purchaseOrder.qualityPhotos.map((photo, i) => (
                          <p key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-500" />
                            {photo}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No quality photos available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Pictures Tab */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-2 transition-colors ${
                    picturesUploaded
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}>
                    {picturesUploaded ? (
                      <>
                        <Image size={40} className="text-green-600" />
                        <p className="text-sm font-bold text-green-700">Pictures Uploaded</p>
                        <button
                          onClick={() => setPicturesUploaded(false)}
                          className="text-xs text-green-600 underline"
                        >
                          Upload New Pictures
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload size={40} className="text-gray-400" />
                        <p className="text-sm text-gray-500">Upload photos from your device</p>
                        <button
                          onClick={() => setPicturesUploaded(true)}
                          className="px-4 py-1.5 bg-[#0D1B2A] text-white rounded-lg text-xs font-bold mt-1"
                        >
                          Select Pictures
                        </button>
                      </>
                    )}
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-800">Upload Guidelines</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Upload clear photos of all delivered items from multiple angles.
                          Photos should clearly show quantities and condition upon arrival.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {loading ? "Processing..." : "Accept & Complete"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  {loading ? "Processing..." : "Report Issue"}
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QualityVerificationModal;
