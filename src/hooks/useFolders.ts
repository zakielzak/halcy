import { useQuery } from "@tanstack/react-query";
import { fetchFoldersFromDb, FolderRecord } from "@/lib/db";

export interface FolderTreeItem {
  parent_id: string | null;
  id: string;
  name: string;
  children: string[];
  description: string;
}

const transformFoldersToTree = (
  folders: FolderRecord[]
): Record<string, FolderTreeItem> => {
  const nodes: Record<string, FolderTreeItem> = {};

  // Pass 1: Create a node for each folder
  folders.forEach((folder) => {
    nodes[folder.id] = {
      id: folder.id,
      name: folder.name,
      children: [],
      parent_id: folder.parentId || null,
      description: "a"
    };
  });

  // Pass 2: Build parent-child relationships
  folders.forEach((folder) => {
    if (folder.parentId && nodes[folder.parentId]) {
      nodes[folder.parentId].children.push(folder.id);
    }
  });

  return nodes;
};

export const useFolders = (dbPath: string) => {
  return useQuery({
    queryKey: ["folders", dbPath],
    queryFn: async () => {
      const folders = await fetchFoldersFromDb(dbPath);
      return transformFoldersToTree(folders);
    },
    enabled: !!dbPath, // Only run the query when dbPath is available
  });
};
