import LibrarySwitching from '../LibrarySwitching';
import { Inbox, Plus, Shuffle, SidebarIcon, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/hooks/useLibrary';

function Sidebar() {
   const { importImages } = useLibrary();
  return (
    <div className="sidebar bg-neutral-800 w-[200px] border-r border-neutral-700 ">
      <div
        className="w-full h-11 flex items-center px-2 justify-end gap-1"
        data-tauri-drag-region
      >
        <Button size="icon" variant="ghost" onClick={() => importImages()}>
          <Plus size={16} strokeWidth={2} />
        </Button>
        <Button size="icon" variant="ghost">
          <SidebarIcon size={16} strokeWidth={2} />
        </Button>
      </div>
      {/* HEADER-SIDEBAR */}
      <div className="px-2">
        {/* Library Switching */}
        <LibrarySwitching />
      </div>

      {/* SIDEBAR BODY */}
      <div className="mt-2.5 flex flex-col px-2.5">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto"
        >
          <Inbox size={16} />
          <span>All</span>
          <span className="ml-auto text-xs tracking-wider text-white/60">
            3,093
          </span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto"
        >
          <Tag size={16} />
          <span>All Tags</span>
          <span className="ml-auto text-xs tracking-wider text-white/60">
            2
          </span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto justify-start"
        >
          <Shuffle size={16} />
          <span>Random</span>
        </Button>
      </div>

      {/* FOLDERS SIDEBAR */}
      <div className="mt-4  border-t/ border-neutral-700/">
        <span className="text-xs px-3">Folders</span>
        <div className="bg-neutral-600">a</div>
      </div>
    </div>
  );
}

export default Sidebar