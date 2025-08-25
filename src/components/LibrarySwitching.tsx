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
import { useSetting } from '../hooks/useSettings';
import { open as openDialog } from "@tauri-apps/plugin-dialog";

 


function LibrarySwitching() {

  const [open, setOpen] = useState(false);

  const [rootDir, setRootDir] = useSetting("rootDir", "")
  const [libraryHistory, , updateLibraryHistory] = useSetting("libraryHistory", []);


  const handleLibrarySelect = async (path: string) => {
    // Check if the path is different to avoid unnecesary writes
    if (path !== rootDir) {
      await setRootDir(path);

      // Add selected path to the top of the history
      if (updateLibraryHistory) {
        await updateLibraryHistory(currentHistory => {
          const filteredHistory = currentHistory.filter(p => p !== path);
          return [path, ...filteredHistory];
        });
      }
    }
    setOpen(false);
  }

  // Create a folder and select directory
  const createNewLibrary = async () => {
    // Open a native directory dialog
    const result = await openDialog({
      directory: true,
      multiple: false,
    })

    // Check if the user selected a directory
    if (result) {
      const newLibraryPath = result as string;
      
      await setRootDir(newLibraryPath);
      if (updateLibraryHistory) {
        await updateLibraryHistory(currentHistory => {
          // Ensure no duplicates and place the new path at the top
          const filteredHistory = currentHistory.filter(p => p !== newLibraryPath)
          return [newLibraryPath, ...filteredHistory];
        });
      }
    }
    setOpen(false);
  }

  const removeLibrary = async (pathToRemove: string) => {
    if (libraryHistory) {
      // Use the update function to remove the path
      if (updateLibraryHistory) {
        await updateLibraryHistory((currentHistory) => {
          return currentHistory.filter((p) => p !== pathToRemove);
        });
      }

      // If the current rootDir is the one being removed, set it to the first in the new history
      if (rootDir === pathToRemove) {
        const newHistory = libraryHistory.filter((p) => p !== pathToRemove);
        await setRootDir(newHistory[0] || "");
      }
    }
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="mt-7">
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className=" z-40 px-1.5 py-2 h-auto w-full justify-start hover:bg-white/8 hover:text-white text-sm font-semibold"
        >
          <div className="size-5 rounded-sm bg-amber-300 z-40"></div>
          {rootDir || "No library selected"}
          <ChevronsUpDown size={15} className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px p-0 dark" side="right" align="start">
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

