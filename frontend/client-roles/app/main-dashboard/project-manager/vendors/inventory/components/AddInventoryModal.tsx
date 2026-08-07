"use client";

import { useState } from "react";
import { X, Package, Wrench, Paperclip, Shield } from "lucide-react";
import type { Material, Equipment, PPE, MaterialCategory, EquipmentCondition, PPECategory } from "@/lib/types/inventory";
import { INVENTORY_CATEGORIES, EQUIPMENT_CATEGORIES, PPE_CATEGORIES } from "@/lib/types/inventory";
import { getAllInventory } from "@/lib/mockData/inventory";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Material | Equipment | PPE) => void;
  editItem?: Material | Equipment | PPE | null;
}

type TabType = "material" | "equipment" | "ppe" | "request";

const AddInventoryModal = ({ isOpen, onClose, onAdd, editItem }: AddInventoryModalProps) => {
  const isEditing = !!editItem;

  const getInitialTab = (): TabType => {
    if (editItem) {
      if (editItem.type === "material") return "material";
      if (editItem.type === "ppe") return "ppe";
      return "equipment";
    }
    return "material";
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMaterialDefaults = (): Partial<Material> => {
    if (editItem && editItem.type === "material") {
      return { ...editItem };
    }
    return {
      name: "",
      category: "Reinforced Concrete",
      materialCode: "",
      batchNumber: "",
      currentStock: 0,
      minStockLevel: 0,
      unit: "",
      reorderQty: 0,
      supplier: "",
      receivedDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      storageLocation: "",
      status: "good",
    };
  };

  const getEquipmentDefaults = (): Partial<Equipment> => {
    if (editItem && editItem.type === "equipment") {
      return { ...editItem };
    }
    return {
      name: "",
      category: "Heavy Machinery",
      equipmentCode: "",
      currentStock: 1,
      minStockLevel: 1,
      unit: "pcs",
      condition: "excellent",
      supplier: "",
      serialNumber: "",
      status: "good",
      ownershipType: "owned",
      cost: undefined,
      currentLocation: "",
      operatorAssignedId: "",
      hoursOfOperation: 0,
      rentalCompany: "",
      contractStartDate: "",
      contractEndDate: "",
      lastMaintenance: "",
      nextMaintenance: "",
    };
  };

  const getPPEDefaults = (): Partial<PPE> => {
    if (editItem && editItem.type === "ppe") {
      return { ...editItem };
    }
    return {
      name: "",
      ppeCode: "",
      category: "head_protection",
      currentStock: 0,
      minStockLevel: 0,
      unit: "pieces",
      supplier: "",
      status: "good",
      size: "",
      expiryDate: "",
      safetyStandard: "",
    };
  };

  const [materialForm, setMaterialForm] = useState<Partial<Material>>(getMaterialDefaults);
  const [equipmentForm, setEquipmentForm] = useState<Partial<Equipment>>(getEquipmentDefaults);
  const [ppeForm, setPPEForm] = useState<Partial<PPE>>(getPPEDefaults);

  const [requestForm, setRequestForm] = useState({
    itemId: "",
    quantity: 1,
    priority: "medium" as "high" | "medium" | "low",
    notes: "",
  });

  if (!isOpen) return null;

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRequestForm({ itemId: "", quantity: 1, priority: "medium", notes: "" });
    setIsSubmitting(false);
    onClose();
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEditingMaterial = editItem?.type === "material";
    const newMaterial: Material = {
      id: isEditingMaterial && editItem ? editItem.id : `mat-${Date.now()}`,
      type: "material",
      name: materialForm.name || "",
      category: materialForm.category as MaterialCategory || "Reinforced Concrete",
      materialCode: materialForm.materialCode || "",
      batchNumber: materialForm.batchNumber,
      currentStock: materialForm.currentStock ?? 0,
      minStockLevel: materialForm.minStockLevel ?? 0,
      unit: materialForm.unit || "",
      status: (materialForm.currentStock ?? 0) === 0 ? "out" : (materialForm.currentStock ?? 0) <= (materialForm.minStockLevel ?? 0) ? "low" : "good",
      supplier: materialForm.supplier,
      receivedDate: materialForm.receivedDate,
      expiryDate: materialForm.expiryDate,
      storageLocation: materialForm.storageLocation,
      reorderQty: materialForm.reorderQty || 0,
      lastRestocked: new Date().toISOString().split("T")[0],
      createdAt: isEditingMaterial && editItem ? (editItem as Material).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    onAdd(newMaterial);
    setMaterialForm({ name: "", category: "Reinforced Concrete", materialCode: "", batchNumber: "", currentStock: 0, minStockLevel: 0, unit: "", reorderQty: 0, supplier: "", receivedDate: new Date().toISOString().split("T")[0], expiryDate: "", storageLocation: "", status: "good" });
    setIsSubmitting(false);
    onClose();
  };

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEditingEquipment = editItem?.type === "equipment";
    const newEquipment: Equipment = {
      id: isEditingEquipment && editItem ? editItem.id : `eq-${Date.now()}`,
      type: "equipment",
      name: equipmentForm.name || "",
      category: equipmentForm.category || "Heavy Machinery",
      equipmentCode: equipmentForm.equipmentCode || "",
      currentStock: equipmentForm.currentStock ?? 1,
      minStockLevel: equipmentForm.minStockLevel ?? 1,
      unit: equipmentForm.unit || "pcs",
      status: "good",
      supplier: equipmentForm.supplier,
      serialNumber: equipmentForm.serialNumber,
      condition: equipmentForm.condition as EquipmentCondition || "good",
      currentLocation: equipmentForm.currentLocation,
      operatorAssignedId: equipmentForm.operatorAssignedId,
      hoursOfOperation: equipmentForm.hoursOfOperation ?? 0,
      lastMaintenance: equipmentForm.lastMaintenance,
      nextMaintenance: equipmentForm.nextMaintenance,
      ownershipType: equipmentForm.ownershipType || "owned",
      rentalCompany: equipmentForm.rentalCompany,
      contractStartDate: equipmentForm.contractStartDate,
      contractEndDate: equipmentForm.contractEndDate,
      cost: equipmentForm.cost || undefined,
      createdAt: isEditingEquipment && editItem ? (editItem as Equipment).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    onAdd(newEquipment);
    setEquipmentForm({ name: "", category: "Heavy Machinery", equipmentCode: "", currentStock: 1, minStockLevel: 1, unit: "pcs", condition: "excellent", supplier: "", serialNumber: "", status: "good", ownershipType: "owned", cost: undefined, currentLocation: "", operatorAssignedId: "", hoursOfOperation: 0, rentalCompany: "", contractStartDate: "", contractEndDate: "", lastMaintenance: "", nextMaintenance: "" });
    setIsSubmitting(false);
    onClose();
  };

  const handlePPESubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEditingPPE = editItem?.type === "ppe";
    const newPPE: PPE = {
      id: isEditingPPE && editItem ? editItem.id : `ppe-${Date.now()}`,
      type: "ppe",
      name: ppeForm.name || "",
      ppeCode: ppeForm.ppeCode || "",
      category: (ppeForm.category as PPECategory) || "head_protection",
      currentStock: ppeForm.currentStock ?? 0,
      minStockLevel: ppeForm.minStockLevel ?? 0,
      unit: ppeForm.unit || "pieces",
      status: (ppeForm.currentStock ?? 0) === 0 ? "out" : (ppeForm.currentStock ?? 0) <= (ppeForm.minStockLevel ?? 0) ? "low" : "good",
      supplier: ppeForm.supplier,
      size: ppeForm.size,
      expiryDate: ppeForm.expiryDate,
      safetyStandard: ppeForm.safetyStandard,
      price: ppeForm.price,
      createdAt: isEditingPPE && editItem ? (editItem as PPE).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    onAdd(newPPE);
    setPPEForm({ name: "", ppeCode: "", category: "head_protection", currentStock: 0, minStockLevel: 0, unit: "pieces", supplier: "", status: "good", size: "", expiryDate: "", safetyStandard: "" });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#021422]">{isEditing ? "Edit Inventory" : "Add Inventory"}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab("material")} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "material" ? "text-white bg-[#021422]" : "text-gray-500 hover:text-[#021422] hover:bg-gray-50"}`}>
              <Package className="w-4 h-4" /> Material
            </button>
            <button onClick={() => setActiveTab("equipment")} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "equipment" ? "text-white bg-[#021422]" : "text-gray-500 hover:text-[#021422] hover:bg-gray-50"}`}>
              <Wrench className="w-4 h-4" /> Equipment
            </button>
            <button onClick={() => setActiveTab("ppe")} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "ppe" ? "text-white bg-[#021422]" : "text-gray-500 hover:text-[#021422] hover:bg-gray-50"}`}>
              <Shield className="w-4 h-4" /> PPE
            </button>
            <button onClick={() => setActiveTab("request")} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "request" ? "text-white bg-[#021422]" : "text-gray-500 hover:text-[#021422] hover:bg-gray-50"}`}>
              <Paperclip className="w-4 h-4" /> Request
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {activeTab === "material" ? (
              <form onSubmit={handleMaterialSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input type="text" required value={materialForm.name || ""} onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Ready-Mix Concrete 4500 PSI" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select required value={materialForm.category || ""} onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select category</option>
                      {INVENTORY_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                    <input type="number" required min="0" value={materialForm.currentStock || ""} onChange={(e) => setMaterialForm({ ...materialForm, currentStock: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level *</label>
                    <input type="number" required min="0" value={materialForm.minStockLevel} onChange={(e) => setMaterialForm({ ...materialForm, minStockLevel: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                    <input type="text" required value={materialForm.unit} onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., m³, kg, pcs" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Quantity</label>
                    <input type="number" min="0" value={materialForm.reorderQty} onChange={(e) => setMaterialForm({ ...materialForm, reorderQty: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input type="text" value={materialForm.supplier || ""} onChange={(e) => setMaterialForm({ ...materialForm, supplier: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., ABC Concrete Supply" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Material" : "Add Material")}
                  </button>
                </div>
              </form>
            ) : activeTab === "equipment" ? (
              <form onSubmit={handleEquipmentSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
                    <input type="text" required value={equipmentForm.name} onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Concrete Mixer #001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select required value={equipmentForm.category || ""} onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select category</option>
                      {EQUIPMENT_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                    <input type="text" value={equipmentForm.serialNumber || ""} onChange={(e) => setEquipmentForm({ ...equipmentForm, serialNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., CM-2024-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                    <select required value={equipmentForm.condition || ""} onChange={(e) => setEquipmentForm({ ...equipmentForm, condition: e.target.value as EquipmentCondition })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select condition</option>
                      <option value="excellent">New</option>
                      <option value="good">Used</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input type="text" value={equipmentForm.supplier || ""} onChange={(e) => setEquipmentForm({ ...equipmentForm, supplier: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., ToolMaster Rentals" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEquipmentForm({ ...equipmentForm, ownershipType: "owned", cost: undefined })} className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${equipmentForm.ownershipType === "owned" ? "bg-[#021422] text-white border-[#021422]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>Owned</button>
                      <button type="button" onClick={() => setEquipmentForm({ ...equipmentForm, ownershipType: "rented" })} className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${equipmentForm.ownershipType === "rented" ? "bg-[#021422] text-white border-[#021422]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>Rented</button>
                      <button type="button" onClick={() => setEquipmentForm({ ...equipmentForm, ownershipType: "leased" })} className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${equipmentForm.ownershipType === "leased" ? "bg-[#021422] text-white border-[#021422]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>Leased</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{equipmentForm.ownershipType === "rented" ? "Rental Cost" : equipmentForm.ownershipType === "leased" ? "Lease Cost" : "Cost"} (₦)</label>
                    <input type="number" min="0" step="0.01" value={equipmentForm.cost ?? ""} onChange={(e) => setEquipmentForm({ ...equipmentForm, cost: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={equipmentForm.ownershipType === "owned" ? "Cost" : "e.g., 5000.00"} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance Date</label>
                    <input type="date" value={equipmentForm.lastMaintenance} onChange={(e) => setEquipmentForm({ ...equipmentForm, lastMaintenance: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Equipment" : "Add Equipment")}
                  </button>
                </div>
              </form>
            ) : activeTab === "ppe" ? (
              <form onSubmit={handlePPESubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">PPE Name *</label>
                    <input type="text" required value={ppeForm.name || ""} onChange={(e) => setPPEForm({ ...ppeForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Safety Helmet, Safety Gloves" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                    <input type="number" required min="0" value={ppeForm.currentStock || ""} onChange={(e) => setPPEForm({ ...ppeForm, currentStock: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level *</label>
                    <input type="number" required min="0" value={ppeForm.minStockLevel} onChange={(e) => setPPEForm({ ...ppeForm, minStockLevel: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                    <input type="text" required value={ppeForm.unit || ""} onChange={(e) => setPPEForm({ ...ppeForm, unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., pcs, pairs" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <input type="text" value={ppeForm.size || ""} onChange={(e) => setPPEForm({ ...ppeForm, size: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., S/M/L, Universal" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input type="text" value={ppeForm.supplier || ""} onChange={(e) => setPPEForm({ ...ppeForm, supplier: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., SafetyFirst Equipment" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₦)</label>
                    <input type="number" min="0" step="0.01" value={ppeForm.price ?? ""} onChange={(e) => setPPEForm({ ...ppeForm, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 1500.00" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update PPE" : "Add PPE")}
                  </button>
                </div>
              </form>
            ) : activeTab === "request" ? (
              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Item *</label>
                    <select required value={requestForm.itemId} onChange={(e) => setRequestForm({ ...requestForm, itemId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                      <option value="">Choose an item...</option>
                      {getAllInventory().map((item) => (<option key={item.id} value={item.id}>{item.name} ({item.type}) - Stock: {item.currentStock} {item.unit}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed *</label>
                      <input type="number" required min="1" value={requestForm.quantity} onChange={(e) => setRequestForm({ ...requestForm, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                      <select required value={requestForm.priority} onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value as "high" | "medium" | "low" })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes</label>
                    <textarea value={requestForm.notes} onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" rows={3} placeholder="e.g., Needed for WP-205 foundation work..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryModal;
