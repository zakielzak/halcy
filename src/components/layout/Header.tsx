import { getCurrentWindow } from '@tauri-apps/api/window';
import { Button } from '../ui/button';
import { Maximize, Minus, Plus, X } from 'lucide-react';
import { useCallback } from 'react';
import { useLibrary } from '@/hooks/useLibrary';


function Header() {

    const { importImages } = useLibrary();

    
    const appWindow = getCurrentWindow();

    const minimize = useCallback(async () => appWindow.minimize(), []);
    const toggleMaximize = useCallback(
      async () => appWindow.toggleMaximize(),
      []
    );
    const close = useCallback(async () => appWindow.close(), []);

  return (
    <div
      className="header absolute top-0 left-0 right-0 h-8 z-20 w-full flex items-center "
      data-tauri-drag-region
    >
      <Button size="icon" variant="ghost" onClick={() => importImages()}>
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
  );
}

export default Header