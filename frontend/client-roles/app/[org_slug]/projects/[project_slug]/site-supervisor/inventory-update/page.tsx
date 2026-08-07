"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  X,
  Plus,
  Search,
  Package,
  Wrench,
  ClipboardCheck,
  Shield,
  ArrowRightLeft,
  AlertTriangle,
  Bell,
  SlidersHorizontal,
} from "lucide-react";
import type {
  Material,
  Equipment,
  PPE,
  InventoryFilters,
  InventoryItem,
  StockCount,
} from "@/lib/types/inventory";
import {
  INVENTORY_CATEGORIES,
  EQUIPMENT_CATEGORIES,
  PPE_CATEGORIES,
} from "@/lib/types/inventory";
import type { InventoryPO } from "@/lib/types/inventoryPO";
import { inventoryService } from "@/lib/services/inventoryService";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import {
  materialRequestToApi,
  materialRequestFromApi,
  materialFromApi,
  equipmentFromApi,
  ppeFromApi,
  inventoryListItemFromApi,
  MATERIAL_CATEGORY_MAP,
  EQUIPMENT_CATEGORY_MAP,
} from "@/lib/transforms/inventoryTransforms";
import { inventoryPOFromApi } from "@/lib/transforms/inventoryPOTransforms";
import { stockCountFromApi } from "@/lib/transforms/stockCountTransforms";
import type { MaterialRequest } from "@/lib/types/inventory";
import { getErrorMessage } from "@/lib/error";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/stores/authStore";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useInventory } from "@/store/inventoryStore";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useInventoryPermissions } from "@/lib/hooks/useInventoryPermissions";
import { engineerKeys } from "@/lib/queryKeys";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import CrewHeader from "../component/CrewHeader";

import {
  AlertPanel,
  AddInventoryModal,
  InventoryDetailDrawer,
  InventoryTable,
  StockCountModal,
  StockCountTable,
  StockCountDetailDrawer,
  MaterialRequestModal,
  MaterialRequestDetailDrawer,
  RequestLogTable,
  POTable,
  PODetailDrawer,
  FilteredInventoryModal,
} from "@/app/[org_slug]/projects/[project_slug]/_components/inventory";

interface InventoryUpdatePageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

export default function InventoryUpdatePage({ params }: InventoryUpdatePageProps) {
  const { org_slug, project_slug } = use(params);
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const perms = useInventoryPermissions(org_slug, project_slug);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isARScanOpen, setIsARScanOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(Material | Equipment | PPE) | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<(Material | Equipment | PPE) | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const qc = useQueryClient();

  const [filters, setFilters] = useState<InventoryFilters>({
    type: undefined,
    category: undefined,
    searchQuery: "",
    inventoryStatus: undefined,
    supplierName: "",
    isActive: undefined,
    createdAfter: "",
    createdBefore: "",
  });
  const debouncedSearch = useDebouncedValue(filters.searchQuery, 300);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const activeMoreFiltersCount = [
    filters.isActive !== undefined,
    !!filters.supplierName,
    !!filters.createdAfter,
    !!filters.createdBefore,
  ].filter(Boolean).length;

  const [activeTab, setActiveTab] = useState<"inventory" | "requests" | "purchase-orders" | "stock-counts" | "movements">("inventory");

  const [scStatusFilter, setScStatusFilter] = useState<string | undefined>(undefined);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState<StockCount | null>(null);
  const [isCountDetailOpen, setIsCountDetailOpen] = useState(false);

  const [poFilters, setPoFilters] = useState({ searchQuery: "", dateAfter: "", dateBefore: "" });
  const [poPage, setPoPage] = useState(1);
  const poPageSize = 20;

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestPrefilledItem, setRequestPrefilledItem] = useState<(Material | Equipment | PPE) | null>(null);
  const [selectedPO, setSelectedPO] = useState<InventoryPO | null>(null);
  const [isPODetailOpen, setIsPODetailOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [isRequestDetailOpen, setIsRequestDetailOpen] = useState(false);

  const [editRequest, setEditRequest] = useState<MaterialRequest | null>(null);

  const [filteredModal, setFilteredModal] = useState<{
    open: boolean;
    type: "all" | "material" | "equipment" | "ppe" | "out_of_stock" | "critically_low" | "low_stock" | "reorder" | "pending_requests";
  }>({ open: false, type: "all" });

  const [movSearch, setMovSearch] = useState("");

  // ── Queries ─────────────────────────────────────────────────────────────────

  const categoryParam = filters.category
    ? (MATERIAL_CATEGORY_MAP[filters.category] ?? EQUIPMENT_CATEGORY_MAP[filters.category] ?? filters.category)
    : undefined;

  const inventoryQuery = useQuery({
    queryKey: engineerKeys.inventory(projectUuid, {
      type: filters.type,
      category: categoryParam,
      search: debouncedSearch || undefined,
      inventoryStatus: filters.inventoryStatus,
      supplierName: filters.supplierName || undefined,
      isActive: filters.isActive,
      createdAfter: filters.createdAfter || undefined,
      createdBefore: filters.createdBefore || undefined,
    }),
    queryFn: async () => {
      const res = await inventoryService.listInventory(projectUuid, {
        item_type: filters.type,
        category: categoryParam,
        search: debouncedSearch || undefined,
        inventory_status: filters.inventoryStatus,
        supplier_name: filters.supplierName || undefined,
        is_active: filters.isActive,
        created_after: filters.createdAfter || undefined,
        created_before: filters.createdBefore || undefined,
      });
      const results = res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
      return results.map(inventoryListItemFromApi);
    },
    enabled: activeTab === "inventory" && !!projectUuid,
    placeholderData: (prev) => prev,
  });

  const summaryQuery = useQuery({
    queryKey: engineerKeys.inventorySummary(projectUuid),
    queryFn: async () => {
      const res = await inventoryService.getSummary(projectUuid);
      return res.data;
    },
    enabled: !!projectUuid,
  });

  const requestsQuery = useQuery({
    queryKey: engineerKeys.materialRequests(projectUuid),
    queryFn: async () => {
      const res = await inventoryService.listMaterialRequests(projectUuid);
      const results = res.data?.results || res.data || [];
      return Array.isArray(results) ? results.map(materialRequestFromApi) : [];
    },
    enabled: activeTab === "requests" && !!projectUuid,
    placeholderData: (prev) => prev,
  });

  const posQuery = useQuery({
    queryKey: engineerKeys.purchaseOrders(projectUuid, {
      page: poPage,
      searchQuery: poFilters.searchQuery,
      dateAfter: poFilters.dateAfter,
      dateBefore: poFilters.dateBefore,
    }),
    queryFn: async () => {
      const res = await purchaseOrderService.listPOs(projectUuid, {
        page: poPage,
        po_number: poFilters.searchQuery || undefined,
        supplier_name: poFilters.searchQuery || undefined,
        order_date_after: poFilters.dateAfter || undefined,
        order_date_before: poFilters.dateBefore || undefined,
      });
      const results = res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
      return {
        items: results.map(inventoryPOFromApi),
        count: (res.data?.count ?? results.length) as number,
      };
    },
    enabled: activeTab === "purchase-orders" && !!projectUuid,
    placeholderData: (prev) => prev,
  });

  const stockCountsQuery = useQuery({
    queryKey: engineerKeys.stockCounts(projectUuid, { status: scStatusFilter }),
    queryFn: async () => {
      const res = await inventoryService.listStockCounts(projectUuid, { status: scStatusFilter });
      const results = res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
      return results.map(stockCountFromApi);
    },
    enabled: activeTab === "stock-counts" && !!projectUuid,
    placeholderData: (prev) => prev,
  });

  const inventoryItems = inventoryQuery.data ?? [];
  const materialRequests = requestsQuery.data ?? [];
  const purchaseOrders: InventoryPO[] = posQuery.data?.items ?? [];
  const poTotalCount = posQuery.data?.count ?? 0;
  const stockCounts = stockCountsQuery.data ?? [];

  const loading = inventoryQuery.isFetching && !inventoryQuery.data;
  const requestsLoading = requestsQuery.isFetching && !requestsQuery.data;
  const poLoading = posQuery.isFetching && !posQuery.data;
  const scLoading = stockCountsQuery.isFetching && !stockCountsQuery.data;

  // ── Mutations ────────────────────────────────────────────────────────────────

  const createRequestMutation = useMutation({
    mutationFn: (data: { itemId: string; quantityRequested: number; priority: string; notes: string }) =>
      inventoryService.createMaterialRequest(
        projectUuid,
        materialRequestToApi({
          itemId: data.itemId,
          quantityRequested: data.quantityRequested,
          priority: data.priority as "low" | "medium" | "high" | "urgent",
          notes: data.notes,
        }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "material-requests"] });
      toast.success("Material request submitted");
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity_requested: string; notes: string } }) =>
      inventoryService.updateMaterialRequest(projectUuid, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "material-requests"] });
      toast.success("Request updated");
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => inventoryService.deleteMaterialRequest(projectUuid, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "material-requests"] });
      toast.success("Request deleted");
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const scActionMutation = useMutation({
    mutationFn: ({ uuid, action }: { uuid: string; action: "submit" | "verify" | "apply" | "void" }) => {
      const actions = {
        submit: inventoryService.submitStockCount.bind(inventoryService),
        verify: inventoryService.verifyStockCount.bind(inventoryService),
        apply: inventoryService.applyStockCount.bind(inventoryService),
        void: inventoryService.voidStockCount.bind(inventoryService),
      };
      return actions[action](projectUuid, uuid);
    },
    onSuccess: (res, { uuid, action }) => {
      toast.success(
        action === "apply"
          ? "Stock count applied. Inventory stock has been updated."
          : `Stock count ${action}ted successfully.`,
      );
      qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "stock-counts"] });
      if (action === "apply") {
        qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "inventory"] });
      }
      const updated = stockCountFromApi(res.data);
      if (selectedCount?.id === uuid) setSelectedCount(updated);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });

  const scActionLoadingId = scActionMutation.isPending ? (scActionMutation.variables?.uuid ?? null) : null;

  // ── Derived stats ────────────────────────────────────────────────────────────

  const lowStockItems = useMemo(
    () => inventoryItems.filter((i) => i.status === "low" || i.status === "out"),
    [inventoryItems],
  );

  const stats = useMemo(() => {
    const s = summaryQuery.data;
    const total = s?.total_items ?? inventoryItems.length;
    const materials = s?.total_materials ?? inventoryItems.filter((i) => i.type === "material").length;
    const equipment = s?.total_equipment ?? inventoryItems.filter((i) => i.type === "equipment").length;
    const ppe = s?.total_ppe ?? inventoryItems.filter((i) => i.type === "ppe").length;
    const outOfStock = s?.out_of_stock_count ?? inventoryItems.filter((i) => i.status === "out").length;
    // critically_low is a bucket the backend split out of low_stock (non-overlapping) — fold it
    // into reorderNeeded so this total doesn't silently shrink now that the buckets don't overlap.
    const criticallyLow = s?.critically_low_count ?? 0;
    const lowStock = s?.low_stock_count ?? inventoryItems.filter((i) => i.status === "low").length;
    const pendingRequests = materialRequests.filter((r) => r.status === "pending").length;
    return { total, materials, equipment, ppe, outOfStock, criticallyLow, lowStock, pendingRequests };
  }, [summaryQuery.data, inventoryItems, materialRequests]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAddItem = (_item: InventoryItem) => {
    qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "inventory"] });
    setIsAddModalOpen(false);
  };

  const handleCreateRequest = (data: {
    itemId: string; itemName: string; materialCode: string;
    unit: string; quantityRequested: number; priority: string; notes: string;
  }) => { createRequestMutation.mutate(data); };

  const handleUpdateRequest = (data: {
    itemId: string; itemName: string; materialCode: string;
    unit: string; quantityRequested: number; priority: string; notes: string;
  }) => {
    if (!editRequest?.id) return;
    updateRequestMutation.mutate({
      id: editRequest.id,
      data: { quantity_requested: String(data.quantityRequested), notes: data.notes },
    });
  };

  const handleDeleteRequest = (request: MaterialRequest) => {
    if (!request.id) return;
    if (!confirm("Are you sure you want to delete this request?")) return;
    deleteRequestMutation.mutate(request.id);
  };

  const handleViewRequest = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setIsRequestDetailOpen(true);
  };

  const handleEditRequest = (request: MaterialRequest) => {
    setEditRequest(request);
    setIsRequestModalOpen(true);
  };

  const handleViewPODetails = (po: InventoryPO) => {
    setSelectedPO(po);
    setIsPODetailOpen(true);
  };

  const handleEditItem = async (item: InventoryItem) => {
    if (!item.id) { toast.error("Cannot edit item: missing identifier."); return; }
    try {
      let fullItem: Material | Equipment | PPE;
      if (item.type === "material") {
        const res = await inventoryService.getMaterialDetail(projectUuid, item.id);
        fullItem = materialFromApi(res.data);
      } else if (item.type === "equipment") {
        const res = await inventoryService.getEquipmentDetail(projectUuid, item.id);
        fullItem = equipmentFromApi(res.data);
      } else {
        const res = await inventoryService.getPPEDetail(projectUuid, item.id);
        fullItem = ppeFromApi(res.data);
      }
      setEditingItem(fullItem);
      setIsAddModalOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReorderItem = (item: InventoryItem) => {
    setRequestPrefilledItem(item as Material | Equipment | PPE);
    setIsRequestModalOpen(true);
  };

  const handleReorderFromAlert = (item: Material | Equipment | PPE) => {
    setRequestPrefilledItem(item);
    setIsRequestModalOpen(true);
  };

  const handleRowClick = async (item: InventoryItem) => {
    if (!item.id) return;
    setIsDetailLoading(true);
    setIsDetailOpen(true);
    try {
      let fullItem: Material | Equipment | PPE;
      if (item.type === "material") {
        const res = await inventoryService.getMaterialDetail(projectUuid, item.id);
        fullItem = materialFromApi(res.data);
      } else if (item.type === "equipment") {
        const res = await inventoryService.getEquipmentDetail(projectUuid, item.id);
        fullItem = equipmentFromApi(res.data);
      } else {
        const res = await inventoryService.getPPEDetail(projectUuid, item.id);
        fullItem = ppeFromApi(res.data);
      }
      setSelectedDetailItem(fullItem);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleScAction = (uuid: string, action: "submit" | "verify" | "apply" | "void") => {
    scActionMutation.mutate({ uuid, action });
  };

  return (
    <>
      <CrewHeader
        title="Inventory Management"
        project={project?.name || project_slug}
      />

      <div className="space-y-6 pb-20 p-4 md:p-8 pt-8">

        {/* Stats Grid — 2 rows of 4 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Package} value={stats.total} label="Total Items" iconColor="text-gray-700" onClick={() => setFilteredModal({ open: true, type: "all" })} />
          <StatCard icon={Package} value={stats.materials} label="Materials" iconColor="text-blue-600" onClick={() => setFilteredModal({ open: true, type: "material" })} />
          <StatCard icon={Wrench} value={stats.equipment} label="Equipment" iconColor="text-amber-600" onClick={() => setFilteredModal({ open: true, type: "equipment" })} />
          <StatCard icon={Shield} value={stats.ppe} label="PPE Items" iconColor="text-emerald-600" onClick={() => setFilteredModal({ open: true, type: "ppe" })} />
          <StatCard icon={X} value={stats.outOfStock} label="Out of Stock" iconColor="text-red-600" onClick={() => setFilteredModal({ open: true, type: "out_of_stock" })} />
          <StatCard icon={AlertTriangle} value={stats.criticallyLow} label="Critically Low" iconColor="text-orange-600" onClick={() => setFilteredModal({ open: true, type: "critically_low" })} />
          <StatCard icon={ClipboardCheck} value={stats.lowStock} label="Low Stock" iconColor="text-amber-600" onClick={() => setFilteredModal({ open: true, type: "low_stock" })} />
          <StatCard icon={Bell} value={stats.pendingRequests} label="Pending Requests" iconColor="text-purple-600" onClick={() => setFilteredModal({ open: true, type: "pending_requests" })} />
        </div>

        <AlertPanel items={lowStockItems} onReorder={handleReorderFromAlert} />

        {/* Tab Navigation */}
        <div className="bg-gray-100 rounded-xl p-1">
          <nav className="flex gap-1">
            <TabButton active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")} icon={<Package className="w-4 h-4" />} label="Inventory" />
            <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")} icon={<ClipboardCheck className="w-4 h-4" />} label="Requests" count={materialRequests.filter((r) => r.status === "pending").length} />
            {perms.canViewPO && (
              <TabButton active={activeTab === "purchase-orders"} onClick={() => setActiveTab("purchase-orders")} icon={<ArrowRightLeft className="w-4 h-4" />} label="Purchase Orders" />
            )}
            {perms.canDoStockCount && (
              <TabButton active={activeTab === "stock-counts"} onClick={() => setActiveTab("stock-counts")} icon={<ClipboardCheck className="w-4 h-4" />} label="Stock Counts" count={stockCounts.filter((c) => c.status === "submitted").length || undefined} />
            )}
            <TabButton active={activeTab === "movements"} onClick={() => setActiveTab("movements")} icon={<ArrowRightLeft className="w-4 h-4" />} label="Movements" count={useInventory.getState().stockMovements.length || undefined} />
          </nav>
        </div>

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex gap-2">
                <FilterButton active={!filters.type} onClick={() => setFilters({ ...filters, type: undefined })}>All</FilterButton>
                <FilterButton active={filters.type === "material"} onClick={() => setFilters({ ...filters, type: "material" })}>Materials</FilterButton>
                <FilterButton active={filters.type === "equipment"} onClick={() => setFilters({ ...filters, type: "equipment" })}>Equipment</FilterButton>
                <FilterButton active={filters.type === "ppe"} onClick={() => setFilters({ ...filters, type: "ppe" })}>PPE</FilterButton>
              </div>
            </div>

            {filters.type && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 mr-2">Category:</span>
                <FilterButton active={!filters.category} onClick={() => setFilters({ ...filters, category: undefined })}>All</FilterButton>
                {filters.type === "material" && INVENTORY_CATEGORIES.map((cat) => (
                  <FilterButton key={cat} active={filters.category === cat} onClick={() => setFilters({ ...filters, category: cat })}>{cat}</FilterButton>
                ))}
                {filters.type === "equipment" && EQUIPMENT_CATEGORIES.map((cat) => (
                  <FilterButton key={cat} active={filters.category === cat} onClick={() => setFilters({ ...filters, category: cat })}>{cat}</FilterButton>
                ))}
                {filters.type === "ppe" && PPE_CATEGORIES.map((cat) => (
                  <FilterButton key={cat} active={filters.category === cat} onClick={() => setFilters({ ...filters, category: cat })}>{cat.replace('_', ' ')}</FilterButton>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                {perms.canAddInventory && (
                  <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm">
                    <Plus className="w-4 h-4" />Add Inventory
                  </button>
                )}
                {perms.canDoStockCount && (
                  <button onClick={() => setIsCountModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap shadow-sm">
                    <ClipboardCheck className="w-4 h-4" />Stock Count
                  </button>
                )}
                <button onClick={() => setIsARScanOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap shadow-sm">
                  <Camera className="w-4 h-4" />AR Scan
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowMoreFilters((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap shadow-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    More Filters
                    {activeMoreFiltersCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold bg-blue-600 text-white rounded-full">
                        {activeMoreFiltersCount}
                      </span>
                    )}
                  </button>

                  {showMoreFilters && (
                    <div className="absolute z-20 top-full mt-2 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Active status</p>
                        <div className="flex gap-2">
                          <FilterButton active={filters.isActive === undefined} onClick={() => setFilters({ ...filters, isActive: undefined })}>All</FilterButton>
                          <FilterButton active={filters.isActive === true} onClick={() => setFilters({ ...filters, isActive: true })}>Active</FilterButton>
                          <FilterButton active={filters.isActive === false} onClick={() => setFilters({ ...filters, isActive: false })}>Inactive</FilterButton>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Supplier name</p>
                        <input
                          type="text"
                          placeholder="Supplier name..."
                          value={filters.supplierName}
                          onChange={(e) => setFilters({ ...filters, supplierName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Created date range</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={filters.createdAfter}
                            onChange={(e) => setFilters({ ...filters, createdAfter: e.target.value })}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <span className="text-xs text-gray-400">to</span>
                          <input
                            type="date"
                            value={filters.createdBefore}
                            onChange={(e) => setFilters({ ...filters, createdBefore: e.target.value })}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      {activeMoreFiltersCount > 0 && (
                        <button
                          onClick={() => setFilters({ ...filters, isActive: undefined, supplierName: "", createdAfter: "", createdBefore: "" })}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <InventoryTable
                items={inventoryItems}
                onEdit={handleEditItem}
                onDelete={() => {}}
                onReorder={handleReorderItem}
                onRowClick={handleRowClick}
                canEdit={perms.canEditInventory}
                canDelete={perms.canDeleteInventory}
              />
            )}
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Material Requests</h3>
                <p className="text-sm text-gray-500 mt-1">Submit and track material requests for this project</p>
              </div>
              {perms.canMakeRequest && (
                <button onClick={() => setIsRequestModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" />New Request
                </button>
              )}
            </div>
            {requestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <RequestLogTable
                requests={materialRequests}
                onDelete={handleDeleteRequest}
                onEdit={handleEditRequest}
                onViewDetails={handleViewRequest}
                canApprove={perms.canApproveRequest}
                currentUserId={user?.uuid}
              />
            )}
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === "purchase-orders" && perms.canViewPO && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
                <p className="text-sm text-gray-500 mt-1">View and receive incoming purchase orders</p>
              </div>
            </div>
            {poLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <POTable
                purchaseOrders={purchaseOrders}
                projectId={projectUuid}
                canReceiveGoods={perms.canReceiveGoods}
                onStatusChange={() => qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "purchase-orders"] })}
                onViewDetails={handleViewPODetails}
                filters={poFilters}
                onFiltersChange={setPoFilters}
                page={poPage}
                totalCount={poTotalCount}
                pageSize={poPageSize}
                onPageChange={setPoPage}
              />
            )}
          </div>
        )}

        {/* Stock Counts Tab */}
        {activeTab === "stock-counts" && perms.canDoStockCount && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Stock Counts</h3>
                <p className="text-sm text-gray-500 mt-1">Record physical inventory counts on site</p>
              </div>
              <button onClick={() => setIsCountModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />New Count
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["", "draft", "submitted", "verified", "applied", "voided"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScStatusFilter(s === "" ? undefined : s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${(scStatusFilter ?? "") === s ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {scLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <StockCountTable
                counts={stockCounts}
                canApprove={perms.canApproveStockCount}
                actionLoadingId={scActionLoadingId}
                onSubmit={(id) => handleScAction(id, "submit")}
                onVerify={(id) => handleScAction(id, "verify")}
                onApply={(id) => handleScAction(id, "apply")}
                onVoid={(id) => handleScAction(id, "void")}
                onView={(count) => { setSelectedCount(count); setIsCountDetailOpen(true); }}
              />
            )}
          </div>
        )}

        {/* Movements Tab */}
        {activeTab === "movements" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Stock Movement Log</h3>
                <p className="text-sm text-gray-500 mt-1">Audit trail of all stock movements across the project</p>
              </div>
            </div>
            {(() => {
              const movements = useInventory.getState().stockMovements;
              const filtered = movSearch
                ? movements.filter((m) =>
                    m.itemName.toLowerCase().includes(movSearch.toLowerCase()) ||
                    m.movementType.includes(movSearch.toLowerCase()) ||
                    (m.notes && m.notes.toLowerCase().includes(movSearch.toLowerCase())) ||
                    (m.workerName && m.workerName.toLowerCase().includes(movSearch.toLowerCase())) ||
                    (m.authorizedBy && m.authorizedBy.toLowerCase().includes(movSearch.toLowerCase()))
                  )
                : movements;
              return (
                <>
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={movSearch} onChange={(e) => setMovSearch(e.target.value)} placeholder="Search movements..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                  </div>
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <ArrowRightLeft size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="font-medium text-gray-500">No movements found</p>
                      <p className="text-sm text-gray-400 mt-1">{movSearch ? "Try a different search" : "No stock movements recorded yet"}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left py-3 px-4 w-12 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100/50">#</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Item</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Qty</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Reference</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((mov, idx) => {
                            const TypeIcon = mov.itemType === "material" ? Package : mov.itemType === "equipment" ? Wrench : Shield;
                            const isIn = mov.quantity > 0;
                            return (
                              <tr key={mov.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-sm font-semibold text-gray-500 text-center w-12 bg-gray-50/50">{idx + 1}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                      <TypeIcon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-[#021422]">{mov.itemName}</p>
                                      <p className="text-xs text-gray-500">{mov.itemType.charAt(0).toUpperCase() + mov.itemType.slice(1)}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIn ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                    {isIn ? "In" : "Out"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-medium">
                                  <span className={isIn ? "text-emerald-600" : "text-red-600"}>{isIn ? `+${mov.quantity}` : mov.quantity}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-600 text-xs">{mov.authorizedBy || mov.notes || "—"}</td>
                                <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                                  {new Date(mov.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Modals & Drawers */}
        <AnimatePresence>
          {isAddModalOpen && (
            <AddInventoryModal
              isOpen={isAddModalOpen}
              onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }}
              onAdd={handleAddItem}
              editItem={editingItem}
              inventoryItems={inventoryItems}
              projectUuid={projectUuid}
            />
          )}
        </AnimatePresence>

        {perms.canDoStockCount && (
          <StockCountModal
            isOpen={isCountModalOpen}
            onClose={() => setIsCountModalOpen(false)}
            onCreated={async () => {
              await qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "stock-counts"] });
              setActiveTab("stock-counts");
            }}
            allItems={inventoryItems}
            projectUuid={projectUuid}
          />
        )}

        <StockCountDetailDrawer
          count={selectedCount}
          isOpen={isCountDetailOpen}
          onClose={() => setIsCountDetailOpen(false)}
          canApprove={perms.canApproveStockCount}
          actionLoadingId={scActionLoadingId}
          onSubmit={(id) => handleScAction(id, "submit")}
          onVerify={(id) => handleScAction(id, "verify")}
          onApply={(id) => handleScAction(id, "apply")}
          onVoid={(id) => handleScAction(id, "void")}
        />

        <AnimatePresence>
          {isARScanOpen && (
            <div className="fixed inset-0 z-[60] bg-[#F4F6F8] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl aspect-video relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
              >
                <button onClick={() => setIsARScanOpen(false)} className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-white/20 p-2 rounded-full text-[#021422] transition-colors">
                  <X size={24} />
                </button>
                <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
                  <div className="relative w-[60%] h-[60%] border-2 border-blue-400 rounded-lg flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1" />
                    <Camera size={64} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">Camera Feed Simulation</p>
                    <p className="text-gray-400 text-sm mt-1">Scanning: T-25 Rebar</p>
                  </div>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#021422]">T-25 Rebar</h3>
                        <p className="text-gray-500 text-sm">Block B, South Yard</p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">In Stock</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase">Qty Detected:</p>
                        <p className="text-[#021422] font-bold text-lg">150 pcs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs font-bold uppercase">Allocated to:</p>
                        <p className="text-[#021422] font-bold text-lg">Pile Cap #5</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#021422] text-white py-3 rounded-lg font-bold text-sm hover:bg-gray-900 shadow-lg">Check-Out 50 pcs</button>
                    <button className="flex-1 bg-white text-[#021422] py-3 rounded-lg font-bold text-sm hover:bg-gray-50 shadow-md">Report Damage</button>
                    <button className="flex-1 bg-white text-[#021422] py-3 rounded-lg font-bold text-sm hover:bg-gray-50 shadow-md text-nowrap px-3">Advice Site Manager</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <FilteredInventoryModal
          isOpen={filteredModal.open}
          onClose={() => setFilteredModal({ open: false, type: "all" })}
          filterType={filteredModal.type}
          items={inventoryItems}
          requests={materialRequests}
          onRowClick={(item) => { setFilteredModal({ open: false, type: "all" }); handleRowClick(item); }}
          onViewRequest={(req) => { setFilteredModal({ open: false, type: "all" }); handleViewRequest(req); }}
        />

        <InventoryDetailDrawer
          isOpen={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedDetailItem(null); }}
          item={selectedDetailItem}
          onEdit={perms.canEditInventory ? () => { setIsDetailOpen(false); handleEditItem(selectedDetailItem!); } : undefined}
          loading={isDetailLoading}
        />

        <AnimatePresence>
          {isRequestModalOpen && (
            <MaterialRequestModal
              isOpen={isRequestModalOpen}
              onClose={() => { setIsRequestModalOpen(false); setRequestPrefilledItem(null); setEditRequest(null); }}
              onSubmit={editRequest ? handleUpdateRequest : handleCreateRequest}
              inventoryItems={inventoryItems}
              prefilledItem={requestPrefilledItem}
              editRequest={editRequest}
            />
          )}
        </AnimatePresence>

        <MaterialRequestDetailDrawer
          isOpen={isRequestDetailOpen}
          onClose={() => { setIsRequestDetailOpen(false); setSelectedRequest(null); }}
          request={selectedRequest}
        />

        <PODetailDrawer
          isOpen={isPODetailOpen}
          onClose={() => { setIsPODetailOpen(false); setSelectedPO(null); }}
          po={selectedPO}
          projectId={projectUuid}
          userRole={project?.role ?? ""}
          orgSlug={org_slug}
          projectSlug={project_slug}
          inventoryItems={inventoryItems.map((i) => ({ id: i.id, name: i.name, type: i.type, unit: i.unit || "pcs" }))}
          onStatusChange={() => qc.invalidateQueries({ queryKey: ["engineer", projectUuid, "purchase-orders"] })}
        />

      </div>
    </>
  );
}

function TabButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex-1 justify-center ${active ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-white/60"}`}>
      {icon}{label}
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"}`}>{count}</span>
      )}
    </button>
  );
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? "bg-[#021422] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, value, label, iconColor = "text-gray-700", onClick }: { icon: any; value: number; label: string; iconColor?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 text-left w-full ${onClick ? "cursor-pointer active:scale-[0.98]" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs font-medium text-gray-500">{label}</p>
        </div>
      </div>
    </button>
  );
}
