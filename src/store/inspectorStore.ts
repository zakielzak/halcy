import { FolderRecord, ImageRecord } from "@/lib/db";
import { create } from "zustand";

interface SelectedItemState {
  id: string;
  type: "folder" | "image";
  data: FolderRecord | ImageRecord | null;
}

interface InspectorStoreState {
  selectedItem: SelectedItemState | null;
  setSelectedItem: (item: SelectedItemState) => void;
  clearSelection: () => void;
}

export const useInspectorStore = create<InspectorStoreState>((set) => ({
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
  clearSelection: () => set({ selectedItem: null }),
}));