import { useEffect } from "preact/hooks";
import { useRouter } from "./hooks/use-router";
import { useDrawings } from "./hooks/use-drawings";
import { Home } from "./components/home";
import { Editor } from "./components/editor";

export function App() {
  const { navigate, drawingId } = useRouter();
  const drawingState = useDrawings();

  useEffect(() => {
    if (drawingId && !drawingState.loading) {
      if (drawingState.activeDrawing?.id !== drawingId) {
        drawingState.loadDrawing(drawingId);
      }
    }
  }, [drawingId, drawingState.loading]);

  if (drawingState.loading) {
    return (
      <div class="flex items-center justify-center h-screen bg-gray-50">
        <div class="text-center">
          <div class="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p class="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!drawingId) {
    return (
      <Home
        drawings={drawingState.drawings}
        navigate={navigate}
        createDrawing={drawingState.createDrawing}
        deleteDrawing={drawingState.deleteDrawing}
        renameDrawing={drawingState.renameDrawing}
      />
    );
  }

  if (!drawingState.activeDrawing) {
    return (
      <div class="flex items-center justify-center h-screen bg-gray-50">
        <div class="text-center">
          <p class="text-gray-500 text-lg mb-4">Drawing not found</p>
          <button
            onClick={() => navigate("/")}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <Editor
      drawing={drawingState.activeDrawing}
      saveDrawing={drawingState.saveDrawing}
      renameDrawing={drawingState.renameDrawing}
      navigate={navigate}
    />
  );
}
