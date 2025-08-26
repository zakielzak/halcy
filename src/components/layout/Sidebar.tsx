import LibrarySwitching from '../LibrarySwitching';
import { Inbox, Shuffle, Tag } from 'lucide-react';

function Sidebar() {
  return (
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
  );
}

export default Sidebar