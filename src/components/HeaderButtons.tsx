import { Maximize, Minus, Radio, Settings, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { memo, useCallback } from "react";
import { Button } from "./ui/button";

import { Separator } from "./ui/separator";


const LeftButtons: React.FC = () => (
  <div className="flex">
    <Button size="icon" variant="ghost">
      <Radio size={15} strokeWidth={2} />
    </Button>
    <Button size="icon" variant="ghost">
      <Settings size={15} strokeWidth={2} />
    </Button>
  </div>
);

const WindowsButtons: React.FC = () => {
  const appWindow = getCurrentWindow();

  const minimize = useCallback(async () => appWindow.minimize(), []);
  const toggleMaximize = useCallback(
    async () => appWindow.toggleMaximize(),
    []
  );
  const close = useCallback(async () => appWindow.close(), []);

  return (
    <div className="flex items-center ">
      <Button
        size="icon"
        variant="ghost"
        id="titlebar-minimize"
        onClick={minimize}
      >
        <Minus size={15} strokeWidth={2} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        id="titlebar-maximize"
        onClick={toggleMaximize}
      >
        <Maximize size={15} strokeWidth={2} />
      </Button>
      <Button
        className="hover:text-red-400"
        size="icon"
        variant="ghost"
        id="titlebar-close"
        onClick={close}
      >
        <X size={15} strokeWidth={2} />
      </Button>
    </div>
  );
};

const HeaderButtonsComponent: React.FC = () => {
  return (
    <>
      <LeftButtonsComponent />
      <Separator orientation="vertical" />
      <WindowsButtonsComponent />
    </>
  );
};

const LeftButtonsComponent = memo(LeftButtons);
const WindowsButtonsComponent = memo(WindowsButtons);
const HeaderButtons = memo(HeaderButtonsComponent);

export default HeaderButtons;
