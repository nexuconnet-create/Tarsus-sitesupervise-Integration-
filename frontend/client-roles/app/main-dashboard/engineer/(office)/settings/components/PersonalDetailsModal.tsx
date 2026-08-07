"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import toast from "react-hot-toast";

interface PersonalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalDetailsModal({ isOpen, onClose }: PersonalDetailsModalProps) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const fullnameParts = (user?.fullname || user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(fullnameParts[0] || "");
  const [lastName, setLastName] = useState(fullnameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
  const displayRole = user?.role_name || user?.role?.replace(/_/g, " ") || "Engineer";

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const fullname = `${firstName} ${lastName}`.trim();
    updateUser({ fullname, name: fullname, username, email });
    toast.success("Profile updated");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#021422] uppercase tracking-wider">Personal Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-14 h-14 rounded-full bg-[#021422] flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden hover:opacity-90 transition-opacity"
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              : initials}
          </button>
          <div>
            <p className="text-sm font-semibold text-[#021422]">{firstName} {lastName}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{displayRole}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-blue-600 hover:underline mt-0.5"
            >
              Change photo
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Form */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#021422]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#021422]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#021422]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
            <input
              type="text"
              value={displayRole}
              readOnly
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#021422]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-[#021422] text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
