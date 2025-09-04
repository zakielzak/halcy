import { useQuery } from "@tanstack/react-query";
import { fetchFolders, FolderRecord } from "@/lib/db";


export interface FolderNode {
  name: string;
  children: string[];
}

export interface FolderTree {
  [id: string]: FolderNode;
}

export const buildFolderTree = (folders: FolderRecord[]): FolderTree => {
    const folderMap = new Map<string, FolderNode>();
    const rootIds = new Set<string>();

    folderMap.set("root", { name: "root", children: [] });

    const parentChildrenMap = new Map<string | null, string[]>();
    folders.forEach((folder) => {
      folderMap.set(folder.id, { name: folder.name, children: [] });
      const parentId = folder.parent_id;
      if (parentId === null) {
          rootIds.add(folder.id);
      } else {
          if (!parentChildrenMap.has(parentId)) {
              parentChildrenMap.set(parentId, []);
          }
          parentChildrenMap.get(parentId)!.push(folder.id);
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
    select: (folders) => buildFolderTree(folders),
  });
};
