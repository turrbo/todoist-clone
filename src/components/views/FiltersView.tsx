"use client";

import { useStore } from "@/store/useStore";
import { Filter, Tag, Plus, Trash2, MoreHorizontal } from "lucide-react";
import { PROJECT_COLORS } from "@/types";
import { useState } from "react";

export default function FiltersView() {
  const filters = useStore((state) => state.filters);
  const labels = useStore((state) => state.labels);
  const addFilter = useStore((state) => state.addFilter);
  const deleteFilter = useStore((state) => state.deleteFilter);
  const addLabel = useStore((state) => state.addLabel);
  const deleteLabel = useStore((state) => state.deleteLabel);

  const [showAddFilter, setShowAddFilter] = useState(false);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [newFilterQuery, setNewFilterQuery] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState("charcoal");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleAddFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFilterName.trim() && newFilterQuery.trim()) {
      addFilter({ name: newFilterName.trim(), query: newFilterQuery.trim(), color: selectedColor });
      setNewFilterName(""); setNewFilterQuery(""); setSelectedColor("charcoal"); setShowAddFilter(false);
    }
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      addLabel({ name: newLabelName.trim(), color: selectedColor });
      setNewLabelName(""); setSelectedColor("charcoal"); setShowAddLabel(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#202020] mb-2">Filters & Labels</h1>
        <p className="text-sm text-gray-500">Organize your tasks with custom filters and labels</p>
      </div>

      {/* Filters */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#202020] flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filters
          </h2>
          {!showAddFilter && (
            <button onClick={() => setShowAddFilter(true)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <Plus className="w-4 h-4" /> Add filter
            </button>
          )}
        </div>

        {showAddFilter && (
          <form onSubmit={handleAddFilter} className="mb-4 p-4 border border-gray-200 rounded">
            <input type="text" value={newFilterName} onChange={(e) => setNewFilterName(e.target.value)} placeholder="Filter name" className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3" autoFocus />
            <input type="text" value={newFilterQuery} onChange={(e) => setNewFilterQuery(e.target.value)} placeholder="Query (e.g., today | overdue)" className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3" />
            <div className="flex items-center gap-2">
              <button type="submit" className="px-4 py-2 bg-[#dc4c3e] text-white rounded text-sm font-medium hover:bg-[#c53727] transition-colors">Add filter</button>
              <button type="button" onClick={() => { setShowAddFilter(false); setNewFilterName(""); setNewFilterQuery(""); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {filters.length > 0 ? (
          <div className="space-y-1">
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 group transition-colors">
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4" style={{ color: PROJECT_COLORS[filter.color] }} />
                  <div>
                    <p className="text-sm font-medium text-[#202020]">{filter.name}</p>
                    <p className="text-xs text-gray-500">{filter.query}</p>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === filter.id ? null : filter.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                  {openMenu === filter.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                      <button onClick={() => { deleteFilter(filter.id); setOpenMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3 h-3 inline mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No filters yet</p>
        )}
      </div>

      {/* Labels */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#202020] flex items-center gap-2">
            <Tag className="w-5 h-5" /> Labels
          </h2>
          {!showAddLabel && (
            <button onClick={() => setShowAddLabel(true)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <Plus className="w-4 h-4" /> Add label
            </button>
          )}
        </div>

        {showAddLabel && (
          <form onSubmit={handleAddLabel} className="mb-4 p-4 border border-gray-200 rounded">
            <input type="text" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Label name" className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3" autoFocus />
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Color</p>
              <div className="grid grid-cols-10 gap-2">
                {Object.entries(PROJECT_COLORS).map(([colorName, colorValue]) => (
                  <button key={colorName} type="button" onClick={() => setSelectedColor(colorName)} className={`w-8 h-8 rounded-full transition-transform ${selectedColor === colorName ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`} style={{ backgroundColor: colorValue }} title={colorName} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="submit" className="px-4 py-2 bg-[#dc4c3e] text-white rounded text-sm font-medium hover:bg-[#c53727] transition-colors">Add label</button>
              <button type="button" onClick={() => { setShowAddLabel(false); setNewLabelName(""); setSelectedColor("charcoal"); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {labels.length > 0 ? (
          <div className="space-y-1">
            {labels.map((label) => (
              <div key={label.id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 group transition-colors">
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4" style={{ color: PROJECT_COLORS[label.color] }} />
                  <p className="text-sm font-medium text-[#202020]">{label.name}</p>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === label.id ? null : label.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                  {openMenu === label.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                      <button onClick={() => { deleteLabel(label.id); setOpenMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3 h-3 inline mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No labels yet</p>
        )}
      </div>
    </div>
  );
}
