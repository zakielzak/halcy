import "./App.css";
import HeaderButtons from "./components/HeaderButtons";
import { Maximize, Minus, Radio, Settings, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { memo, useCallback, useRef } from "react";
import { Button } from "./components/ui/button";
import ImagePlaceholder from "./components/ImagePlaceholder";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePositioner } from "./components/masonry/use-positioner";


const mockImageData = Array.from({ length: 200}, (_, i) => ({
  id: i,
  with: Math.floor(Math.random() * (350 - 150 + 1)) + 150,
  height: Math.floor(Math.random() * (350 - 150 + 1)) + 150,
}))


const MasonryTest = ({ items, width}) => {
  const containerRef = useRef(null);
  const [computedColumnWidth, computedColumnCount] = getColums(width)
}


function App() {

    const appWindow = getCurrentWindow();

    const minimize = useCallback(async () => appWindow.minimize(), []);
    const toggleMaximize = useCallback(
      async () => appWindow.toggleMaximize(),
      []
    );
    const close = useCallback(async () => appWindow.close(), []);



  
  return (
    <main className="layout select-none antialiased /*bg-[#fafafc]*/ bg-gray-700 h-screen w-screen font-outfit overflow-hidden">
      {/* HEADER */}
      <div
        className="header absolute top-0 left-0 right-0 h-8 z-20 w-full flex items-center "
        data-tauri-drag-region
      >
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
      <div className="sidebar bg-amber-300 min-w-[200px]">Sidebar</div>
      <div className="main bg-sky-200 pt-2 px-4 w-full overflow-y-auto">
        <div className="">Header</div>

        <div
          className=" "
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "100px",
          }}
        >
          {mockImageData.map((item) => (
            <ImagePlaceholder
              key={item.id}
              index={item.id}
              width={item.with}
              heigth={item.height}
            />
          ))}
        </div>
      </div>
      <div className="inspector bg-red-300 min-w-[200px]">Inspector</div>
      {/* <HeaderButtons></HeaderButtons>
      <h1 className="text-amber-200">Hello World</h1> */}
    </main>
  );
}

export default App;
