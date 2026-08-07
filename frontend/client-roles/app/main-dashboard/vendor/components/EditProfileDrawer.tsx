"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Mail, Phone, MapPin, Globe, FileText, Landmark, Save, Loader2, Upload, Camera, CheckCircle } from "lucide-react";
import type { Vendor, KycFieldStatus } from "@/lib/types/vendor";
import { MOCK_BANKS } from "@/lib/mockData/kyc";
import toast from "react-hot-toast";

interface EditProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Vendor;
  onSave: (data: Partial<Vendor>) => Promise<void>;
}

const EditProfileDrawer: React.FC<EditProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [saving, setSaving] = useState(false);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bankVerifyStatus, setBankVerifyStatus] = useState<KycFieldStatus>("unverified");

  const [form, setForm] = useState({
    companyName: profile.companyName,
    businessType: profile.businessType,
    registrationNumber: profile.registrationNumber,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    address: profile.address,
    website: profile.website || "",
    description: profile.description || "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVerifyBank = () => {
    if (!form.bankName || !form.accountNumber || !form.accountName) {
      toast.error("Fill in all bank fields first");
      return;
    }
    setBankVerifyStatus("verifying");
    setTimeout(() => {
      setBankVerifyStatus("verified");
      toast.success("Bank account verified");
    }, 1200);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
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
              <h2 className="text-xl font-bold text-[#0D1B2A]">Edit Profile</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={28} className="text-gray-400" />
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                  <Upload size={16} />
                  Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>

              {/* Company Information */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={14} /> Company Information
                </h3>
                <Field label="Company Name" value={form.companyName} onChange={(v) => update("companyName", v)} />
                <Field label="Business Type" value={form.businessType} onChange={(v) => update("businessType", v)} />
                <Field label="Registration Number" value={form.registrationNumber} onChange={() => {}} disabled />
              </div>

              {/* Contact Details */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Contact Details
                </h3>
                <Field label="Email" value={form.contactEmail} onChange={(v) => update("contactEmail", v)} type="email" />
                <Field label="Phone" value={form.contactPhone} onChange={(v) => update("contactPhone", v)} type="tel" />
                <Field label="Address" value={form.address} onChange={(v) => update("address", v)} />
                <Field label="Website" value={form.website} onChange={(v) => update("website", v)} type="url" />
              </div>

              {/* Bank Details */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Landmark size={14} /> Bank Account
                </h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bank</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]"
                    >
                      <span className={form.bankName ? "text-gray-900" : "text-gray-400"}>{form.bankName || "Select bank"}</span>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${bankDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {bankDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto"
                        >
                          {MOCK_BANKS.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => { update("bankName", b); setBankDropdownOpen(false); setBankVerifyStatus("unverified"); }}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                            >
                              {b}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <Field label="Account Number" value={form.accountNumber} onChange={(v) => { update("accountNumber", v); setBankVerifyStatus("unverified"); }} maxLength={10} />
                <Field label="Account Name" value={form.accountName} onChange={(v) => { update("accountName", v); setBankVerifyStatus("unverified"); }} />
                {bankVerifyStatus === "verified" ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#DCFCE7] text-[#16A34A] rounded-lg text-sm font-bold">
                    <CheckCircle size={16} /> Bank account verified
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyBank}
                    disabled={bankVerifyStatus === "verifying"}
                    className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {bankVerifyStatus === "verifying" ? "Verifying..." : "Verify Bank Account"}
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-2 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> Company Description
                </h3>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] resize-none"
                  placeholder="Describe your company..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-2.5 bg-[#0D1B2A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] ${
          disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white border-gray-200"
        }`}
      />
    </div>
  );
}

export default EditProfileDrawer;
