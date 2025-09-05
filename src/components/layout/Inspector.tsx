import React, { useEffect } from 'react'
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback } from "react";
import { Button } from '../ui/button';
import { DownloadIcon, Maximize, Minus, X } from 'lucide-react';
import { Input } from '../ui/input';
import { useInspectorStore } from '@/store/inspectorStore';
import { useImages } from '@/hooks/useImages';
import { useLibrary } from '@/hooks/useLibrary';
import { useFolders } from '@/hooks/useFolders';
import { FolderRecord, ImageRecord } from '@/lib/db';
import { useCounts } from '@/hooks/useCounts';


// Componente para el Inspector de Carpetas
function FolderInspector({ folder }: { folder: FolderRecord }) {
   const { rootDir } = useLibrary();
 const {
    counts,
  } = useCounts(`${rootDir}/library.db`);

  
  
   if (!folder) return <div>Carpeta no encontrada.</div>;

    const count = counts?.folders[folder.id];

  useEffect(() => {
    console.log(folder)
  }, [])


  return (
    <>
      <div className="flex flex-col mt-1 px-4 gap-3">
        <Input value={folder.name} readOnly />
      </div>
      <div className="px-4 mt-8 w-full">
        <span className="text-xs font-bold">Propiedades</span>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex w-full text-xs items-center">
            <span className="flex-1">Items</span>
            <span className="flex-1 tracking-wider text-white/60 text-[10px]">
              {count}
              
            </span>
          </div>
          <div className="flex w-full text-xs items-center">
            <span className="flex-1">Order By</span>
            <span className="flex-1 tracking-wider text-white/60 text-[10px]">
              {folder.order_by}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente para el Inspector de Imágenes
function ImageInspector({ image }: { image: ImageRecord }) {
  return (
    <>
      <div className="flex flex-col mt-1 px-4 gap-3">
        <Input value={image.filename} readOnly />
        <Input placeholder="Description" />
      </div>
      <div className="px-4 mt-8 w-full">
        <span className="text-xs font-bold">Propiedades</span>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex w-full text-xs items-center">
            <span className="flex-1">Size</span>
            {/* Convertir el tamaño del archivo a un formato legible */}
            <span className="flex-1 tracking-wider text-white/60 text-[10px]">
              {/* Lógica para obtener el tamaño de archivo y formatearlo */}
            </span>
          </div>
          <div className="flex w-full text-xs items-center">
            <span className="flex-1">Date Imported</span>
            <span className="flex-1 tracking-wider text-white/60 text-[10px]">
              {image.imported_date}
            </span>
          </div>
        </div>
        <Button className="w-full mt-4 text-xs">
          <DownloadIcon size={15} />
          Export
        </Button>
      </div>
    </>
  );
}

// Componente principal del Inspector
export default function Inspector() {
  const { selectedItem } = useInspectorStore();
  const appWindow = getCurrentWindow();
  const minimize = useCallback(async () => appWindow.minimize(), []);
  const toggleMaximize = useCallback(() => appWindow.toggleMaximize(), []);
  const close = useCallback(async () => appWindow.close(), []);

  return (
    <div className="inspector bg-[#1f2023] w-[200px] flex flex-col overflow-hidden border-l border-[#313134]">
      <div
        className="flex items-center justify-end h-12 w-full px-2"
        data-tauri-drag-region
      >
        <Button
          size="icon"
          variant="ghost"
          id="titlebar-minimize"
          onClick={minimize}
          className="size-8 p-2"
        >
          <Minus size={16} strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          id="titlebar-maximize"
          onClick={toggleMaximize}
          className="size-8 p-2"
        >
          <Maximize size={16} strokeWidth={2} />
        </Button>
        <Button
          className="hover:bg-red-600 size-8 p-2"
          size="icon"
          variant="ghost"
          id="titlebar-close"
          onClick={close}
        >
          <X size={16} strokeWidth={2} />
        </Button>
      </div>
      {selectedItem ? (
        selectedItem.type === "folder" ? (
          // Pasa la data directamente
          <FolderInspector folder={selectedItem.data as FolderRecord} />
        ) : (
          // Pasa la data directamente
          <ImageInspector image={selectedItem.data as ImageRecord} />
        )
      ) : (
        <div className="px-4 mt-8 w-full text-center text-gray-500 text-xs">
          Selecciona un elemento para ver sus propiedades.
        </div>
      )}
    </div>
  );
}

/* 
function Inspector() {
    const appWindow = getCurrentWindow();

    const minimize = useCallback(async () => appWindow.minimize(), []);
    const toggleMaximize = useCallback(
      async () => appWindow.toggleMaximize(),
      []
    );

    const close = useCallback(async () => appWindow.close(), []);

  return (
    <div className="inspector bg-[#1f2023] w-[200px] flex flex-col overflow-hidden border-l border-[#313134]">
      <div
        className="flex items-center justify-end  h-12 w-full  px-2 "
        data-tauri-drag-region
      >
        <Button
          size="icon"
          variant="ghost"
          id="titlebar-minimize"
          onClick={minimize}
          className="size-8 p-2"
        >
          <Minus size={16} strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          id="titlebar-maximize"
          onClick={toggleMaximize}
          className="size-8 p-2"
        >
          <Maximize size={16} strokeWidth={2} />
        </Button>
        <Button
          className="hover:bg-red-600 size-8 p-2"
          size="icon"
          variant="ghost"
          id="titlebar-close"
          onClick={close}
        >
          <X size={16} strokeWidth={2} />
        </Button>
      </div>
      <div className="flex flex-col mt-1 px-4 gap-3">
        <Input value="Imagenes" />
        <Input placeholder='Description'/>
      </div>
      <div className="px-4 mt-8 w-full">
        <span className="text-xs font-bold">Properties</span>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex w-full text-xs items-center">
            <span className="flex-1">Items</span>
            <span className="flex-1 tracking-wider text-white/60 text-[10px]">
              2
            </span>
          </div>
          <div className="flex w-full text-xs items-center">
            <span className="flex-1">Size</span>
            <span className="flex-1 tracking-wider text-white/60 text-[10px]">
              1.15 MB
            </span>
          </div>
          <div className="flex w-full text-xs items-center">
            <span className="flex-1">Date Imported</span>
            <span className="flex-1 tracking-wider text-white/60 text-[10px]">
              2025/08/23
            </span>
          </div>
        </div>
        <Button className="w-full mt-4 text-xs">
          <DownloadIcon size={15} />
          Export
        </Button>
      </div>
    </div>
  );
}
 */
