"use client";

import { create } from "zustand";
import type { ItemTemplate } from "@/lib/templates/itemTemplates";
import type {
  Material,
  Equipment,
  PPE,
  InventoryItem,
  PPEIssuance,
  StockMovement,
  StockCount,
  MovementType,
  MaterialRequest,
  MaterialRequestItem,
  MaterialRequestStatus,
  MaterialRequestPriority,
} from "@/lib/types/inventory";
import {
  getMaterials,
  getEquipment,
  getPPE,
  mockPPEIssuances,
  mockStockMovements,
  mockStockCounts,
  mockMaterialRequests,
  getProjectPurchaseOrders,
  getProjectChangeOrders,
} from "@/lib/mockData/inventory";
import type { PurchaseOrder, ChangeOrder } from "@/lib/types/vendor";
import { inventoryService } from "@/lib/services/inventoryService";
import { inventoryListItemFromApi } from "@/lib/transforms/inventoryTransforms";

export type StockLevel = "available" | "limited" | "low" | "out";

export function getStockLevel(material: Material): StockLevel {
  if (material.currentStock <= 0) return "out";
  if (material.currentStock <= material.minStockLevel) return "low";
  if (material.currentStock <= material.minStockLevel * 2) return "limited";
  return "available";
}

export function getStockLevelColor(level: StockLevel): { bg: string; text: string; dot: string } {
  switch (level) {
    case "available":
      return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" };
    case "limited":
      return { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" };
    case "low":
      return { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" };
    case "out":
      return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };
  }
}

export function getStockLevelLabel(level: StockLevel): string {
  switch (level) {
    case "available":
      return "Available";
    case "limited":
      return "Limited";
    case "low":
      return "Low Stock";
    case "out":
      return "Out of Stock";
  }
}

interface AllocationResult {
  success: boolean;
  item?: Material | Equipment;
  allocatedQty?: number;
  error?: string;
}

interface NewMaterialInput {
  name: string;
  category: string;
  unit: string;
  quantity: number;
  price?: number;
  materialCode?: string;
  storageLocation?: string;
}

interface NewEquipmentInput {
  name: string;
  category: string;
  condition: string;
  price?: number;
  equipmentCode?: string;
  currentLocation?: string;
  ownershipType?: "owned" | "rented";
}

interface NewPPEInput {
  name: string;
  unit: string;
  quantity: number;
  price?: number;
  size?: string;
  ppeCode?: string;
  category?: string;
}

// P0 - New state interfaces
interface InventoryState {
  materials: Material[];
  equipment: Equipment[];
  ppe: PPE[];
  loading: boolean;
  allItems: InventoryItem[];

  // P0 - Custom templates for standard items library
  customTemplates: ItemTemplate[];
  addCustomTemplate: (template: ItemTemplate) => void;
  removeCustomTemplate: (templateId: string) => void;

  // P0 - New state for tracking
  ppeIssuances: PPEIssuance[];
  stockMovements: StockMovement[];
  stockCounts: StockCount[];
  
  // Engineer requests, POs, COs
  materialRequests: MaterialRequest[];
  purchaseOrders: PurchaseOrder[];
  changeOrders: ChangeOrder[];
  
  // Existing functions
  allocateMaterial: (materialId: string, quantity: number, allowNegative?: boolean) => AllocationResult;
  allocateEquipment: (equipmentId: string) => AllocationResult;
  addMaterial: (input: NewMaterialInput) => Material;
  addEquipment: (input: NewEquipmentInput) => Equipment;
  addPPE: (input: NewPPEInput) => PPE;
  getMaterialById: (id: string) => Material | undefined;
  getEquipmentById: (id: string) => Equipment | undefined;
  getPPEById: (id: string) => PPE | undefined;
  refreshInventory: () => void;
  loadFromApi: (projectUuid: string) => Promise<void>;
  
  // P0 - New functions for PPE Issuance
  issuePPE: (ppeId: string, workerId: string, workerName: string, expectedReturnDate?: string) => PPEIssuance | { error: string };
  returnPPE: (issuanceId: string, condition: "new" | "good" | "worn" | "damaged" | "missing", notes?: string) => void;
  getPPEIssuances: () => PPEIssuance[];
  getPPEByWorker: (workerId: string) => PPEIssuance[];
  
  // P0 - New functions for Stock Movements
  createMovement: (
    itemType: "material" | "equipment" | "ppe",
    itemId: string,
    movementType: MovementType,
    quantity: number,
    data?: {
      fromLocation?: string;
      toLocation?: string;
      workerId?: string;
      workerName?: string;
      authorizedBy?: string;
      notes?: string;
      arVerificationUrl?: string;
    }
  ) => StockMovement;
  getMovementsByItem: (itemId: string) => StockMovement[];
  
  // P0 - New functions for Stock Counts
  createStockCount: (
    itemId: string,
    expectedQuantity: number,
    actualQuantity: number,
    countedBy: string,
    verifiedBy?: string
  ) => void;
  getStockCounts: () => StockCount[];
  
  // P0 - New functions for Material Requests
  createMaterialRequest: (
    itemId: string,
    itemName: string,
    materialCode: string,
    quantityRequested: number,
    unit: string,
    priority: MaterialRequestPriority,
    notes: string,
    requestedBy: string,
    requestedByName: string,
    projectId: string
  ) => MaterialRequest;
  updateRequestStatus: (requestId: string, status: MaterialRequestStatus, approvedBy?: string) => void;
  getMaterialRequests: () => MaterialRequest[];
  getMaterialRequestById: (id: string) => MaterialRequest | undefined;
  linkRequestToPO: (requestId: string, poId: string) => void;
  fulfillRequest: (requestId: string) => void;

  // Custom templates for standard items library
  getCustomTemplates: () => ItemTemplate[];
  
  // P0 - New functions for Purchase Orders
  getPurchaseOrders: () => PurchaseOrder[];
  receivePurchaseOrder: (poId: string, receivedItems: { itemId: string; quantity: number }[], notes: string) => void;
  
  // P0 - New functions for Change Orders
  getChangeOrders: () => ChangeOrder[];
}

export const useInventory = create<InventoryState>((set, get) => ({
  // Existing state
  materials: getMaterials(),
  equipment: getEquipment(),
  ppe: getPPE(),
  loading: false,

  // P0 - Custom templates
  customTemplates: [],

  addCustomTemplate: (template: ItemTemplate) => {
    set((state) => ({
      customTemplates: [template, ...state.customTemplates],
    }));
  },

  removeCustomTemplate: (templateId: string) => {
    set((state) => ({
      customTemplates: state.customTemplates.filter((t) => t.id !== templateId),
    }));
  },

  getCustomTemplates: () => get().customTemplates,

  // P0 - New state initialization
  ppeIssuances: mockPPEIssuances,
  stockMovements: mockStockMovements,
  stockCounts: mockStockCounts,
  
  // Engineer requests, POs, COs
  materialRequests: mockMaterialRequests,
  purchaseOrders: getProjectPurchaseOrders(),
  changeOrders: getProjectChangeOrders(),
  
  get allItems() {
    const state = get();
    return [...state.materials, ...state.equipment, ...state.ppe];
  },
  
  allocateMaterial: (materialId: string, quantity: number, allowNegative = false) => {
    const { materials } = get();
    const materialIndex = materials.findIndex((m) => m.id === materialId);
    if (materialIndex === -1) {
      return { success: false, error: "Material not found" };
    }

    const material = materials[materialIndex];

    if (!allowNegative && material.currentStock < quantity) {
      return {
        success: false,
        error: `Insufficient stock. Available: ${material.currentStock} ${material.unit}`,
      };
    }

    const newStock = material.currentStock - quantity;
    const newStatus =
      newStock <= 0 ? "out" : newStock <= material.minStockLevel ? "low" : newStock <= material.minStockLevel * 2 ? "limited" : "good";

    const updatedMaterial: Material = {
      ...material,
      currentStock: newStock,
      status: newStatus as Material["status"],
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      materials: state.materials.map((m) => (m.id === materialId ? updatedMaterial : m)),
    }));

    return { success: true, item: updatedMaterial, allocatedQty: quantity };
  },

  addMaterial: (input: NewMaterialInput) => {
    const newMaterial: Material = {
      id: `mat-${Date.now()}`,
      name: input.name,
      type: "material",
      category: input.category,
      currentStock: -input.quantity,
      minStockLevel: 0,
      unit: input.unit,
      status: "out",
      supplier: "To be ordered",
      lastRestocked: new Date().toISOString().split("T")[0],
      reorderQty: input.quantity * 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // P0 Fields
      materialCode: input.materialCode || `MAT-${Date.now()}`,
      batchNumber: undefined,
      receivedDate: new Date().toISOString().split("T")[0],
      expiryDate: undefined,
      storageLocation: input.storageLocation || "Unassigned",
      supplierId: undefined,
      price: input.price,
    };

    set((state) => ({ materials: [...state.materials, newMaterial] }));
    return newMaterial;
  },

  addEquipment: (input: NewEquipmentInput) => {
    const newEquipment: Equipment = {
      id: `eq-${Date.now()}`,
      name: input.name,
      type: "equipment",
      category: input.category,
      condition: input.condition as Equipment["condition"],
      status: "out",
      currentStock: -1,
      minStockLevel: 0,
      unit: "unit",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      // P0 Fields
      equipmentCode: input.equipmentCode || `EQ-${Date.now()}`,
      currentLocation: input.currentLocation || "Unassigned",
      operatorAssignedId: undefined,
      operatorName: undefined,
      hoursOfOperation: 0,
      rentalCompany: undefined,
      contractStartDate: undefined,
      contractEndDate: undefined,
      supplierId: undefined,
      ownershipType: input.ownershipType || "owned",
      cost: undefined,
      price: input.price,
    };

    set((state) => ({ equipment: [...state.equipment, newEquipment] }));
    return newEquipment;
  },

  addPPE: (input: NewPPEInput) => {
    const newPPE: PPE = {
      id: `ppe-${Date.now()}`,
      name: input.name,
      type: "ppe",
      currentStock: -input.quantity,
      minStockLevel: 0,
      unit: input.unit,
      status: "out",
      supplier: "To be ordered",
      size: input.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // P0 Fields
      ppeCode: input.ppeCode || `PPE-${Date.now()}`,
      category: (input.category || "head_protection") as PPE["category"],
      expiryDate: undefined,
      safetyStandard: undefined,
      supplierId: undefined,
      price: input.price,
      assignedTo: undefined,
    };

    set((state) => ({ ppe: [...state.ppe, newPPE] }));
    return newPPE;
  },

  allocateEquipment: (equipmentId: string) => {
    const { equipment } = get();
    const equipIndex = equipment.findIndex((e) => e.id === equipmentId);
    if (equipIndex === -1) {
      return { success: false, error: "Equipment not found" };
    }

    const eq = equipment[equipIndex];
    const updatedEquipment: Equipment = {
      ...eq,
      status: "low",
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      equipment: state.equipment.map((e) => (e.id === equipmentId ? updatedEquipment : e)),
    }));

    return { success: true, item: updatedEquipment };
  },

  getMaterialById: (id: string) => get().materials.find((m) => m.id === id),
  getEquipmentById: (id: string) => get().equipment.find((e) => e.id === id),
  getPPEById: (id: string) => get().ppe.find((p) => p.id === id),

  refreshInventory: () => {
    set({
      materials: getMaterials(),
      equipment: getEquipment(),
      ppe: getPPE(),
    });
  },

  loadFromApi: async (projectUuid: string) => {
    set({ loading: true });
    try {
      let allItems: ReturnType<typeof inventoryListItemFromApi>[] = [];
      let page = 1;
      while (true) {
        const res = await inventoryService.listInventory(projectUuid, { page });
        const results = res.data?.results ?? [];
        allItems = [...allItems, ...results.map(inventoryListItemFromApi)];
        if (!res.data?.next) break;
        page++;
      }
      const materials = allItems.filter((i) => i.type === "material") as Material[];
      const equipment = allItems.filter((i) => i.type === "equipment") as Equipment[];
      const ppe = allItems.filter((i) => i.type === "ppe") as PPE[];
      set({ materials, equipment, ppe });
    } catch {
      // silently keep existing data on failure
    } finally {
      set({ loading: false });
    }
  },
  
  // ============================================================================
  // P0 - NEW FUNCTIONS FOR PPE ISSUANCE
  // ============================================================================
  issuePPE: (ppeId: string, workerId: string, workerName: string, expectedReturnDate?: string) => {
    const { ppe, ppeIssuances } = get();
    const ppeItem = ppe.find((p) => p.id === ppeId);
    
    if (!ppeItem) {
      return { error: "PPE item not found" };
    }
    
    if (ppeItem.currentStock <= 0) {
      return { error: "PPE item out of stock" };
    }
    
    // Create PPE issuance record
    const issuance: PPEIssuance = {
      id: `iss-${Date.now()}`,
      ppeId: ppeItem.id,
      ppeName: ppeItem.name,
      ppeCode: ppeItem.ppeCode,
      workerId,
      workerName,
      issueDate: new Date().toISOString().split("T")[0],
      expectedReturnDate,
      inspectionResult: "pass",
      issuedBy: "user-001", // Current user
      createdAt: new Date().toISOString(),
    };
    
    // Add to issuances
    set((state) => ({
      ppeIssuances: [...state.ppeIssuances, issuance],
    }));
    
    // Decrement PPE stock
    const updatedPPE: PPE = {
      ...ppeItem,
      currentStock: ppeItem.currentStock - 1,
      assignedTo: workerName,
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      ppe: state.ppe.map((p) => (p.id === ppeId ? updatedPPE : p)),
    }));
    
    // Create stock movement
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemType: "ppe",
      itemId: ppeItem.id,
      itemName: ppeItem.name,
      movementType: "issue",
      quantity: -1,
      workerId,
      workerName,
      authorizedBy: "user-001",
      toLocation: `Worker: ${workerName}`,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      stockMovements: [...state.stockMovements, movement],
    }));
    
    return issuance;
  },
  
  returnPPE: (issuanceId: string, condition: "new" | "good" | "worn" | "damaged" | "missing", notes?: string) => {
    const { ppeIssuances, ppe } = get();
    const issuance = ppeIssuances.find((iss) => iss.id === issuanceId);
    
    if (!issuance) {
      return;
    }
    
    // Update issuance record
    set((state) => ({
      ppeIssuances: state.ppeIssuances.map((iss) =>
        iss.id === issuanceId
          ? {
              ...iss,
              actualReturnDate: new Date().toISOString().split("T")[0],
              conditionOnReturn: condition,
              inspectionNotes: notes,
              updatedAt: new Date().toISOString(),
            }
          : iss
      ),
    }));
    
    // Increment PPE stock back
    const ppeItem = ppe.find((p) => p.id === issuance.ppeId);
    if (ppeItem) {
      const updatedPPE: PPE = {
        ...ppeItem,
        currentStock: ppeItem.currentStock + 1,
        assignedTo: undefined,
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => ({
        ppe: state.ppe.map((p) => (p.id === issuance.ppeId ? updatedPPE : p)),
      }));
    }
  },
  
  getPPEIssuances: () => {
    return get().ppeIssuances;
  },
  
  getPPEByWorker: (workerId: string) => {
    const { ppeIssuances } = get();
    return ppeIssuances.filter(
      (iss) => iss.workerId === workerId && !iss.actualReturnDate
    );
  },
  
  // ============================================================================
  // P0 - NEW FUNCTIONS FOR STOCK MOVEMENTS
  // ============================================================================
  createMovement: (
    itemType: "material" | "equipment" | "ppe",
    itemId: string,
    movementType: MovementType,
    quantity: number,
    data?: {
      fromLocation?: string;
      toLocation?: string;
      workerId?: string;
      workerName?: string;
      authorizedBy?: string;
      notes?: string;
      arVerificationUrl?: string;
    }
  ) => {
    const item = get().allItems.find((i) => i.id === itemId);
    
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemType,
      itemId,
      itemName: item?.name || "Unknown",
      movementType,
      quantity,
      fromLocation: data?.fromLocation,
      toLocation: data?.toLocation,
      workerId: data?.workerId,
      workerName: data?.workerName,
      authorizedBy: data?.authorizedBy || "user-001",
      arVerificationUrl: data?.arVerificationUrl,
      notes: data?.notes,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      stockMovements: [...state.stockMovements, movement],
    }));
    
    return movement;
  },
  
  getMovementsByItem: (itemId: string) => {
    const { stockMovements } = get();
    return stockMovements.filter((m) => m.itemId === itemId);
  },
  
  // ============================================================================
  // P0 - NEW FUNCTIONS FOR STOCK COUNTS
  // ============================================================================
  // Stock counts are now managed via the real API (inventoryService.createStockCount etc.)
  // This store method is kept as a stub for compatibility but is no longer called.
  createStockCount: (
    _itemId: string,
    _expectedQuantity: number,
    _actualQuantity: number,
    _countedBy: string,
    _verifiedBy?: string
  ) => {
    // no-op — use inventoryService directly
  },
  
  getStockCounts: () => {
    return get().stockCounts;
  },
  
  // ============================================================================
  // P0 - NEW FUNCTIONS FOR MATERIAL REQUESTS
  // ============================================================================
  createMaterialRequest: (
    itemId: string,
    itemName: string,
    materialCode: string,
    quantityRequested: number,
    unit: string,
    priority: MaterialRequestPriority,
    notes: string,
    requestedBy: string,
    requestedByName: string,
    projectId: string
  ) => {
    const newRequest: MaterialRequest = {
      id: `req-eng-${Date.now()}`,
      projectId,
      requestedBy,
      requestedByName,
      itemId,
      itemName,
      materialCode,
      quantityRequested,
      unit,
      status: "pending",
      priority,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      materialRequests: [...state.materialRequests, newRequest],
    }));
    
    return newRequest;
  },
  
  updateRequestStatus: (requestId: string, status: MaterialRequestStatus, approvedBy?: string) => {
    set((state) => ({
      materialRequests: state.materialRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status,
              approvedBy,
              updatedAt: new Date().toISOString(),
            }
          : req
      ),
    }));
  },
  
  getMaterialRequests: () => {
    return get().materialRequests;
  },
  
  getMaterialRequestById: (id: string) => {
    return get().materialRequests.find((req) => req.id === id);
  },
  
  linkRequestToPO: (requestId: string, poId: string) => {
    set((state) => ({
      materialRequests: state.materialRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              relatedPOId: poId,
              updatedAt: new Date().toISOString(),
            }
          : req
      ),
    }));
  },
  
  fulfillRequest: (requestId: string) => {
    set((state) => ({
      materialRequests: state.materialRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "delivered",
              fulfilledAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : req
      ),
    }));
  },
  
  // ============================================================================
  // P0 - NEW FUNCTIONS FOR PURCHASE ORDERS
  // ============================================================================
  getPurchaseOrders: () => {
    return get().purchaseOrders;
  },
  
  receivePurchaseOrder: (poId: string, receivedItems: { itemId: string; quantity: number }[], notes: string) => {
    const { materials, equipment, ppe, stockMovements } = get();
    
    receivedItems.forEach((received) => {
      const material = materials.find((m) => m.id === received.itemId);
      if (material) {
        const updatedMaterial: Material = {
          ...material,
          currentStock: material.currentStock + received.quantity,
          lastRestocked: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === received.itemId ? updatedMaterial : m
          ),
        }));
        
        const movement: StockMovement = {
          id: `mov-${Date.now()}-${Math.random()}`,
          itemType: "material",
          itemId: received.itemId,
          itemName: material.name,
          movementType: "receipt",
          quantity: received.quantity,
          toLocation: material.storageLocation,
          authorizedBy: "engineer-001",
          notes: notes || `Received from PO ${poId}`,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          stockMovements: [...state.stockMovements, movement],
        }));
        return;
      }
      
      const equip = equipment.find((e) => e.id === received.itemId);
      if (equip) {
        const updatedEquip: Equipment = {
          ...equip,
          currentStock: equip.currentStock + received.quantity,
          lastRestocked: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === received.itemId ? updatedEquip : e
          ),
        }));
        
        const movement: StockMovement = {
          id: `mov-${Date.now()}-${Math.random()}`,
          itemType: "equipment",
          itemId: received.itemId,
          itemName: equip.name,
          movementType: "receipt",
          quantity: received.quantity,
          toLocation: equip.currentLocation,
          authorizedBy: "engineer-001",
          notes: notes || `Received from PO ${poId}`,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          stockMovements: [...state.stockMovements, movement],
        }));
        return;
      }
      
      const ppeItem = ppe.find((p) => p.id === received.itemId);
      if (ppeItem) {
        const updatedPPE: PPE = {
          ...ppeItem,
          currentStock: ppeItem.currentStock + received.quantity,
          lastRestocked: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          ppe: state.ppe.map((p) =>
            p.id === received.itemId ? updatedPPE : p
          ),
        }));
        
        const movement: StockMovement = {
          id: `mov-${Date.now()}-${Math.random()}`,
          itemType: "ppe",
          itemId: received.itemId,
          itemName: ppeItem.name,
          movementType: "receipt",
          quantity: received.quantity,
          toLocation: ppeItem.category,
          authorizedBy: "engineer-001",
          notes: notes || `Received from PO ${poId}`,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          stockMovements: [...state.stockMovements, movement],
        }));
      }
    });
    
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === poId
          ? { ...po, status: "delivered" as const }
          : po
      ),
    }));
  },
  
  // ============================================================================
  // P0 - NEW FUNCTIONS FOR CHANGE ORDERS
  // ============================================================================
  getChangeOrders: () => {
    return get().changeOrders;
  },
}));
