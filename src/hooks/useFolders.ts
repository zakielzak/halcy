import { useQuery } from "@tanstack/react-query";
import { fetchFoldersFromDb, FolderRecord } from "@/lib/db";

export interface FolderTreeItem {
  parentId: string | null;
  id: string;
  name: string;
  children: string[];
  description: string;
}

const transformFoldersToTree = (
  folders: FolderRecord[]
): Record<string, FolderTreeItem> => {
  const nodes: Record<string, FolderTreeItem> = {};

  // Create a node for each folder with its ID as the key.
  // This is the structure required by `@headless-tree/core`.
  folders.forEach((folder) => {
    nodes[folder.id] = {
      id: folder.id,
      name: folder.name,
      children: [], // This will be populated in the next pass
      parentId: folder.parent_id || null,
      description: "a",
    };
  });

  // Now, build parent-child relationships using the created nodes.
  folders.forEach((folder) => {
    if (folder.parent_id && nodes[folder.parent_id]) {
      nodes[folder.parent_id].children.push(folder.id);
    }
  });

  return nodes;
};

export const useFolders = (dbPath: string) => {

  const {
    data: folders,
    isLoading,
    isError
  } = useQuery<FolderRecord[]>({
    queryKey: ["folders", dbPath],
    queryFn:  () =>  fetchFoldersFromDb(dbPath),
    enabled: !!dbPath
  })

   return {
     folders,
     isLoading,
     isError,
   };

 
};
