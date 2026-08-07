"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Landmark,
  UserCheck,
  Tags,
  Pencil,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
// import { vendorService } from "@/lib/services";
import { MOCK_VENDOR } from "@/lib/mockData/vendor";
import { MOCK_KYC_VERIFIED } from "@/lib/mockData/kyc";
import VendorDashboardSection from "../components/VendorDashboardSection";
import VendorRatingDisplay from "@/components/vendor-pipeline/primitives/VendorRatingDisplay";
import EditProfileDrawer from "../components/EditProfileDrawer";
import type { Vendor } from "@/lib/types/vendor";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Vendor>(MOCK_VENDOR);
  const [kyc] = useState(MOCK_KYC_VERIFIED);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSave = async (data: Partial<Vendor>) => {
    setProfile((prev) => ({ ...prev, ...data }));
    toast.success("Profile updated successfully");
    /* â”€â”€ API version (uncomment when backend is ready) â”€â”€
    try {
      await vendorService.updateProfile({
        company_name: data.companyName,
        business_type: data.businessType,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        address: data.address,
        website: data.website,
        description: data.description,
      });
      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || "Failed to update profile");
      throw err;
    }
    â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  };

  const verificationBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      verified: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: <CheckCircle size={18} />,
        label: "Verified",
      },
      pending: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        icon: <Clock size={18} />,
        label: "Pending Review",
      },
      rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        icon: <XCircle size={18} />,
        label: "Rejected",
      },
    };
    const c = config[status] || config.pending;
    return (
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${c.bg} ${c.text}`}>
        {c.icon}
        <span className="text-sm font-bold">{c.label}</span>
      </div>
    );
  };

  return (
    <div className="pb-24">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white py-7 px-4">
        <div className="text-3xl font-bold text-[#0D1B2A]">Company Profile</div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-[#0D1B2A] text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
        >
          <Pencil size={16} />
          Edit Profile
        </button>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Verification Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                Verification Status
              </h3>
              {verificationBadge(profile.verificationStatus)}
            </div>
            {profile.verificationStatus === "pending" && (
              <p className="text-sm text-gray-500 max-w-sm">
                Your account is under review. You will be notified once verified.
              </p>
            )}
            {profile.verificationStatus === "rejected" && (
              <p className="text-sm text-red-600 max-w-sm">
                Your registration was rejected. Please update your information and contact support.
              </p>
            )}
          </div>
        </motion.div>

        {/* Rating & Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                Performance Rating
              </h3>
              <VendorRatingDisplay
                rating={profile.rating ?? 0}
                ratingCount={profile.ratingCount}
                showBadge
                size="md"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0D1B2A]">{profile.completedOrders ?? 0}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Orders Completed</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0D1B2A]">{profile.ratingCount ?? 0}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Reviews</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KYC Verification Details */}
        {kyc.overallStatus === "approved" && (
          <>
            <VendorDashboardSection
              title="Bank Account Details"
              icon={<Landmark size={20} />}
            >
              <div className="space-y-5">
                <FieldRow
                  label="Bank Name"
                  icon={<Landmark size={16} />}
                  value={kyc.bankDetails.bankName}
                />
                <FieldRow
                  label="Account Name"
                  icon={<FileText size={16} />}
                  value={kyc.bankDetails.accountName}
                />
                <FieldRow
                  label="Account Number"
                  icon={<FileText size={16} />}
                  value={kyc.bankDetails.accountNumber}
                />
              </div>
            </VendorDashboardSection>

            <VendorDashboardSection
              title="Director Information"
              icon={<UserCheck size={20} />}
            >
              <div className="space-y-5">
                <FieldRow
                  label="Director Name"
                  icon={<UserCheck size={16} />}
                  value={kyc.director.name}
                />
                <FieldRow
                  label="ID Type"
                  icon={<FileText size={16} />}
                  value={kyc.director.idType.replace("_", " ")}
                />
                <FieldRow
                  label="ID Number"
                  icon={<FileText size={16} />}
                  value={kyc.director.idNumber}
                />
              </div>
            </VendorDashboardSection>

            <VendorDashboardSection
              title="Business Categories"
              icon={<Tags size={20} />}
            >
              <div className="flex flex-wrap gap-2 pt-3">
                {kyc.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 bg-[#0D1B2A] text-white rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </VendorDashboardSection>
          </>
        )}

        {/* Company Information */}
        <VendorDashboardSection
          title="Company Information"
          icon={<Building2 size={20} />}
        >
          <div className="space-y-5">
            <FieldRow
              label="Company Name"
              icon={<Building2 size={16} />}
              value={profile.companyName}
            />
            <FieldRow
              label="Business Type"
              icon={<FileText size={16} />}
              value={profile.businessType}
            />
            <FieldRow
              label="Registration Number"
              icon={<FileText size={16} />}
              value={profile.registrationNumber}
            />
          </div>
        </VendorDashboardSection>

        {/* Contact Details */}
        <VendorDashboardSection
          title="Contact Details"
          icon={<Mail size={20} />}
        >
          <div className="space-y-5">
            <FieldRow
              label="Email"
              icon={<Mail size={16} />}
              value={profile.contactEmail}
            />
            <FieldRow
              label="Phone"
              icon={<Phone size={16} />}
              value={profile.contactPhone}
            />
            <FieldRow
              label="Address"
              icon={<MapPin size={16} />}
              value={profile.address}
            />
            <FieldRow
              label="Website"
              icon={<Globe size={16} />}
              value={profile.website || ""}
            />
          </div>
        </VendorDashboardSection>

        {/* Description */}
        <VendorDashboardSection
          title="Company Description"
          icon={<FileText size={20} />}
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            {profile.description || "No description provided."}
          </p>
        </VendorDashboardSection>
      </div>

      {/* Edit Profile Drawer */}
      <EditProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={profile}
        onSave={handleSave}
      />
    </div>
  );
}

interface FieldRowProps {
  label: string;
  icon: React.ReactNode;
  value: string;
}

const FieldRow: React.FC<FieldRowProps> = ({
  label,
  icon,
  value,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 sm:w-48 shrink-0">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-[#0D1B2A] font-medium">
          {value || "—"}
        </p>
      </div>
    </div>
  );
};
