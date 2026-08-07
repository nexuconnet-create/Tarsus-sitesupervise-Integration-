"use client";

import { useState } from "react";
import {
  Package,
  Wrench,
  HardHat,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import type {
  Task,
  Crew,
  TaskResources,
  MaterialResource,
  EquipmentResource,
  PPEResource,
  ManpowerResource,
} from "../types";

interface CrewResourcesTabProps {
  task: Task;
}

const CrewResourcesTab = ({ task }: CrewResourcesTabProps) => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const resources = task.resources || {
    materials: [],
    equipment: [],
    ppe: [],
    manpower: [],
  };

  // Get all crews assigned to this task
  const crews: Crew[] = task.crews || [];

  const toggleSection = (crewId: string, section: string) => {
    const key = `${crewId}-${section}`;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isExpanded = (crewId: string, section: string) => {
    const key = `${crewId}-${section}`;
    return expandedSections[key] !== false; // Default to expanded
  };

  const getMaterialStatusIcon = (status: MaterialResource["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 size={14} className="text-green-500" />;
      case "in_transit":
        return <Clock size={14} className="text-blue-500" />;
      case "pending":
        return <Clock size={14} className="text-yellow-500" />;
      case "low_stock":
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getMaterialStatusStyle = (status: MaterialResource["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "in_transit":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "low_stock":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getEquipmentStatusStyle = (status: EquipmentResource["status"]) => {
    switch (status) {
      case "on_site":
        return "bg-green-100 text-green-700";
      case "off_site":
        return "bg-gray-100 text-gray-700";
      case "maintenance":
        return "bg-yellow-100 text-yellow-700";
      case "reserved":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (crews.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Users size={48} className="mx-auto mb-3 text-gray-300" />
        <p>No crews assigned to this task</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Global Resources Summary */}
{(resources.materials.length > 0 ||
  resources.equipment.length > 0 ||
  (resources.ppe?.length ?? 0) > 0 ||
  resources.manpower.length > 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-[#021422] mb-3">Resource Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#021422]">
                {resources.materials.length}
              </p>
              <p className="text-xs text-gray-500">Materials</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#021422]">
                {resources.equipment.length}
              </p>
              <p className="text-xs text-gray-500">Equipment</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#021422]">
                {resources.ppe?.length || 0}
              </p>
              <p className="text-xs text-gray-500">PPE Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#021422]">
                {resources.manpower.length}
              </p>
              <p className="text-xs text-gray-500">Manpower</p>
            </div>
          </div>
        </div>
      )}

      {/* Resources grouped by Crew */}
      {crews.map((crew) => (
        <div
          key={crew.id}
          className="border border-gray-200 rounded-xl overflow-hidden"
        >
          <div className="p-4 space-y-4">
            {/* Materials for this crew */}
            {resources.materials.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(crew.id, "materials")}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-[#021422]" />
                    <span className="font-semibold text-sm text-[#021422]">
                      Materials
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                      {resources.materials.length}
                    </span>
                  </div>
                  {isExpanded(crew.id, "materials") ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>

                {isExpanded(crew.id, "materials") && (
                  <div className="p-3">
                    <div className="space-y-2">
                      {resources.materials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-[#021422]">
                                {material.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getMaterialStatusStyle(
                                  material.status
                                )}`}
                              >
                                {material.status.replace("_", " ")}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {material.quantity} {material.unit}
                              {material.eta && ` • ETA: ${material.eta}`}
                            </div>
                          </div>
                          {getMaterialStatusIcon(material.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Equipment for this crew */}
            {resources.equipment.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(crew.id, "equipment")}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Wrench size={18} className="text-[#021422]" />
                    <span className="font-semibold text-sm text-[#021422]">
                      Equipment
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                      {resources.equipment.length}
                    </span>
                  </div>
                  {isExpanded(crew.id, "equipment") ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>

                {isExpanded(crew.id, "equipment") && (
                  <div className="p-3">
                    <div className="space-y-2">
                      {resources.equipment.map((equipment) => (
                        <div
                          key={equipment.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-[#021422]">
                                {equipment.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getEquipmentStatusStyle(
                                  equipment.status
                                )}`}
                              >
                                {equipment.status.replace("_", " ")}
                              </span>
                            </div>
                            {equipment.location && (
                              <div className="text-xs text-gray-500">
                                Location: {equipment.location}
                              </div>
                            )}
                            {equipment.operator && (
                              <div className="text-xs text-gray-500">
                                Operator: {equipment.operator}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PPE for this crew */}
            {resources.ppe && resources.ppe.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(crew.id, "ppe")}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HardHat size={18} className="text-[#021422]" />
                    <span className="font-semibold text-sm text-[#021422]">
                      PPE
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                      {resources.ppe.length}
                    </span>
                  </div>
                  {isExpanded(crew.id, "ppe") ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>

                {isExpanded(crew.id, "ppe") && (
                  <div className="p-3">
                    <div className="space-y-2">
                      {resources.ppe.map((ppe) => (
                        <div
                          key={ppe.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-[#021422]">
                                {ppe.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getEquipmentStatusStyle(
                                  ppe.status
                                )}`}
                              >
                                {ppe.status.replace("_", " ")}
                              </span>
                            </div>
                            {ppe.size && (
                              <div className="text-xs text-gray-500">
                                Size: {ppe.size}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manpower for this crew */}
            {resources.manpower.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(crew.id, "manpower")}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-[#021422]" />
                    <span className="font-semibold text-sm text-[#021422]">
                      Manpower
                    </span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                      {resources.manpower.length}
                    </span>
                  </div>
                  {isExpanded(crew.id, "manpower") ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </button>

            {isExpanded(crew.id, "manpower") && (
              <div className="p-3">
                {/* Crew Info - Shows at top of Manpower section with light background */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#021422] flex items-center justify-center text-white font-bold">
                    {crew.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#021422]">{crew.name}</h3>
                    <p className="text-sm text-gray-500">
                      {crew.trade} • {crew.size} members
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                      {resources.manpower.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-[#021422]">
                                {person.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {person.role}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show message if no resources for this crew */}
            {resources.materials.length === 0 &&
              resources.equipment.length === 0 &&
              (!resources.ppe || resources.ppe.length === 0) &&
              resources.manpower.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">No resources assigned to this crew</p>
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CrewResourcesTab;
