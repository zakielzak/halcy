import { useQuery } from "@tanstack/react-query";
import { fetchFolders, FolderRecord } from "@/lib/db";


export interface FolderNode {
  name: string;
  children: string[];
   order_by: string;      // Nuevo campo
  is_ascending: number;  // Nuevo campo
}

export interface FolderTree {
  [id: string]: FolderNode;
}

export const buildFolderTree = (folders: FolderRecord[]): FolderTree => {
    const folderMap = new Map<string, FolderNode>();
    const rootIds = new Set<string>();

    folderMap.set("root", {
      name: "root",
      children: [],
      order_by: "imported_date",
      is_ascending: 1,
    });

    const parentChildrenMap = new Map<string | null, string[]>();
    folders.forEach((folder) => {
      folderMap.set(folder.id, {
        name: folder.name,
        children: [],
        order_by: folder.order_by || "imported_date", 
        is_ascending: folder.is_ascending ?? 1,
      });
      const parentIdd = folder.parent_id;
      if (parentIdd === null) {
        rootIds.add(folder.id);
      } else {
        if (!parentChildrenMap.has(parentIdd)) {
          parentChildrenMap.set(parentIdd, []);
        }
        parentChildrenMap.get(parentIdd)!.push(folder.id);
      }
    });

    folderMap.forEach((node, id) => {
        if (parentChildrenMap.has(id)) {
            node.children = parentChildrenMap.get(id)!;
        }
    });

    folderMap.get("root")!.children.push(...Array.from(rootIds));
    return Object.fromEntries(folderMap);
};

export const useFolders = (dbPath: string) => {
  return useQuery<FolderRecord[], Error, FolderTree>({
    queryKey: ["folders", dbPath],
    queryFn: () => fetchFolders(dbPath),
    enabled: !!dbPath,
    select: (folders) => {
      // Log the data received directly from the database
      console.log("Data from `fetchFolders`:", folders);

      const folderTree = buildFolderTree(folders);

      // Log the final folder tree before it's returned to the component
      console.log("Transformed `folderTree`:", folderTree);

      return folderTree;
    },
  });
};
