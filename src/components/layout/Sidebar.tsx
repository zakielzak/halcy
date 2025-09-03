import LibrarySwitching from '../LibrarySwitching';
import { FileClock, Inbox, Plus, Shuffle, SidebarIcon, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/hooks/useLibrary';
import FileTree from '../FileTree';
import { Link } from "@tanstack/react-router";
import { useFolders } from '@/hooks/useFolders';


function Sidebar() {
   const { importImages } = useLibrary();
   const {rootDir} = useLibrary();
   const { isLoading } = useFolders(`${rootDir}/library.db`);
  return (
    <div className="sidebar flex flex-col bg-[#1f2023] w-[200px]  border-r border-[#313134]  overflow-hidden">
      <div
        className="w-full h-22.5 flex items-center px-2 justify-end gap-1"
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
      <div className="px-2 w-full">
        {/* Library Switching */}
        <LibrarySwitching />
      </div>

      {/* SIDEBAR BODY */}
      <div className="mt-2.5 flex flex-col px-2.5 w-full">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto"
        >
          <Link to="/" className="flex w-full items-center gap-2">
            <Inbox size={16} />
            <span>All</span>
            <span className="ml-auto text-[10px] tracking-wider text-white/60">
              3,093
            </span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto"
        >
          <Link to="/uncategorized" className="flex w-full items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-folder-question"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M15 19h-10a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2.5" />
              <path d="M19 22v.01" />
              <path d="M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483" />
            </svg>
            <span>Uncategorized</span>
            <span className="ml-auto text-[10px] tracking-wider text-white/60">
              2
            </span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-bookmark-question"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 19l-3 -2l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v4" />
            <path d="M19 22v.01" />
            <path d="M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483" />
          </svg>
          <span>Untagged</span>
          <span className="ml-auto text-[10px] tracking-wider text-white/60">
            2
          </span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto justify-start"
        >
          <FileClock size={16} />
          <span>Recently Useds</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto"
        >
          <Tag size={16} />
          <span>All Tags</span>
          <span className="ml-auto text-[10px] tracking-wider text-white/60">
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
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-xs font-medium  px-1 py-1.5 h-auto "
        >
          <Trash2 size={16} />
          <span>Trash</span>
          <span className="ml-auto text-[10px] tracking-wider text-white/60">
            3
          </span>
        </Button>
      </div>

      {/* FOLDERS SIDEBAR */}
      <div className="pt-2 mt-2  border-t/ border-neutral-700/ w-full h-full overflow-y-auto scrollbar">
        <div className="text-xs px-3 font-semibold tracking-wide flex h-3.5  items-center  gap-1 mb-2.5 ">
          Smart Folders
          <span className="text-[11px]">{`(3)`}</span>
        </div>
        <div className="text-xs px-3 font-semibold tracking-wide flex h-3.5  items-center  gap-1 mb-2">
          Folders
          <span className="text-[11px]">{`(26)`}</span>
        </div>

        {(isLoading && <div>loading...</div>) || <FileTree />}
      </div>
    </div>
  );
}

export default Sidebar