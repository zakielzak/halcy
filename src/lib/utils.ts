import { FolderTree } from "@/hooks/useFolders";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Listener = (key: string) => void;

export class EventBus {
  private listeners = new Set<Listener>();

  emit(key: string) {
    for (const fn of this.listeners) fn(key);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
}

export const getLibraryName = (path: string): string => {
  if (!path) return "";
  const parts = path.split(/[/\\]/);
  const nameWithExtension = parts.pop();
  if (!nameWithExtension) return "";

  // Remove the '.library' extension
  const name = nameWithExtension.endsWith(".library")
    ? nameWithExtension.slice(0, -8)
    : nameWithExtension;

  return name || "";
};

export const countAllFolders = (folderTree: FolderTree | undefined): number => {
  if (!folderTree) {
    return 0;
  }

  // The 'root' node is not a user-created folder, so we start with a count of -1
  // to compensate for it being in the object.
  // We can also just iterate over the object entries and check if the key is 'root'.
  let count = 0;
  for (const key in folderTree) {
    // We only count actual folders, not the synthetic 'root' node
    if (key !== "root") {
      count++;
    }
  }

  return count;
};