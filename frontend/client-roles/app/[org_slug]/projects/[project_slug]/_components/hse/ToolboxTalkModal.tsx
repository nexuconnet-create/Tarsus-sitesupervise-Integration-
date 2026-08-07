"use client";

import { useState } from "react";
import { X, MessageSquare, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ApiToolboxTalk, CreateToolboxTalkBody } from "@/lib/services/hseService";

interface ToolboxTalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateToolboxTalkBody) => void;
  record?: ApiToolboxTalk | null;
}

export type { CreateToolboxTalkBody as ToolboxTalkFormData };

export default function ToolboxTalkModal({ isOpen, onClose, onSubmit, record }: ToolboxTalkModalProps) {
  const [formData, setFormData] = useState<CreateToolboxTalkBody>({
    topic: "",
    crew: "",
    date_conducted: new Date().toISOString().split("T")[0],
    attendees: "",
    notes: "",
  });
  const [attendeeList, setAttendeeList] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState("");

  if (!isOpen) return null;

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      const next = [...attendeeList, newAttendee.trim()];
      setAttendeeList(next);
      setFormData((prev) => ({ ...prev, attendees: next.join(", ") }));
      setNewAttendee("");
    }
  };

  const handleRemoveAttendee = (index: number) => {
    const next = attendeeList.filter((_, i) => i !== index);
    setAttendeeList(next);
    setFormData((prev) => ({ ...prev, attendees: next.join(", ") }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    setFormData({
      topic: "",
      crew: "",
      date_conducted: new Date().toISOString().split("T")[0],
      attendees: "",
      notes: "",
    });
    setAttendeeList([]);
  };

  // ─── Detail View ──────────────────────────────────────────────────────────
  if (record) {
    const attendees = record.attendees
      ? record.attendees.split(",").map((a) => a.trim()).filter(Boolean)
      : [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <AnimatePresence>
          <motion.div
            key="toolbox-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare size={24} className="text-[#021422]" />
                  <h2 className="text-2xl font-bold text-[#021422]">Toolbox Talk Detail</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Topic</p>
                  <p className="text-lg font-bold text-[#021422]">{record.topic}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date Conducted</p>
                    <p className="text-sm font-medium text-[#021422]">
                      {record.date_conducted ? new Date(record.date_conducted).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Crew</p>
                    <p className="text-sm font-medium text-[#021422]">{record.crew || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Conducted By</p>
                  <p className="text-sm font-medium text-[#021422]">{record.conductor || "—"}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Attendees ({attendees.length})
                  </p>
                  {attendees.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {attendees.map((a, i) => (
                        <span key={i} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No attendees recorded</p>
                  )}
                </div>

                {record.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-[#021422] bg-gray-50 rounded-lg p-3">{record.notes}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Create View ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          key="toolbox-create"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare size={24} className="text-[#021422]" />
                <h2 className="text-2xl font-bold text-[#021422]">Toolbox Talk</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Topic</label>
                <input
                  required
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Fall Protection Awareness"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Date Conducted</label>
                  <input
                    type="date"
                    value={formData.date_conducted}
                    onChange={(e) => setFormData({ ...formData, date_conducted: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#021422]">Crew/Team</label>
                  <input
                    type="text"
                    value={formData.crew}
                    onChange={(e) => setFormData({ ...formData, crew: e.target.value })}
                    placeholder="e.g., Crew A - Structural"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none"
                  />
                </div>
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
                {attendeeList.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attendeeList.map((attendee, index) => (
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
                {attendeeList.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">No attendees added yet</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#021422]">Notes / Summary</label>
                <textarea
                  value={formData.notes ?? ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key discussion points and outcomes"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#021422] outline-none resize-none"
                />
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#002b4d] text-white rounded-lg font-bold hover:bg-[#001f38] transition-colors"
                >
                  Record Toolbox Talk
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
      </AnimatePresence>
    </div>
  );
}
