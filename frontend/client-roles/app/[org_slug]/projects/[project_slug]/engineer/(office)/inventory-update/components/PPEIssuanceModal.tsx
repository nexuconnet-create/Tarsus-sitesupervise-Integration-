"use client";

import { useState } from "react";
import { X, Shield, Calendar, User } from "lucide-react";
import type { PPE } from "@/lib/types/inventory";

interface PPEIssuanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssue: (ppeId: string, workerId: string, workerName: string, expectedReturnDate?: string) => void;
  ppeItems: PPE[];
}

export default function PPEIssuanceModal({ isOpen, onClose, onIssue, ppeItems }: PPEIssuanceModalProps) {
  const [selectedPPE, setSelectedPPE] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onIssue(selectedPPE, workerId, workerName, expectedReturnDate || undefined);
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPPE("");
    setWorkerId("");
    setWorkerName("");
    setExpectedReturnDate("");
    onClose();
  };

  const availablePPE = ppeItems.filter(item => item.currentStock > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Issue PPE to Worker</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select PPE Item *
              </label>
              <select
                required
                value={selectedPPE}
                onChange={(e) => setSelectedPPE(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose PPE item...</option>
                {availablePPE.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - Stock: {item.currentStock} {item.unit}
                    {item.safetyStandard && ` (${item.safetyStandard})`}
                  </option>
                ))}
              </select>
              {selectedPPE && (
                <p className="mt-1.5 text-sm text-gray-600">
                  Code: {ppeItems.find(p => p.id === selectedPPE)?.ppeCode}
                  {ppeItems.find(p => p.id === selectedPPE)?.expiryDate && (
                    <span className="ml-2 text-orange-600">
                      ⚠️ Expires: {new Date(ppeItems.find(p => p.id === selectedPPE)!.expiryDate!).toLocaleDateString()}
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Worker ID *
                </label>
                <input
                  type="text"
                  required
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ST-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Worker Name *
                </label>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., John Martinez"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Expected Return Date
              </label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1.5 text-sm text-gray-500">
                Leave empty if not returning (consumable PPE)
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedPPE || !workerId || !workerName}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                {isSubmitting ? "Issuing..." : "Issue PPE"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
