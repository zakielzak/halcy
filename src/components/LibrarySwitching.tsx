import { CheckIcon, ChevronsUpDown } from 'lucide-react';
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
 
const libraries = [
  { id: 1, name: "My library", label: "My library" },
  { id: 2, name: "Work", label: "Work" },
  { id: 3, name: "Personal", label: "Personal" },
  { id: 4, name: "Travel", label: "Travel" },
];

function LibrarySwitching() {

  const [open, setOpen] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState(libraries[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open}>
          {selectedLibrary
            ? libraries.find((lib) => lib.name === selectedLibrary.name)?.label
            : libraries[0].name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px p-0">
        <Command>
          <CommandInput placeholder="Search library..." />
          <CommandList>
            <CommandEmpty>No library found.</CommandEmpty>
            <CommandGroup>
              {libraries.map((lib) => (
                <CommandItem
                  key={lib.name}
                  value={lib.name}
                  onSelect={(currentLibraryName) => {
                    const libObj = libraries.find((lib) => lib.name === currentLibraryName);
                    if (libObj) {
                      setSelectedLibrary(libObj);
                    }
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLibrary.name === lib.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {lib.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default LibrarySwitching

 {
   /* <div className="flex items-center gap-0.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <div className="size-5 rounded-sm bg-amber-300"></div>
        <span>My library</span>
      </div>

      <ChevronsUpDown size={16} />
    </div> */
 }