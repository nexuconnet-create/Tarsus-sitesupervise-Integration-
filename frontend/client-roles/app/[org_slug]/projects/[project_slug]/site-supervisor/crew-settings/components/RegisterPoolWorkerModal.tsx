"use client";

import React, { useState, useRef } from "react";
import { X, Loader2, Camera, Upload, UserPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crewService, CREW_TRADES, POOL_WORKER_STATUSES } from "@/lib/services/crewService";
import type { PoolWorkerDetail } from "@/lib/services/crewService";
import { getErrorMessage } from "@/lib/error";
import { crewKeys } from "@/lib/queryKeys";
import toast from "react-hot-toast";

interface RegisterPoolWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  editingWorker?: PoolWorkerDetail | null;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export default function RegisterPoolWorkerModal({
  isOpen,
  onClose,
  orgId,
  editingWorker,
}: RegisterPoolWorkerModalProps) {
  const qc = useQueryClient();
  const isEdit = !!editingWorker;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(() => editingWorker?.first_name ?? "");
  const [lastName, setLastName] = useState(() => editingWorker?.last_name ?? "");
  const [email, setEmail] = useState(() => editingWorker?.email ?? "");
  const [phone, setPhone] = useState(() => editingWorker?.phone_number ?? "");
  const [trade, setTrade] = useState(() => editingWorker?.trade ?? "");
  const [currentLocation, setCurrentLocation] = useState(() => editingWorker?.current_location ?? "");
  const [status, setStatus] = useState(() => editingWorker?.status ?? "off_site");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    () => editingWorker?.profile_picture_url || null,
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("first_name", firstName.trim());
      fd.append("last_name", lastName.trim());
      fd.append("trade", trade);
      fd.append("status", status);
      if (email.trim()) fd.append("email", email.trim());
      if (phone.trim()) fd.append("phone_number", phone.trim());
      if (currentLocation.trim()) fd.append("current_location", currentLocation.trim());
      if (photoFile) fd.append("profile_picture", photoFile);

      if (isEdit && editingWorker) {
        return crewService.patchPoolWorker(orgId, editingWorker.id, fd);
      }
      return crewService.createPoolWorker(orgId, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: crewKeys.poolWorkers(orgId) });
      toast.success(isEdit ? "Pool worker updated" : "Pool worker registered");
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !trade) return;
    if (phone.trim() && !E164_REGEX.test(phone.trim())) {
      toast.error("Phone number must be in E.164 format, e.g. +2348012345678");
      return;
    }
    mutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#021422]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="font-bold text-lg uppercase tracking-wider text-[#021422]">
            {isEdit ? "Edit Pool Worker" : "Register Pool Worker"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* Profile picture */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Profile Picture (optional)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Camera size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={14} />
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="w-full mt-2 px-4 py-2 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
                <p className="text-[10px] text-gray-400 mt-2">Max 5MB. Accepted: JPG, PNG, WebP</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                First Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Last Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Martinez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Email
            </label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +2348012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="^\+[1-9]\d{6,14}$"
              title="Phone number must be in E.164 format (e.g. +2348012345678)"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            />
            <p className="text-[10px] text-gray-400 pt-0.5">
              Include country code with <span className="font-semibold text-gray-500">+</span> prefix, e.g. +2348012345678
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Trade *
            </label>
            <select
              required
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            >
              <option value="">— Select Trade —</option>
              {CREW_TRADES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              >
                {POOL_WORKER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Current Location
              </label>
              <input
                type="text"
                placeholder="e.g. Site A, Block 2"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-[#021422] text-xs font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !firstName.trim() || !lastName.trim() || !trade}
              className="flex-1 py-3 bg-[#007AFF] text-white text-xs font-bold uppercase rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Register Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
