"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Package,
  Wrench,
  Shield,
  Paperclip,
  Check,
  ChevronDown,
  Plus,
  Star,
  Upload,
} from "lucide-react";
import type {
  Material,
  Equipment,
  PPE,
  MaterialCategory,
  EquipmentCondition,
  EquipmentOperationalStatus,
  PPECategory,
} from "@/lib/types/inventory";
import {
  INVENTORY_CATEGORIES,
  EQUIPMENT_CATEGORIES,
  PPE_CATEGORIES,
  OWNERSHIP_TYPES,
} from "@/lib/types/inventory";
import {
  itemTemplates,
  type ItemTemplate,
} from "@/lib/templates/itemTemplates";
import { useInventory } from "@/store/inventoryStore";
import { inventoryService } from "@/lib/services/inventoryService";
import {
  materialToApi,
  materialFromApi,
  equipmentToApi,
  equipmentFromApi,
  ppeToApi,
  ppeFromApi,
} from "@/lib/transforms/inventoryTransforms";
import { getErrorMessage } from "@/lib/error";
import SearchableSelect from "@/components/SearchableSelect";
import {
  MATERIAL_CATEGORY_MAP,
  PPE_STORAGE_LOCATIONS,
} from "@/lib/transforms/inventoryTransforms";
import toast from "react-hot-toast";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Material | Equipment | PPE) => void;
  editItem?: Material | Equipment | PPE | null;
  inventoryItems?: (Material | Equipment | PPE)[];
  libraryTemplate?: ItemTemplate | null;
  projectUuid: string;
}

type TabType = "material" | "equipment" | "ppe" | "request";

const UNITS_LIST: { value: string; label: string }[] = [
  { value: "m2",    label: "m²"    },
  { value: "m3",    label: "m³"    },
  { value: "kg",    label: "kg"    },
  { value: "pcs",   label: "Pcs"   },
  { value: "ltr",   label: "Litre" },
  { value: "mtr",   label: "M"     },
  { value: "bag",   label: "Bag"   },
  { value: "ton",   label: "Ton"   },
  { value: "roll",  label: "Roll"  },
  { value: "sheet", label: "Sheet" },
  { value: "pair",  label: "Pair"  },
];

const PPE_SIZES: { value: string; label: string }[] = [
  { value: "xs", label: "XS" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xl", label: "XL" },
  { value: "xxl", label: "XXL" },
  { value: "universal", label: "Universal" },
];

const AddInventoryModal = ({
  isOpen,
  onClose,
  onAdd,
  editItem,
  inventoryItems = [],
  libraryTemplate = null,
  projectUuid,
}: AddInventoryModalProps) => {
  const isEditing = !!editItem;
  const [userTab, setUserTab] = useState<TabType>("material");
  const contextTab = editItem?.type || libraryTemplate?.type;
  const activeTab = contextTab || userTab;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templateDropdownSearch, setTemplateDropdownSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const customTemplates = useInventory((state) => state.customTemplates);

  const [materialImageFile, setMaterialImageFile] = useState<File | null>(null);
  const [equipmentImageFile, setEquipmentImageFile] = useState<File | null>(
    null,
  );
  const [ppeImageFile, setPpeImageFile] = useState<File | null>(null);

  const [materialForm, setMaterialForm] = useState({
    name: "",
    category: "" as MaterialCategory,
    materialCode: "",
    batchNumber: "",
    currentStock: 0,
    minStockLevel: 0,
    unit: "",
    receivedDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    storageLocation: "",
    manufacturer: "",
    supplier: "",
    reorderQty: 0,
    price: undefined as number | undefined,
    notes: "",
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    category: "",
    equipmentCode: "",
    serialNumber: "",
    currentStock: 1,
    unit: "",
    condition: "excellent" as EquipmentCondition,
    currentLocation: "",
    hoursOfOperation: 0,
    ownershipType: "owned" as "owned" | "rented" | "leased",
    rentalCompany: "",
    contractStartDate: "",
    contractEndDate: "",
    lastMaintenance: "",
    nextMaintenance: "",
    cost: undefined as number | undefined,
    supplier: "",
    equipmentStatus: "idle" as EquipmentOperationalStatus,
    notes: "",
    manufacturer: "",
    model: "",
    operatorAssigned: "",
    fuelConsumptionRate: 0,
  });

  const [ppeForm, setPpeForm] = useState({
    name: "",
    ppeCode: "",
    category: "" as PPECategory,
    currentStock: 0,
    minStockLevel: 0,
    unit: "",
    size: "",
    expiryDate: "",
    safetyStandard: "",
    storageLocation: "",
    supplier: "",
    price: undefined as number | undefined,
    notes: "",
  });

  const [requestForm, setRequestForm] = useState({
    itemId: "",
    quantity: 1,
    priority: "medium" as "high" | "medium" | "low",
    notes: "",
  });

  const generateCode = (
    type: string,
    name: string,
    category: string,
  ): string => {
    const prefix = category.split(" ")[0].substring(0, 3).toUpperCase();
    const brand = name.split(" ")[0].substring(0, 3).toUpperCase();
    const spec = name.includes("50kg")
      ? "50KG"
      : name.includes("25kg")
        ? "25KG"
        : "STD";
    return `${prefix}-${brand}-${spec}`;
  };

  const getFilteredTemplatesByTab = (tab: TabType) => {
    const allTemplates = [...customTemplates, ...itemTemplates];
    return allTemplates.filter((t) => {
      const matchesTab = t.type === tab;
      const searchLower = templateDropdownSearch.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        t.supplier?.toLowerCase().includes(searchLower);
      return matchesTab && matchesSearch;
    });
  };

  const handleTemplateSelect = (template: ItemTemplate) => {
    if (template.type === "material") {
      setMaterialForm((prev) => ({
        ...prev,
        name: template.name,
        materialCode:
          template.materialCode ||
          generateCode("material", template.name, template.category),
        category: template.category as MaterialCategory,
        unit: template.unit,
        supplier: template.supplier || "",
        manufacturer: template.manufacturer || "",
        minStockLevel: template.minStockLevel || 0,
        reorderQty: template.reorderQty || 0,
        storageLocation: template.storageLocation || "",
      }));
    } else if (template.type === "equipment") {
      setEquipmentForm((prev) => ({
        ...prev,
        name: template.name,
        category: template.category,
        equipmentCode:
          template.materialCode ||
          generateCode("equipment", template.name, template.category),
        unit: template.unit,
        supplier: template.supplier || "",
        ownershipType:
          (template.ownershipType as "owned" | "rented" | "leased") || "owned",
        rentalCompany: template.rentalCompany || "",
        currentLocation: template.storageLocation || "",
        hoursOfOperation: template.hoursOfOperation || 0,
        minStockLevel: template.minStockLevel || 1,
      }));
    } else if (template.type === "ppe") {
      setPpeForm((prev) => ({
        ...prev,
        name: template.name,
        ppeCode:
          template.materialCode ||
          generateCode("ppe", template.name, template.category),
        category: (template.ppeCategory as PPECategory) || "" as PPECategory,
        unit: template.unit,
        supplier: template.supplier || "",
        safetyStandard: template.safetyStandard || "",
        size: template.size || "",
        minStockLevel: template.minStockLevel || 0,
      }));
    }
    setShowTemplateDropdown(false);
    setTemplateDropdownSearch("");
  };

  const toFormData = (
    payload: Record<string, unknown>,
    imageFile?: File | null,
  ): FormData => {
    const fd = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null) fd.append(key, String(value));
    }
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = materialToApi({
        name: materialForm.name,
        category: materialForm.category,
        materialCode: materialForm.materialCode,
        batchNumber: materialForm.batchNumber || undefined,
        currentStock: materialForm.currentStock,
        minStockLevel: materialForm.minStockLevel,
        unit: materialForm.unit,
        receivedDate: materialForm.receivedDate || undefined,
        expiryDate: materialForm.expiryDate || undefined,
        storageLocation: materialForm.storageLocation || undefined,
        manufacturer: materialForm.manufacturer || undefined,
        supplier: materialForm.supplier || undefined,
        reorderQty: materialForm.reorderQty,
        price: materialForm.price,
        notes: materialForm.notes || undefined,
      });
      const body = toFormData(
        payload as Record<string, unknown>,
        materialImageFile,
      );

      let result: Material;
      if (isEditing && editItem?.id) {
        const res = await inventoryService.updateMaterial(projectUuid, editItem.id, body);
        result = materialFromApi(res.data);
      } else {
        const res = await inventoryService.createMaterial(projectUuid, body);
        result = materialFromApi(res.data);
      }

      onAdd(result);
      toast.success(isEditing ? "Material updated" : "Material added");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = equipmentToApi({
        name: equipmentForm.name,
        category: equipmentForm.category,
        equipmentCode: equipmentForm.equipmentCode,
        serialNumber: equipmentForm.serialNumber || undefined,
        currentStock: equipmentForm.currentStock,
        unit: equipmentForm.unit,
        condition: equipmentForm.condition,
        currentLocation: equipmentForm.currentLocation || undefined,
        hoursOfOperation: equipmentForm.hoursOfOperation,
        ownershipType: equipmentForm.ownershipType,
        rentalCompany: equipmentForm.rentalCompany || undefined,
        contractStartDate: equipmentForm.contractStartDate || undefined,
        contractEndDate: equipmentForm.contractEndDate || undefined,
        lastMaintenance: equipmentForm.lastMaintenance || undefined,
        nextMaintenance: equipmentForm.nextMaintenance || undefined,
        cost: equipmentForm.cost,
        supplier: equipmentForm.supplier || undefined,
        equipmentStatus: equipmentForm.equipmentStatus,
        notes: equipmentForm.notes || undefined,
        manufacturer: equipmentForm.manufacturer || undefined,
        model: equipmentForm.model || undefined,
        operatorAssignedId: equipmentForm.operatorAssigned || undefined,
        fuelConsumptionRate: equipmentForm.fuelConsumptionRate || undefined,
      });
      const body = toFormData(
        payload as Record<string, unknown>,
        equipmentImageFile,
      );

      let result: Equipment;
      if (isEditing && editItem?.id) {
        const res = await inventoryService.updateEquipment(projectUuid, editItem.id, body);
        result = equipmentFromApi(res.data);
      } else {
        const res = await inventoryService.createEquipment(projectUuid, body);
        result = equipmentFromApi(res.data);
      }

      onAdd(result);
      toast.success(isEditing ? "Equipment updated" : "Equipment added");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePPESubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = ppeToApi({
        name: ppeForm.name,
        ppeCode: ppeForm.ppeCode,
        category: ppeForm.category,
        currentStock: ppeForm.currentStock,
        minStockLevel: ppeForm.minStockLevel,
        unit: ppeForm.unit,
        size: ppeForm.size || undefined,
        expiryDate: ppeForm.expiryDate || undefined,
        safetyStandard: ppeForm.safetyStandard || undefined,
        storageLocation: ppeForm.storageLocation || undefined,
        supplier: ppeForm.supplier || undefined,
        price: ppeForm.price,
        notes: ppeForm.notes || undefined,
      });
      const body = toFormData(payload as Record<string, unknown>, ppeImageFile);

      let result: PPE;
      if (isEditing && editItem?.id) {
        const res = await inventoryService.updatePPE(projectUuid, editItem.id, body);
        result = ppeFromApi(res.data);
      } else {
        const res = await inventoryService.createPPE(projectUuid, body);
        result = ppeFromApi(res.data);
      }

      onAdd(result);
      toast.success(isEditing ? "PPE updated" : "PPE added");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedItem = inventoryItems.find(
      (item) => item.id === requestForm.itemId,
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Material request submitted:", {
      item: selectedItem?.name,
      quantity: requestForm.quantity,
      priority: requestForm.priority,
      notes: requestForm.notes,
    });

    setRequestForm({
      itemId: "",
      quantity: 1,
      priority: "medium",
      notes: "",
    });
    setIsSubmitting(false);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowTemplateDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pre-populate form when editing an existing item
  useEffect(() => {
    if (!editItem) return;
    if (editItem.type === "material") {
      const m = editItem as Material;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMaterialForm({
        name: m.name,
        category: m.category as MaterialCategory,
        materialCode: m.materialCode || "",
        batchNumber: m.batchNumber || "",
        currentStock: m.currentStock,
        minStockLevel: m.minStockLevel,
        unit: m.unit,
        receivedDate: m.receivedDate || new Date().toISOString().split("T")[0],
        expiryDate: m.expiryDate || "",
        storageLocation: m.storageLocation || "",
        manufacturer: m.manufacturer || "",
        supplier: m.supplier || "",
        reorderQty: m.reorderQty,
        price: m.price,
        notes: m.notes || "",
      });
    } else if (editItem.type === "equipment") {
      const eq = editItem as Equipment;
      setEquipmentForm({
        name: eq.name,
        category: eq.category,
        equipmentCode: eq.equipmentCode || "",
        serialNumber: eq.serialNumber || "",
        currentStock: eq.currentStock,
        unit: eq.unit,
        condition: eq.condition,
        currentLocation: eq.currentLocation || "",
        hoursOfOperation: eq.hoursOfOperation || 0,
        ownershipType: eq.ownershipType || "owned",
        rentalCompany: eq.rentalCompany || "",
        contractStartDate: eq.contractStartDate || "",
        contractEndDate: eq.contractEndDate || "",
        lastMaintenance: eq.lastMaintenance || "",
        nextMaintenance: eq.nextMaintenance || "",
        cost: eq.cost,
        supplier: eq.supplier || "",
        equipmentStatus: eq.equipmentStatus || "idle",
        notes: eq.notes || "",
        manufacturer: eq.manufacturer || "",
        model: eq.model || "",
        operatorAssigned: eq.operatorAssignedId || "",
        fuelConsumptionRate: eq.fuelConsumptionRate || 0,
      });
    } else if (editItem.type === "ppe") {
      const p = editItem as PPE;
      setPpeForm({
        name: p.name,
        ppeCode: p.ppeCode || "",
        category: p.category,
        currentStock: p.currentStock,
        minStockLevel: p.minStockLevel,
        unit: p.unit,
        size: p.size || "",
        expiryDate: p.expiryDate || "",
        safetyStandard: p.safetyStandard || "",
        storageLocation: p.storageLocation || "",
        supplier: p.supplier || "",
        price: p.price,
        notes: p.notes || "",
      });
    }
  }, [editItem]);

  // Pre-populate form from library template
  useEffect(() => {
    if (!libraryTemplate) return;
    if (libraryTemplate.type === "material") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMaterialForm({
        name: libraryTemplate.name,
        category: libraryTemplate.category as MaterialCategory,
        materialCode: libraryTemplate.materialCode || "",
        batchNumber: "",
        currentStock: 0,
        minStockLevel: libraryTemplate.minStockLevel || 0,
        unit: libraryTemplate.unit,
        receivedDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        storageLocation: libraryTemplate.storageLocation || "",
        manufacturer: libraryTemplate.manufacturer || "",
        supplier: libraryTemplate.supplier || "",
        reorderQty: libraryTemplate.reorderQty || 0,
        price: undefined,
        notes: "",
      });
    } else if (libraryTemplate.type === "equipment") {
      setEquipmentForm({
        name: libraryTemplate.name,
        category: libraryTemplate.category,
        equipmentCode: libraryTemplate.materialCode || "",
        serialNumber: "",
        currentStock: 1,
        unit: libraryTemplate.unit,
        condition: "good",
        currentLocation: libraryTemplate.storageLocation || "",
        hoursOfOperation: libraryTemplate.hoursOfOperation || 0,
        ownershipType:
          (libraryTemplate.ownershipType as "owned" | "rented" | "leased") ||
          "owned",
        rentalCompany: libraryTemplate.rentalCompany || "",
        contractStartDate: "",
        contractEndDate: "",
        lastMaintenance: "",
        nextMaintenance: "",
        cost: undefined,
        supplier: libraryTemplate.supplier || "",
        equipmentStatus: "idle",
        notes: "",
        manufacturer: libraryTemplate.manufacturer || "",
        model: "",
        operatorAssigned: "",
        fuelConsumptionRate: 0,
      });
    } else if (libraryTemplate.type === "ppe") {
      setPpeForm({
        name: libraryTemplate.name,
        ppeCode: libraryTemplate.materialCode || "",
        category:
          (libraryTemplate.ppeCategory as PPECategory) || "head_protection",
        currentStock: 0,
        minStockLevel: libraryTemplate.minStockLevel || 0,
        unit: libraryTemplate.unit,
        size: libraryTemplate.size || "",
        expiryDate: "",
        safetyStandard: libraryTemplate.safetyStandard || "",
        storageLocation: libraryTemplate.storageLocation || "",
        supplier: libraryTemplate.supplier || "",
        price: undefined,
        notes: "",
      });
    }
  }, [libraryTemplate]);

  if (!isOpen) return null;

  const getCategoryOptions = (tab: TabType) => {
    if (tab === "material") return INVENTORY_CATEGORIES;
    if (tab === "equipment") return EQUIPMENT_CATEGORIES;
    if (tab === "ppe")
      return PPE_CATEGORIES.map((c) =>
        c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      );
    return [];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Edit Inventory" : "Add Inventory"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-gray-200">
            {(["material", "equipment", "ppe", "request"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setUserTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab
                      ? "text-white bg-blue-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tab === "material" && <Package className="w-4 h-4" />}
                  {tab === "equipment" && <Wrench className="w-4 h-4" />}
                  {tab === "ppe" && <Shield className="w-4 h-4" />}
                  {tab === "request" && <Paperclip className="w-4 h-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ),
            )}
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {activeTab === "material" && (
              <form onSubmit={handleMaterialSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Common Items
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          value={materialForm.name}
                          onChange={(e) => {
                            setMaterialForm({
                              ...materialForm,
                              name: e.target.value,
                            });
                            setTemplateDropdownSearch(e.target.value);
                            setShowTemplateDropdown(true);
                          }}
                          onFocus={() => setShowTemplateDropdown(true)}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="Type to search common items..."
                          autoComplete="off"
                        />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {showTemplateDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                          {getFilteredTemplatesByTab("material").length ===
                          0 ? (
                            <div className="px-4 py-8 text-center">
                              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-500">
                                No matching items
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Type a custom name to create a new item
                              </p>
                            </div>
                          ) : (
                            getFilteredTemplatesByTab("material").map(
                              (template, idx) => {
                                const isCustom =
                                  template.id.startsWith("custom-");
                                return (
                                  <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => {
                                      handleTemplateSelect(template);
                                      setShowTemplateDropdown(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left transition-all border-b border-gray-100 last:border-b-0 hover:bg-sky-50 ${
                                      idx === 0 ? "rounded-t-xl" : ""
                                    } ${idx === getFilteredTemplatesByTab("material").length - 1 ? "rounded-b-xl" : ""}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-gray-900 truncate">
                                            {template.name}
                                          </p>
                                          {isCustom && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 rounded">
                                              <Star className="w-3 h-3" />{" "}
                                              Custom
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 ml-6">
                                          {template.category}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 ml-6">
                                          {template.supplier || "No supplier"} •{" "}
                                          {template.unit}
                                        </p>
                                      </div>
                                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded shrink-0">
                                        {template.materialCode || template.id}
                                      </span>
                                    </div>
                                  </button>
                                );
                              },
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={materialForm.materialCode}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          materialCode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., CEM-DNG-50KG"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <SearchableSelect
                      value={materialForm.category}
                      onChange={(val) =>
                        setMaterialForm({
                          ...materialForm,
                          category: val as MaterialCategory,
                        })
                      }
                      options={INVENTORY_CATEGORIES.map((c) => ({
                        value: c,
                        label: c,
                      }))}
                      placeholder="Select or type a category..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={materialForm.currentStock || ""}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          currentStock: Math.round(Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock Level *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={materialForm.minStockLevel}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          minStockLevel: Math.round(Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <SearchableSelect
                      value={materialForm.unit}
                      onChange={(val) =>
                        setMaterialForm({
                          ...materialForm,
                          unit: val,
                        })
                      }
                      options={UNITS_LIST.map((u) => ({
                        value: u.value,
                        label: u.label,
                      }))}
                      placeholder="Select or type a unit..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Received Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={materialForm.receivedDate}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          receivedDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      value={materialForm.batchNumber}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          batchNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., BATCH-2026-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={materialForm.expiryDate}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Location
                    </label>
                    <select
                      value={materialForm.storageLocation}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          storageLocation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select location</option>
                      {PPE_STORAGE_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc.charAt(0).toUpperCase() + loc.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={materialForm.manufacturer}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          manufacturer: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Dangote Plc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={materialForm.supplier}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          supplier: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Dangote Industries"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={materialForm.reorderQty}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          reorderQty: Math.round(Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={materialForm.price || ""}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          price: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={materialForm.notes}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          notes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                      placeholder="Additional notes about this material..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Image
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                        <Upload className="w-4 h-4" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setMaterialImageFile(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      {materialImageFile && (
                        <span className="text-sm text-gray-500 truncate max-w-xs">
                          {materialImageFile.name}
                        </span>
                      )}
                    </div>
                  </div>
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
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? isEditing
                        ? "Updating..."
                        : "Adding..."
                      : isEditing
                        ? "Update Material"
                        : "Add Material"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "equipment" && (
              <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Common Items
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          value={equipmentForm.name}
                          onChange={(e) => {
                            setEquipmentForm({
                              ...equipmentForm,
                              name: e.target.value,
                            });
                            setTemplateDropdownSearch(e.target.value);
                            setShowTemplateDropdown(true);
                          }}
                          onFocus={() => setShowTemplateDropdown(true)}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="Type to search common items..."
                          autoComplete="off"
                        />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {showTemplateDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                          {getFilteredTemplatesByTab("equipment").length ===
                          0 ? (
                            <div className="px-4 py-8 text-center">
                              <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-500">
                                No matching items
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Type a custom name to create a new item
                              </p>
                            </div>
                          ) : (
                            getFilteredTemplatesByTab("equipment").map(
                              (template, idx) => {
                                const isCustom =
                                  template.id.startsWith("custom-");
                                return (
                                  <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => {
                                      handleTemplateSelect(template);
                                      setShowTemplateDropdown(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left transition-all border-b border-gray-100 last:border-b-0 hover:bg-sky-50 ${
                                      idx === 0 ? "rounded-t-xl" : ""
                                    } ${idx === getFilteredTemplatesByTab("equipment").length - 1 ? "rounded-b-xl" : ""}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-gray-900 truncate">
                                            {template.name}
                                          </p>
                                          {isCustom && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 rounded">
                                              <Star className="w-3 h-3" />{" "}
                                              Custom
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 ml-6">
                                          {template.category}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 ml-6">
                                          {template.supplier || "No supplier"} •{" "}
                                          {template.unit}
                                        </p>
                                      </div>
                                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded shrink-0">
                                        {template.materialCode || template.id}
                                      </span>
                                    </div>
                                  </button>
                                );
                              },
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipment Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={equipmentForm.equipmentCode}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          equipmentCode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., EQ-CM-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <SearchableSelect
                      value={equipmentForm.category}
                      onChange={(val) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          category: val,
                        })
                      }
                      options={EQUIPMENT_CATEGORIES.map((c) => ({
                        value: c,
                        label: c,
                      }))}
                      placeholder="Select or type a category..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.manufacturer}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          manufacturer: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Caterpillar, Komatsu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.model}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          model: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 320 GC, D6N XL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.serialNumber}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          serialNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., CM-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition *
                    </label>
                    <select
                      required
                      value={equipmentForm.condition}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          condition: e.target.value as EquipmentCondition,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="excellent">New</option>
                      <option value="good">Used</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={equipmentForm.currentStock || ""}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          currentStock: Math.round(Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <SearchableSelect
                      value={equipmentForm.unit}
                      onChange={(val) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          unit: val,
                        })
                      }
                      options={UNITS_LIST.map((u) => ({
                        value: u.value,
                        label: u.label,
                      }))}
                      placeholder="Select or type a unit..."
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={equipmentForm.currentLocation}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          currentLocation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Grid B5, Zone A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operator Assigned
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.operatorAssigned}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          operatorAssigned: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Worker name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours of Operation
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={equipmentForm.hoursOfOperation || ""}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          hoursOfOperation: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Consumption (L/hr)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={equipmentForm.fuelConsumptionRate || ""}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          fuelConsumptionRate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipment Status
                    </label>
                    <select
                      value={equipmentForm.equipmentStatus}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          equipmentStatus: e.target.value as EquipmentOperationalStatus,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="operational">Excellent</option>
                      <option value="idle">Good</option>
                      <option value="under_repair">Fair</option>
                      <option value="scrapped">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ownership Type *
                    </label>
                    <select
                      required
                      value={equipmentForm.ownershipType}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          ownershipType: e.target.value as
                            | "owned"
                            | "rented"
                            | "leased"
                            | "leased",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="owned">Owned</option>
                      <option value="rented">Rented</option>
                      <option value="leased">Leased</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.supplier}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          supplier: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., ToolMaster Rentals"
                    />
                  </div>
                  {/* Cost — required for all ownership types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {equipmentForm.ownershipType === "rented"
                        ? "Rental Cost"
                        : equipmentForm.ownershipType === "leased"
                          ? "Lease Cost"
                          : "Cost"}{" "}
                      ({equipmentForm.ownershipType === "owned" ? "₦" : "₦/day"}
                      )
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={equipmentForm.cost || ""}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          cost: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={
                        equipmentForm.ownershipType === "owned"
                          ? "Cost"
                          : "0.00"
                      }
                    />
                  </div>
                  {(equipmentForm.ownershipType === "rented" ||
                    equipmentForm.ownershipType === "leased") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {equipmentForm.ownershipType === "rented"
                            ? "Rental"
                            : "Lease"}{" "}
                          Company
                        </label>
                        <input
                          type="text"
                          value={equipmentForm.rentalCompany}
                          onChange={(e) =>
                            setEquipmentForm({
                              ...equipmentForm,
                              rentalCompany: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., ToolMaster Rentals"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contract Start Date
                        </label>
                        <input
                          type="date"
                          value={equipmentForm.contractStartDate}
                          onChange={(e) =>
                            setEquipmentForm({
                              ...equipmentForm,
                              contractStartDate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contract End Date
                        </label>
                        <input
                          type="date"
                          value={equipmentForm.contractEndDate}
                          onChange={(e) =>
                            setEquipmentForm({
                              ...equipmentForm,
                              contractEndDate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Maintenance
                    </label>
                    <input
                      type="date"
                      value={equipmentForm.lastMaintenance}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          lastMaintenance: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Maintenance
                    </label>
                    <input
                      type="date"
                      value={equipmentForm.nextMaintenance}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          nextMaintenance: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={equipmentForm.notes}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          notes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                      placeholder="Additional notes about this equipment..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Image
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                        <Upload className="w-4 h-4" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setEquipmentImageFile(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      {equipmentImageFile && (
                        <span className="text-sm text-gray-500 truncate max-w-xs">
                          {equipmentImageFile.name}
                        </span>
                      )}
                    </div>
                  </div>
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
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? isEditing
                        ? "Updating..."
                        : "Adding..."
                      : isEditing
                        ? "Update Equipment"
                        : "Add Equipment"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "ppe" && (
              <form onSubmit={handlePPESubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Common Items
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <div className="relative">
                        <input
                          type="text"
                          value={ppeForm.name}
                          onChange={(e) => {
                            setPpeForm({ ...ppeForm, name: e.target.value });
                            setTemplateDropdownSearch(e.target.value);
                            setShowTemplateDropdown(true);
                          }}
                          onFocus={() => setShowTemplateDropdown(true)}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="Type to search common items..."
                          autoComplete="off"
                        />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {showTemplateDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                          {getFilteredTemplatesByTab("ppe").length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-500">
                                No matching items
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Type a custom name to create a new item
                              </p>
                            </div>
                          ) : (
                            getFilteredTemplatesByTab("ppe").map(
                              (template, idx) => {
                                const isCustom =
                                  template.id.startsWith("custom-");
                                return (
                                  <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => {
                                      handleTemplateSelect(template);
                                      setShowTemplateDropdown(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left transition-all border-b border-gray-100 last:border-b-0 hover:bg-sky-50 ${
                                      idx === 0 ? "rounded-t-xl" : ""
                                    } ${idx === getFilteredTemplatesByTab("ppe").length - 1 ? "rounded-b-xl" : ""}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-gray-900 truncate">
                                            {template.name}
                                          </p>
                                          {isCustom && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 rounded">
                                              <Star className="w-3 h-3" />{" "}
                                              Custom
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 ml-6">
                                          {template.ppeCategory
                                            ? template.ppeCategory.replace(
                                                /_/g,
                                                " ",
                                              )
                                            : template.category}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 ml-6">
                                          {template.supplier || "No supplier"} •
                                          Size: {template.size || "Various"} •{" "}
                                          {template.unit}
                                        </p>
                                      </div>
                                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded shrink-0">
                                        {template.materialCode || template.id}
                                      </span>
                                    </div>
                                  </button>
                                );
                              },
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PPE Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={ppeForm.ppeCode}
                      onChange={(e) =>
                        setPpeForm({ ...ppeForm, ppeCode: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., PPE-HELM-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <SearchableSelect
                      value={ppeForm.category}
                      onChange={(val) =>
                        setPpeForm({
                          ...ppeForm,
                          category: val as PPECategory,
                        })
                      }
                      options={PPE_CATEGORIES.map((c) => ({
                        value: c,
                        label: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                      }))}
                      placeholder="Select or type a category..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={ppeForm.currentStock || ""}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setPpeForm({
                          ...ppeForm,
                          currentStock: Math.round(Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock Level *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={ppeForm.minStockLevel}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setPpeForm({
                          ...ppeForm,
                          minStockLevel: Math.round(Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <SearchableSelect
                      value={ppeForm.unit}
                      onChange={(val) =>
                        setPpeForm({ ...ppeForm, unit: val })
                      }
                      options={UNITS_LIST.map((u) => ({
                        value: u.value,
                        label: u.label,
                      }))}
                      placeholder="Select or type a unit..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <select
                      value={ppeForm.size}
                      onChange={(e) =>
                        setPpeForm({ ...ppeForm, size: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select size</option>
                      {PPE_SIZES.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={ppeForm.expiryDate}
                      onChange={(e) =>
                        setPpeForm({ ...ppeForm, expiryDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Safety Standard
                    </label>
                    <input
                      type="text"
                      value={ppeForm.safetyStandard}
                      onChange={(e) =>
                        setPpeForm({
                          ...ppeForm,
                          safetyStandard: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., ANSI Z89.1, EN 388"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Location
                    </label>
                    <select
                      value={ppeForm.storageLocation}
                      onChange={(e) =>
                        setPpeForm({
                          ...ppeForm,
                          storageLocation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select location</option>
                      {PPE_STORAGE_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={ppeForm.supplier}
                      onChange={(e) =>
                        setPpeForm({ ...ppeForm, supplier: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., SafetyFirst Equipment"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={ppeForm.price || ""}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setPpeForm({
                          ...ppeForm,
                          price: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={ppeForm.notes}
                      onChange={(e) =>
                        setPpeForm({ ...ppeForm, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                      placeholder="Additional notes about this PPE item..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Image
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                        <Upload className="w-4 h-4" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setPpeImageFile(e.target.files?.[0] || null)
                          }
                        />
                      </label>
                      {ppeImageFile && (
                        <span className="text-sm text-gray-500 truncate max-w-xs">
                          {ppeImageFile.name}
                        </span>
                      )}
                    </div>
                  </div>
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
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? isEditing
                        ? "Updating..."
                        : "Adding..."
                      : isEditing
                        ? "Update PPE"
                        : "Add PPE"}
                  </button>
                </div>
              </form>
            )}
            {activeTab === "request" && (
              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Item *
                    </label>
                    <select
                      required
                      value={requestForm.itemId}
                      onChange={(e) =>
                        setRequestForm({
                          ...requestForm,
                          itemId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Choose an item...</option>
                      {inventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.type}) - Stock: {item.currentStock}{" "}
                          {item.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Needed *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        value={requestForm.quantity}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) =>
                          setRequestForm({
                            ...requestForm,
                            quantity: Math.round(Number(e.target.value)),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority *
                      </label>
                      <select
                        required
                        value={requestForm.priority}
                        onChange={(e) =>
                          setRequestForm({
                            ...requestForm,
                            priority: e.target.value as
                              | "high"
                              | "medium"
                              | "low",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason / Notes
                    </label>
                    <textarea
                      value={requestForm.notes}
                      onChange={(e) =>
                        setRequestForm({
                          ...requestForm,
                          notes: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder="e.g., Needed for WP-205 foundation work..."
                    />
                  </div>
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
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AddInventoryModal;
