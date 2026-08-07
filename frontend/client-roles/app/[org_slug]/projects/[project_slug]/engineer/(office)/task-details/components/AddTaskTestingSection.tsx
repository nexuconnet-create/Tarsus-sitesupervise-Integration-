"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, FileText } from "lucide-react";
import type { TaskTest, TestType } from "../types";
import { TEST_CATEGORIES } from "../types";

interface AddTaskTestingSectionProps {
  testFields: (TaskTest & { id: string })[];
  appendTest: (test: TaskTest) => void;
  removeTest: (index: number) => void;
}

export default function AddTaskTestingSection({
  testFields,
  appendTest,
  removeTest,
}: AddTaskTestingSectionProps) {
  const [categories, setCategories] = useState(TEST_CATEGORIES);
  const [selectedTestType, setSelectedTestType] = useState(
    TEST_CATEGORIES[0]?.testType || "",
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Form state for adding a test
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubTest, setSelectedSubTest] = useState("");
  const [customName, setCustomName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [productionDate, setProductionDate] = useState("");

  const selectedCategory = categories.find(
    (c) => c.testType === selectedTestType,
  );
  const isCustom = selectedTestType === "Custom Testing";
  const subTests = selectedCategory?.subTests || [];

  const handleTypeChange = (value: string) => {
    if (value === "__ADD_NEW__") {
      setIsAddingCategory(true);
      setNewCategoryName("");
    } else {
      setIsAddingCategory(false);
      setSelectedTestType(value);
      setSelectedSubTest("");
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory = {
      testType: newCategoryName.trim(),
      subTests: [],
    };
    setCategories((prev) => [...prev, newCategory]);
    setSelectedTestType(newCategoryName.trim());
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  const handleAddTest = () => {
    const label = isCustom ? customName : selectedSubTest;
    if (!label.trim()) return;

    appendTest({
      id: `test-${Date.now()}`,
      type: selectedTestType as TestType,
      label,
      dateAdded: date,
      productionDate: productionDate || undefined,
      companyName: companyName || undefined,
      notes: notes || undefined,
      results: [],
    });

    // Reset form
    setShowAddForm(false);
    setSelectedSubTest("");
    setCustomName("");
    setCompanyName("");
    setNotes("");
    setProductionDate("");
  };

  const handleRemoveTest = (index: number) => {
    removeTest(index);
  };

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wider shrink-0">
            Test Category
          </label>
          <div className="relative flex-1 max-w-sm">
            <select
              value={isAddingCategory ? "__ADD_NEW__" : selectedTestType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold text-[#021422] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.testType} value={cat.testType}>
                  {cat.testType}
                </option>
              ))}
              <option
                value="__ADD_NEW__"
                className="font-semibold text-[#021422]"
              >
                + Add New Category
              </option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* New category input */}
        {isAddingCategory && (
          <div className="flex items-center gap-2 pl-[104px]">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter new category name..."
              autoFocus
              className="flex-1 max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-[#021422] text-white rounded-lg text-xs font-bold uppercase hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCategory(false);
                setNewCategoryName("");
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Add Test Button */}
        {!showAddForm && !isAddingCategory && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-[#021422] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-900 transition-colors"
          >
            <Plus size={14} />
            Add Test
          </button>
        )}
      </div>

      {/* Add Test Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#021422]">Add New Test</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                Test Category
              </label>
              <input
                type="text"
                value={selectedTestType}
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5 whitespace-nowrap">
                Production Date (IF APPLICABLE)
              </label>
              <input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                Test Name {isCustom && "*"}
              </label>
              {isCustom ? (
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Fire Resistance Test"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              ) : (
                <select
                  value={selectedSubTest}
                  onChange={(e) => setSelectedSubTest(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                >
                  <option value="">Select test...</option>
                  {subTests.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., ABC Testing Lab"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional observations, deviations, or comments..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddTest}
              disabled={isCustom ? !customName.trim() : !selectedSubTest}
              className="flex-1 py-2.5 rounded-lg bg-[#021422] text-white text-sm font-bold hover:bg-gray-900 disabled:opacity-50"
            >
              Add Test
            </button>
          </div>
        </div>
      )}

      {/* Tests List */}
      {testFields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
          <FileText size={40} className="mb-3" />
          <p className="text-sm font-medium">No tests added yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Select a category and click &quot;Add Test&quot;
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Test Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Production Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Company
                </th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {testFields.map((test, index) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-[#021422]">
                    {test.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {test.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {test.dateAdded}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {test.productionDate || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {test.companyName || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveTest(index)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
