"use client";

import {
  Package,
  Wrench,
  Shield,
  MapPin,
  Calendar,
  DollarSign,
  User,
  FileText,
  Clock,
  Tag,
  BarChart3,
  Building2,
  HardHat,
  Gauge,
  Truck,
  ClipboardList,
  CheckCircle2,
  WrenchIcon,
  ImageIcon,
} from "lucide-react";
import type { Material, Equipment, PPE } from "@/lib/types/inventory";
import {
  EQUIPMENT_STATUS_LABELS,
  PPE_STATUS_LABELS,
} from "@/lib/types/inventory";

interface InventoryDetailContentProps {
  item: Material | Equipment | PPE;
}

// ─── Helpers ──────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return "—";
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Sub-components ───────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  accentColor = "bg-gray-500",
  children,
}: {
  title: string;
  icon: React.ElementType;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className={`w-6 h-6 rounded-md ${accentColor} flex items-center justify-center`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-4">{children}</div>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    good: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Good Stock" },
    low: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Low Stock" },
    out: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Out of Stock" },
    operational: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Operational" },
    idle: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Idle" },
    under_repair: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Under Repair" },
    scrapped: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Scrapped" },
    excellent: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Excellent" },
  };

  const cfg = map[status] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  sub,
  variant = "default",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  variant?: "default" | "good" | "warning" | "danger";
}) {
  const variants = {
    default: "bg-gray-50 border-gray-200",
    good: "bg-emerald-50 border-emerald-200",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
  };
  const textVariants = {
    default: "text-gray-900",
    good: "text-emerald-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${variants[variant]}`}>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold leading-tight ${textVariants[variant]}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

function ItemImage({ imageUrl, itemName }: { imageUrl?: string; itemName: string }) {
  if (!imageUrl) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="w-6 h-6 rounded-md bg-gray-500 flex items-center justify-center">
          <ImageIcon className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Item Image</h3>
      </div>
      <div className="p-4">
        <div className="relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
          <img
            src={imageUrl}
            alt={itemName}
            className="w-full h-auto max-h-64 object-contain"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              const fallback = el.parentElement?.querySelector(".image-fallback") as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div className="image-fallback hidden items-center justify-center py-12 text-gray-400">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">Image unavailable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stock Overview (shared) ──────────────────────────────

function StockOverview({ item }: { item: Material | Equipment | PPE }) {
  const stockVariant =
    item.status === "good" ? "good" : item.status === "low" ? "warning" : "danger";

  const statusBg =
    stockVariant === "good"
      ? "bg-emerald-50 border-emerald-200"
      : stockVariant === "warning"
      ? "bg-amber-50 border-amber-200"
      : "bg-red-50 border-red-200";

  const showMinLevel = item.type !== "equipment";

  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricCard
        label="Current Stock"
        value={item.currentStock}
        sub={item.unit}
        variant={stockVariant}
      />
      {showMinLevel ? (
        <MetricCard
          label="Min Level"
          value={item.minStockLevel}
          sub={item.unit}
        />
      ) : null}
      <div className={`rounded-lg border px-3 py-2.5 flex flex-col justify-between ${statusBg}`}>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
        <StatusPill status={item.status} />
      </div>
    </div>
  );
}

function TimestampRow({ createdAt, updatedAt }: { createdAt?: string; updatedAt?: string }) {
  return (
    <div className="flex items-center gap-5 text-xs text-gray-400 pt-1 border-t border-gray-100">
      <span className="flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        Created: <span className="font-medium text-gray-500">{formatDate(createdAt)}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        Updated: <span className="font-medium text-gray-500">{formatDate(updatedAt)}</span>
      </span>
    </div>
  );
}

// ─── Material ─────────────────────────────────────────────

function MaterialContent({ item }: { item: Material }) {
  return (
    <div className="space-y-3 p-4">
      <SectionCard title="Stock Overview" icon={BarChart3} accentColor="bg-blue-500">
        <StockOverview item={item} />
      </SectionCard>

      <ItemImage imageUrl={item.imageUrl} itemName={item.name} />

      <SectionCard title="Identification" icon={Tag} accentColor="bg-indigo-500">
        <FieldGrid>
          <Field label="Material Code" value={<span className="font-mono">{item.materialCode || "—"}</span>} />
          <Field label="Category" value={item.category} />
          {item.batchNumber && <Field label="Batch Number" value={item.batchNumber} />}
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Supplier & Location" icon={Building2} accentColor="bg-violet-500">
        <FieldGrid>
          <Field label="Supplier" value={item.supplier} />
          <Field label="Manufacturer" value={item.manufacturer} />
          <Field label="Storage Location" value={item.storageLocation} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Dates & Pricing" icon={Calendar} accentColor="bg-teal-500">
        <FieldGrid>
          <Field label="Received Date" value={formatDate(item.receivedDate)} />
          <Field label="Expiry Date" value={formatDate(item.expiryDate)} />
          <Field label="Unit Price" value={formatCurrency(item.price)} />
          <Field label="Reorder Quantity" value={item.reorderQty ? `${item.reorderQty} ${item.unit}` : "—"} />
        </FieldGrid>
      </SectionCard>

      {item.notes && (
        <SectionCard title="Notes" icon={FileText} accentColor="bg-gray-500">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-snug">{item.notes}</p>
        </SectionCard>
      )}

      <TimestampRow createdAt={item.createdAt} updatedAt={item.updatedAt} />
    </div>
  );
}

// ─── Equipment ────────────────────────────────────────────

function EquipmentContent({ item }: { item: Equipment }) {
  return (
    <div className="space-y-3 p-4">
      <SectionCard title="Stock Overview" icon={BarChart3} accentColor="bg-amber-500">
        <StockOverview item={item} />
      </SectionCard>

      <ItemImage imageUrl={item.imageUrl} itemName={item.name} />

      <SectionCard title="Identification" icon={Tag} accentColor="bg-indigo-500">
        <FieldGrid>
          <Field label="Equipment Code" value={<span className="font-mono">{item.equipmentCode || "—"}</span>} />
          <Field label="Category" value={item.category} />
          {item.serialNumber && <Field label="Serial Number" value={<span className="font-mono">{item.serialNumber}</span>} />}
          {item.manufacturer && <Field label="Manufacturer" value={item.manufacturer} />}
          {item.model && <Field label="Model" value={item.model} />}
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Condition & Status" icon={Gauge} accentColor="bg-orange-500">
        <FieldGrid>
          <Field label="Condition" value={<StatusPill status={item.condition} />} />
          {item.equipmentStatus && (
            <Field label="Equipment Status" value={<StatusPill status={item.equipmentStatus} />} />
          )}
          {item.hoursOfOperation !== undefined && (
            <Field label="Hours of Operation" value={`${item.hoursOfOperation.toLocaleString()} hrs`} />
          )}
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Location & Operator" icon={MapPin} accentColor="bg-cyan-500">
        <FieldGrid>
          <Field label="Current Location" value={item.currentLocation} />
          {item.operatorAssignedId && (
            <Field label="Assigned Operator" value={item.operatorName || item.operatorAssignedId} />
          )}
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Ownership" icon={Truck} accentColor="bg-violet-500">
        <FieldGrid>
          <Field
            label="Ownership Type"
            value={
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.ownershipType === "rented" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
          {item.ownershipType === "rented" ? "Rented" : item.ownershipType === "leased" ? "Leased" : "Owned"}
              </span>
            }
          />
          {item.rentalCompany && <Field label="Rental Company" value={item.rentalCompany} />}
          {item.cost !== undefined && <Field label={item.ownershipType === "rented" ? "Rental Cost / day" : item.ownershipType === "leased" ? "Lease Cost / day" : "Cost"} value={formatCurrency(item.cost)} />}
          {item.contractStartDate && <Field label="Contract Start" value={formatDate(item.contractStartDate)} />}
          {item.contractEndDate && <Field label="Contract End" value={formatDate(item.contractEndDate)} />}
        </FieldGrid>
      </SectionCard>

      {(item.lastMaintenance || item.nextMaintenance || item.lastInspectionDate) && (
        <SectionCard title="Maintenance & Inspection" icon={WrenchIcon} accentColor="bg-rose-500">
          <FieldGrid>
            {item.lastMaintenance && <Field label="Last Maintenance" value={formatDate(item.lastMaintenance)} />}
            {item.nextMaintenance && <Field label="Next Maintenance" value={formatDate(item.nextMaintenance)} />}
            {item.lastInspectionDate && <Field label="Last Inspection" value={formatDate(item.lastInspectionDate)} />}
            {item.fuelConsumptionRate !== undefined && (
              <Field label="Fuel Consumption" value={`${item.fuelConsumptionRate} L/hr`} />
            )}
          </FieldGrid>
        </SectionCard>
      )}

      {(item.insurancePolicyNumber || item.insuranceExpiryDate) && (
        <SectionCard title="Insurance" icon={Shield} accentColor="bg-teal-500">
          <FieldGrid>
            {item.insurancePolicyNumber && (
              <Field label="Policy Number" value={<span className="font-mono">{item.insurancePolicyNumber}</span>} />
            )}
            {item.insuranceExpiryDate && <Field label="Expiry Date" value={formatDate(item.insuranceExpiryDate)} />}
          </FieldGrid>
        </SectionCard>
      )}

      {item.notes && (
        <SectionCard title="Notes" icon={FileText} accentColor="bg-gray-500">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-snug">{item.notes}</p>
        </SectionCard>
      )}

      <TimestampRow createdAt={item.createdAt} updatedAt={item.updatedAt} />
    </div>
  );
}

// ─── PPE ──────────────────────────────────────────────────

function PPEContent({ item }: { item: PPE }) {
  return (
    <div className="space-y-3 p-4">
      <SectionCard title="Stock Overview" icon={BarChart3} accentColor="bg-emerald-500">
        <StockOverview item={item} />
      </SectionCard>

      <ItemImage imageUrl={item.imageUrl} itemName={item.name} />

      <SectionCard title="Identification" icon={Tag} accentColor="bg-indigo-500">
        <FieldGrid>
          <Field label="PPE Code" value={<span className="font-mono">{item.ppeCode || "—"}</span>} />
          <Field
            label="Category"
            value={item.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          />
          {item.size && (
            <Field label="Size" value={<span className="uppercase font-semibold">{item.size}</span>} />
          )}
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Safety & Compliance" icon={Shield} accentColor="bg-rose-500">
        <FieldGrid>
          {item.safetyStandard && <Field label="Safety Standard" value={item.safetyStandard} />}
          {item.expiryDate && <Field label="Expiry Date" value={formatDate(item.expiryDate)} />}
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Supplier & Location" icon={Building2} accentColor="bg-violet-500">
        <FieldGrid>
          <Field label="Supplier" value={item.supplier} />
          <Field label="Storage Location" value={item.storageLocation} />
        </FieldGrid>
      </SectionCard>

      <SectionCard title="Pricing" icon={DollarSign} accentColor="bg-teal-500">
        <FieldGrid>
          <Field label="Unit Price" value={formatCurrency(item.price)} />
        </FieldGrid>
      </SectionCard>

      {item.notes && (
        <SectionCard title="Notes" icon={FileText} accentColor="bg-gray-500">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-snug">{item.notes}</p>
        </SectionCard>
      )}

      <TimestampRow createdAt={item.createdAt} updatedAt={item.updatedAt} />
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────

export default function InventoryDetailContent({ item }: InventoryDetailContentProps) {
  if (item.type === "material") return <MaterialContent item={item} />;
  if (item.type === "equipment") return <EquipmentContent item={item} />;
  return <PPEContent item={item} />;
}
