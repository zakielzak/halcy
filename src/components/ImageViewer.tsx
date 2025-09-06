import React, { useEffect, useRef, useState, useCallback } from "react";
import { useImageViewerStore } from "@/store/imageViewerStore";
;
import {
  X,
  Maximize,
  ArrowRight,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";

const ImageViewer = () => {
  const { isOpen, images, currentIndex, closeViewer, nextImage, prevImage } =
    useImageViewerStore();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);

  // Manejar el modo de ventana completa (Tauri)
  /* const toggleWindowMaximize = useCallback(async () => {
    await appWindow.toggleMaximize();
    setIsWindowMaximized(await appWindow.isMaximized());
  }, []); */

  // Manejar el modo de pantalla completa (API del navegador)
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Manejar eventos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        nextImage();
      } else if (event.key === "ArrowLeft") {
        prevImage();
      } else if (event.key === "Escape") {
        closeViewer();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, nextImage, prevImage, closeViewer]);

  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];
  const imageUrl = convertFileSrc(currentImage.path);

  const handleZoom = (amount: number) => {
    setScale((prevScale) => Math.max(0.5, prevScale + amount));
  };

  return (
    <div
      ref={viewerRef}
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center transition-opacity"
    >
      <div
        className="absolute top-4 right-4 flex gap-2 z-50"
        data-tauri-drag-region
      >
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 bg-gray-800 text-white rounded-full"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 bg-gray-800 text-white rounded-full"
        >
          <ZoomOut size={20} />
        </button>
      {/*   <button
          onClick={toggleWindowMaximize}
          className="p-2 bg-gray-800 text-white rounded-full"
        >
          {isWindowMaximized ? <ArrowsIn size={20} /> : <ArrowsOut size={20} />}
        </button> */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-gray-800 text-white rounded-full"
        >
          <Maximize size={20} />
        </button>
        <button
          onClick={closeViewer}
          className="p-2 bg-gray-800 text-white rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center w-full h-full">
        <button
          onClick={prevImage}
          className="absolute left-4 z-40 p-4 bg-gray-800 text-white rounded-full"
        >
          <ArrowLeft size={30} />
        </button>

        <div className="flex-1 flex justify-center items-center h-full w-full">
          <img
            src={imageUrl}
            alt={currentImage.filename || ""}
            className="object-contain max-w-full max-h-full transition-transform"
            style={{ transform: `scale(${scale})` }}
          />
        </div>

        <button
          onClick={nextImage}
          className="absolute right-4 z-40 p-4 bg-gray-800 text-white rounded-full"
        >
          <ArrowRight size={30} />
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;
