"use client";

import { useState } from "react";
import { X, Loader2, Bell, UserX } from "lucide-react";

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  absentCount: number;
  selectedDate: string;
  onSend: (message: string) => Promise<void>;
}

export default function NotifyModal({
  isOpen,
  onClose,
  absentCount,
  selectedDate,
  onSend,
}: NotifyModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const dateDisplay = new Date(selectedDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleSend = async () => {
    setLoading(true);
    try {
      await onSend(message);
      onClose();
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Notify Absent Workers</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Send notification for {dateDisplay}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            This will send a notification to all workers marked{" "}
            <span className="font-bold text-red-500">absent</span> on the selected date.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-[#021422]">
              Absent count:{" "}
            </span>
            <span className="ml-2 text-sm font-bold text-red-500">{absentCount}</span>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Please report to site immediately or contact your supervisor."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || absentCount === 0}
            className="px-5 py-2.5 bg-[#007AFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Bell size={14} />
                Send Notification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
