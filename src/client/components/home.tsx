import { useState } from "preact/hooks";
import { Plus, Pencil, Trash2, MoreVertical } from "lucide-preact";
import type { Drawing } from "../types";

interface HomeProps {
  drawings: Drawing[];
  navigate: (to: string) => void;
  createDrawing: (name?: string) => Promise<Drawing>;
  deleteDrawing: (id: string) => Promise<void>;
  renameDrawing: (id: string, name: string) => Promise<void>;
}

export function Home({ drawings, navigate, createDrawing, deleteDrawing, renameDrawing }: HomeProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleCreate = async () => {
    const d = await createDrawing();
    navigate(`/drawing/${d.id}`);
  };

  const handleDelete = async (id: string) => {
    setMenuOpen(null);
    await deleteDrawing(id);
  };

  const startRename = (d: Drawing) => {
    setMenuOpen(null);
    setRenaming(d.id);
    setRenameValue(d.name);
  };

  const commitRename = async (id: string) => {
    if (renameValue.trim()) {
      await renameDrawing(id, renameValue.trim());
    }
    setRenaming(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso + "Z");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Whiteboard</h1>
            <p class="text-gray-500 text-sm mt-1">Sketch, diagram, and brainstorm</p>
          </div>
          <button
            onClick={handleCreate}
            class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            New Drawing
          </button>
        </div>

        {drawings.length === 0 ? (
          <div class="text-center py-20">
            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Pencil size={28} class="text-gray-400" />
            </div>
            <p class="text-gray-500 mb-4">No drawings yet</p>
            <button
              onClick={handleCreate}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Create your first drawing
            </button>
          </div>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drawings.map((d) => (
              <div
                key={d.id}
                class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div
                  class="h-40 bg-gray-50 border-b border-gray-100 flex items-center justify-center"
                  onClick={() => navigate(`/drawing/${d.id}`)}
                >
                  <DrawingPreview sceneData={d.scene_data} />
                </div>
                <div class="p-3 flex items-center justify-between">
                  <div class="min-w-0 flex-1" onClick={() => navigate(`/drawing/${d.id}`)}>
                    {renaming === d.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onInput={(e) => setRenameValue((e.target as HTMLInputElement).value)}
                        onBlur={() => commitRename(d.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename(d.id);
                          if (e.key === "Escape") setRenaming(null);
                        }}
                        class="text-sm font-medium text-gray-900 border border-blue-300 rounded px-1.5 py-0.5 w-full outline-none focus:ring-2 focus:ring-blue-100"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <p class="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                        <p class="text-xs text-gray-400 mt-0.5">Edited {formatDate(d.updated_at)}</p>
                      </>
                    )}
                  </div>
                  <div class="relative ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === d.id ? null : d.id);
                      }}
                      class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpen === d.id && (
                      <div class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(d);
                          }}
                          class="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil size={14} />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(d.id);
                          }}
                          class="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close menu on outside click */}
      {menuOpen && <div class="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}

function DrawingPreview({ sceneData }: { sceneData: string }) {
  let elementCount = 0;
  try {
    const parsed = JSON.parse(sceneData);
    elementCount = (parsed.elements || []).filter((e: any) => !e.isDeleted).length;
  } catch {}

  if (elementCount === 0) {
    return <Pencil size={32} class="text-gray-200" />;
  }

  return (
    <div class="text-center">
      <Pencil size={24} class="text-blue-300 mx-auto mb-1" />
      <span class="text-xs text-gray-400">
        {elementCount} element{elementCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
