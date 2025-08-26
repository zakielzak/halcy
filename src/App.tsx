import "./App.css";
import { ChevronsUpDown, Inbox, Maximize, Minus, Plus, Shuffle, Tag, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {  useCallback, useRef } from "react";
import { Button } from "./components/ui/button";


import { useVirtualizer } from "@tanstack/react-virtual";
import LibrarySwitching from "./components/LibrarySwitching";
import { useLibrary } from "./hooks/useLibrary";


interface ImageData {
  id: number;
  height: number;
}

// Data simulated
// We don't need width for virtualization & masonry layout
const images: ImageData[] = new Array(10000).fill(true).map((_, i) => ({
  id: i,
  height: 200 + Math.round(Math.random() * 200),
}));

const ImageCard = ({ index, height, style }: { index: number; height: number; style: React.CSSProperties }) => {
  return (
    <div
      style={{
        ...style,
        height: `${height}px`,
        backgroundColor: '#3498db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: '#888',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      Item {index}
    </div>
  );
};


function App() {

  const { importImages } = useLibrary();


  const appWindow = getCurrentWindow();

  const minimize = useCallback(async () => appWindow.minimize(), []);
  const toggleMaximize = useCallback(
    async () => appWindow.toggleMaximize(),
    []
  );
  const close = useCallback(async () => appWindow.close(), []);

  // VIRTUALIZER
 const parentRef = useRef<HTMLDivElement>(null);

 const gapY = 15
 const gapX = 7
 const numColumns = 4; 

 const virtualizer = useVirtualizer({
   count: images.length,
   getScrollElement: () => parentRef.current,
   estimateSize: (index) => images[index].height + gapY,
   overscan: 5,
   lanes: numColumns, 
 });

 const virtualItems = virtualizer.getVirtualItems();

  return (
    <main className="layout select-none antialiased /*bg-[#fafafc]*/ bg-gray-700 h-screen w-screen font-outfit overflow-hidden text-white">
      {/* HEADER */}
      <div
        className="header absolute top-0 left-0 right-0 h-8 z-20 w-full flex items-center "
        data-tauri-drag-region
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={() => importImages()}
        >
          <Plus size={16} strokeWidth={2} />
        </Button>

        <div className="flex items-center absolute right-2 top-1">
          <Button
            size="icon"
            variant="ghost"
            id="titlebar-minimize"
            onClick={minimize}
          >
            <Minus size={16} strokeWidth={2} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            id="titlebar-maximize"
            onClick={toggleMaximize}
          >
            <Maximize size={16} strokeWidth={2} />
          </Button>
          <Button
            className="hover:bg-red-600 "
            size="icon"
            variant="ghost"
            id="titlebar-close"
            onClick={close}
          >
            <X size={16} strokeWidth={2} />
          </Button>
        </div>
      </div>
      <div className="sidebar bg-neutral-800 w-[200px]  px-2 pt-4 border-r border-neutral-700 ">
        {/* HEADER-SIDEBAR */}
        <div className="">
          {/* Library Switching */}
          <LibrarySwitching />
        </div>

        {/* SIDEBAR BODY */}
        <div className="mt-4 flex flex-col ">
          <div className="flex items-center gap-2 py-1.5 text-xs font-medium rounded-md">
            <Inbox size={18} />
            <span>All</span>
          </div>
          <div className="flex items-center gap-2 py-1.5  text-xs font-medium rounded-md">
            <Tag size={18} />
            <span>All Tags</span>
          </div>
          <div className="flex items-center gap-2 py-1.5  text-xs font-medium rounded-md">
            <Shuffle size={18} />
            <span>Random</span>
          </div>
        </div>

        {/* FOLDERS SIDEBAR */}
        <div className="mt-4  border-t/ border-neutral-700/">
          <span className="text-sm">Folders</span>
          <div className="bg-neutral-600">a</div>
        </div>
      </div>
      {/* CONTENT */}
      <div className="main bg-neutral-900 pt-2  w-full ">
        <div className="">Header</div>

        <div
          ref={parentRef}
          className="List h-full w-full relative overflow-y-auto pr-6 pl-4"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
            className="w-full relative "
          >
            {virtualItems.map((virtualItem) => {
              const item = images[virtualItem.index];

              return (
                <ImageCard
                  key={virtualItem.key}
                  index={virtualItem.index}
                  height={item.height}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `calc(${(100 / numColumns) * virtualItem.lane}% + ${
                      virtualItem.lane * gapX
                    }px)`,
                    width: `calc(${100 / numColumns}% - ${gapX}px)`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="inspector bg-neutral-800 min-w-[200px]"></div>
      {/* <HeaderButtons></HeaderButtons>
      <h1 className="text-amber-200">Hello World</h1> */}
    </main>
  );
}

export default App;
