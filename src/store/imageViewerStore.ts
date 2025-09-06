import { ImageRecord } from "@/lib/db";
import { create } from "zustand";

interface ImageViewerState {
  isOpen: boolean;
  images: ImageRecord[];
  currentIndex: number;
  openViewer: (images: ImageRecord[], index: number) => void;
  closeViewer: () => void;
  nextImage: () => void;
  prevImage: () => void;
}

export const useImageViewerStore = create<ImageViewerState>((set, get) => ({
  isOpen: false,
  images: [],
  currentIndex: 0,

  openViewer: (images, index) => {
    set({
      isOpen: true,
      images,
      currentIndex: index,
    });
  },

  closeViewer: () => set({ isOpen: false }),

  nextImage: () => {
    const state = get();
    if (state.images.length > 0) {
      set({
        currentIndex: (state.currentIndex + 1) % state.images.length,
      });
    }
  },

  prevImage: () => {
    const state = get();
    if (state.images.length > 0) {
      set({
        currentIndex:
          (state.currentIndex - 1 + state.images.length) % state.images.length,
      });
    }
  },
}));