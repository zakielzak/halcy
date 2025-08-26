import { CheckIcon, ChevronsUpDown, FolderPlusIcon, Trash2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from "../lib/utils";
import { useLibrary } from '../hooks/useLibrary';

 
function LibrarySwitching() {

  const [open, setOpen] = useState(false);

  const { rootDir , libraryHistory, currentLibraryName, handleLibrarySelect, createNewLibrary, removeLibrary} = useLibrary()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="mt-7 ">
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className=" z-40 px-1.5 py-2 h-auto  overflow-hidden justify-start hover:bg-white/8 w-full gap-1 hover:text-white text-sm font-semibold"
        >
          <div className="size-5 rounded-sm bg-amber-300 z-40 "></div>
          <p className="truncate">
            {currentLibraryName || "No library selected"}
          </p>
          <ChevronsUpDown size={13} className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 dark" side="right" align="start">
        <Command>
          <CommandInput placeholder="Search library..." />
          <CommandList>
            <CommandEmpty>No library found.</CommandEmpty>
            <CommandGroup heading="Recent Libraries">
              {libraryHistory?.map((libPath) => (
                <CommandItem
                  key={libPath}
                  value={libPath}
                  onSelect={handleLibrarySelect}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        rootDir === libPath ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {libPath}
                  </div>
                  <div
                    className="size-8 flex justify-center items-center  rounded-md hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLibrary(libPath);
                    }}
                  >
                    <Trash2 size={14} className="" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem
                onSelect={createNewLibrary}
                className="justify-center"
              >
                <FolderPlusIcon size={16} className="mr-2" />
                Create New Library
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default LibrarySwitching

