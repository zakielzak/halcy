import React from 'react'
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback } from "react";
import { Button } from '../ui/button';
import { DownloadIcon, Maximize, Minus, X } from 'lucide-react';
import { Input } from '../ui/input';

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

export default Inspector