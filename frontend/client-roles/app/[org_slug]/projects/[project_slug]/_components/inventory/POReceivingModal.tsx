"use client";

import { useState } from "react";
import { X, Package, CheckCircle } from "lucide-react";
import type { PurchaseOrder } from "@/lib/types/vendor";

interface POReceivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceive: (poId: string, receivedItems: { itemId: string; quantity: number }[], notes: string) => void;
  po: PurchaseOrder | null;
}

export default function POReceivingModal({ isOpen, onClose, onReceive, po }: POReceivingModalProps) {
  const [receivedItems, setReceivedItems] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen || !po) return null;
  
  const handleQuantityChange = (itemId: string, value: string) => {
    const qty = parseInt(value, 10) || 0;
    setReceivedItems({ ...receivedItems, [itemId]: qty });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const itemsToReceive = po.items
      .filter((item) => receivedItems[item.stockId] > 0)
      .map((item) => ({
        itemId: item.stockId,
        quantity: receivedItems[item.stockId],
      }));
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onReceive(po.id, itemsToReceive, notes);
    
    setIsSubmitting(false);
    setReceivedItems({});
    setNotes("");
    onClose();
  };
  
  const totalExpected = po.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceived = Object.values(receivedItems).reduce((sum, qty) => sum + qty, 0);
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Receive Purchase Order</h2>
                <p className="text-sm text-gray-500">{po.poNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
            {/* PO Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Vendor</p>
                  <p className="font-medium text-gray-900">{po.vendorName || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Delivery Address</p>
                  <p className="font-medium text-gray-900">{po.deliveryAddress || "—"}</p>
                </div>
                {po.driverName && (
                  <>
                    <div>
                      <p className="text-gray-500">Driver</p>
                      <p className="font-medium text-gray-900">{po.driverName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vehicle</p>
                      <p className="font-medium text-gray-900">{po.vehiclePlate}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Items */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Items to Receive</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Item
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Expected
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Received
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.items.map((item) => {
                      const received = receivedItems[item.stockId] || 0;
                      const isComplete = received >= item.quantity;
                      const isOver = received > item.quantity;
                      
                      return (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.unit}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              max={item.quantity + 10}
                              value={receivedItems[item.stockId] || ""}
                              onChange={(e) => handleQuantityChange(item.stockId, e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-right ${
                                isOver
                                  ? "border-red-300 bg-red-50"
                                  : isComplete
                                  ? "border-green-300 bg-green-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="0"
                            />
                          </td>
                          <td className="py-3 px-4">
                            {received === 0 ? (
                              <span className="text-gray-400 text-xs">Not received</span>
                            ) : isComplete ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                Complete
                              </span>
                            ) : isOver ? (
                              <span className="text-xs font-medium text-orange-600">
                                +{received - item.quantity} extra
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-yellow-600">
                                {received} of {item.quantity}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Summary */}
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-emerald-700">Total Expected</p>
                  <p className="text-2xl font-bold text-emerald-800">{totalExpected}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-700">Total Received</p>
                  <p className={`text-2xl font-bold ${totalReceived >= totalExpected ? "text-green-600" : "text-orange-600"}`}>
                    {totalReceived}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Any notes about the delivery..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalReceived === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Receiving..." : "Confirm Receipt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}