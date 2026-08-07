"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Wrench, Shield, Edit2 } from "lucide-react";
import type { Material, Equipment, PPE } from "@/lib/types/inventory";
import InventoryDetailContent from "./InventoryDetailContent";

interface InventoryDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: (Material | Equipment | PPE) | null;
  onEdit?: (item: Material | Equipment | PPE) => void;
  loading?: boolean;
}

const typeConfig = {
  material: {
    icon: Package,
    label: "Material",
    heroBg: "from-blue-600 to-blue-700",
    iconBg: "bg-blue-500/30",
    badge: "bg-blue-500/20 text-blue-100 border border-blue-400/30",
  },
  equipment: {
    icon: Wrench,
    label: "Equipment",
    heroBg: "from-amber-600 to-amber-700",
    iconBg: "bg-amber-500/30",
    badge: "bg-amber-500/20 text-amber-100 border border-amber-400/30",
  },
  ppe: {
    icon: Shield,
    label: "PPE",
    heroBg: "from-emerald-600 to-emerald-700",
    iconBg: "bg-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30",
  },
};

function getCodeLabel(item: Material | Equipment | PPE): string {
  if (item.type === "material") return (item as Material).materialCode || "";
  if (item.type === "equipment") return (item as Equipment).equipmentCode || "";
  return (item as PPE).ppeCode || "";
}

export default function InventoryDetailDrawer({
  isOpen,
  onClose,
  item,
  onEdit,
  loading,
}: InventoryDetailDrawerProps) {
  if (!isOpen) return null;

  const typeInfo = item ? typeConfig[item.type] : null;
  const TypeIcon = typeInfo?.icon || Package;
  const code = item ? getCodeLabel(item) : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-[80] shadow-2xl flex flex-col"
          >
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading item details…</p>
              </div>
            ) : !item ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                No item selected
              </div>
            ) : (
              <>
                {/* Hero Header */}
                <div className={`relative flex-shrink-0 bg-gradient-to-br ${typeInfo?.heroBg} px-5 pt-4 pb-5`}>
                  {/* Top controls */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeInfo?.badge}`}>
                      <TypeIcon className="w-3 h-3" />
                      {typeInfo?.label}
                    </span>
                    <button
                      onClick={onClose}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item identity */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${typeInfo?.iconBg} flex items-center justify-center`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-white leading-tight truncate">
                          {item.name}
                        </h2>
                        {code && (
                          <p className="text-xs text-white/70 font-mono mt-0.5">{code}</p>
                        )}
                      </div>
                    </div>

                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-lg border border-white/20 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Curved bottom edge */}
                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-white rounded-t-xl" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-white">
                  <InventoryDetailContent item={item} />
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
