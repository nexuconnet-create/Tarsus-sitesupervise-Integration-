"use client";

import { useState } from "react";
import { X, GraduationCap, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TrainingFormData) => void;
}

export interface TrainingFormData {
  title: string;
  date: string;
  time: string;
  duration: string;
  purpose: string;
  instructor: string;
  attendees: string[];
  location: string;
  notes: string;
}

export default function TrainingModal({ isOpen, onClose, onSubmit }: TrainingModalProps) {
  const [formData, setFormData] = useState<TrainingFormData>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    duration: "",
    purpose: "",
    instructor: "",
    attendees: [],
    location: "",
    notes: "",
  });
  const [newAttendee, setNewAttendee] = useState("");

  if (!isOpen) return null;

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      setFormData({ ...formData, attendees: [...formData.attendees, newAttendee.trim()] });
      setNewAttendee("");
    }
  };

  const handleRemoveAttendee = (index: number) => {
    setFormData({ ...formData, attendees: formData.attendees.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      duration: "",
      purpose: "",
      instructor: "",
      attendees: [],
      location: "",
      notes: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GraduationCap size={24} className="text-[#021422]" />
              <h2 className="text-2xl font-bold text-[#021422]">Training</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Training Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Fall Protection Awareness Training"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Purpose of Training</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Describe the objectives and importance of this training session"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2 hours"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Instructor name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Conference Room A"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">List of Attendees</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAttendee())}
                  placeholder="Enter attendee name"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAttendee}
                  className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus size={20} className="text-gray-600" />
                </button>
              </div>
              {formData.attendees.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attendees.map((attendee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-800">{attendee}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.attendees.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">No attendees added yet</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#021422]">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or materials required"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
              />
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
              >
                Submit Training
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 bg-white border border-gray-200 text-[#021422] rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
