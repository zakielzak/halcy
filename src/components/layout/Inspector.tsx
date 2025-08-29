import React from 'react'
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback } from "react";
import { Button } from '../ui/button';
import { Maximize, Minus, X } from 'lucide-react';
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
    <div className="inspector bg-neutral-800 w-[200px] flex flex-col">
      <div
        className="flex items-center justify-end  h-11 w-full  px-2"
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
      <div className="flex flex-col mt-2 px-4 gap-3">
        <Input />
        <Input />
      </div>
      <div className="px-4 mt-8">
        <span className='text-xs font-bold'>Properties</span>
      </div>
    </div>
  );
}

export default Inspector