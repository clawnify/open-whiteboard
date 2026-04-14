import { useState, useEffect, useCallback, useRef } from "preact/hooks";
import { api } from "../api";
import type { Drawing, SceneData } from "../types";

export function useDrawings() {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<Drawing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingScene = useRef<string | null>(null);

  useEffect(() => {
    api<Drawing[]>("GET", "/api/drawings")
      .then(setDrawings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const loadDrawing = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const d = await api<Drawing>("GET", `/api/drawings/${id}`);
      setActiveDrawing(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDrawing = useCallback(async (name?: string): Promise<Drawing> => {
    const d = await api<Drawing>("POST", "/api/drawings", { name: name || "Untitled" });
    setDrawings((prev) => [d, ...prev]);
    return d;
  }, []);

  const saveDrawing = useCallback(
    (id: string, sceneData: string) => {
      pendingScene.current = sceneData;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const data = pendingScene.current;
        if (!data) return;
        pendingScene.current = null;
        try {
          const updated = await api<Drawing>("PUT", `/api/drawings/${id}`, { scene_data: data });
          setActiveDrawing(updated);
          setDrawings((prev) => prev.map((d) => (d.id === id ? updated : d)));
        } catch (e: any) {
          setError(e.message);
        }
      }, 2000);
    },
    []
  );

  const renameDrawing = useCallback(async (id: string, name: string) => {
    const updated = await api<Drawing>("PUT", `/api/drawings/${id}`, { name });
    setActiveDrawing((prev) => (prev?.id === id ? updated : prev));
    setDrawings((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }, []);

  const deleteDrawing = useCallback(async (id: string) => {
    await api("DELETE", `/api/drawings/${id}`);
    setDrawings((prev) => prev.filter((d) => d.id !== id));
    if (activeDrawing?.id === id) setActiveDrawing(null);
  }, [activeDrawing]);

  // Flush save on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return {
    drawings,
    activeDrawing,
    loading,
    error,
    loadDrawing,
    createDrawing,
    saveDrawing,
    renameDrawing,
    deleteDrawing,
    setError,
  };
}
