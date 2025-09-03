import React, { useEffect, useMemo, useRef, useState } from "react";
import { dragAndDropFeature, hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";

import { Tree, TreeItem, TreeItemLabel } from "@/components/ui/tree";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFolders } from "@/hooks/useFolders";
import { useLibrary } from "@/hooks/useLibrary";
import { FolderRecord } from "@/lib/db";
import { Link } from "@tanstack/react-router";



interface FolderNode {
  name: string;
  children: string[];
}

interface FolderTree {
  [id: string]: FolderNode;
}

export const getFolderTree = (folders: FolderRecord[]): FolderTree => {
  const folderMap = new Map<string, FolderNode>();
  const rootIds = new Set<string>();

  // Inicializar un nodo para la raíz de la biblioteca
  folderMap.set("root", { name: "root", children: [] });

  // Primer paso: llenar el mapa con todos los nodos
  // y agrupar por el ID de su padre.
  const parentChildrenMap = new Map<string | null, string[]>();
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      name: folder.name,
      children: [], // Inicialmente vacía
    });

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

  // Segundo paso: conectar los nodos hijos a sus respectivos padres.
  folderMap.forEach((node, id) => {
    if (parentChildrenMap.has(id)) {
      node.children = parentChildrenMap.get(id)!;
    }
  });

  // Tercer paso: agregar las carpetas raíz al nodo principal de la "Library"
  folderMap.get("root")!.children.push(...Array.from(rootIds));

  // Devolver el mapa como un objeto plano
  return Object.fromEntries(folderMap);
};



const indent = 15;


export default function FileTree() {
  /* const [nodes] = useState(() => generateTreeData(600)); */
  const { rootDir } = useLibrary();
  const { folders, isLoading, isError } = useFolders(`${rootDir}/library.db`);
  const parentRef = useRef<HTMLDivElement>(null);

  const folderTree = useMemo(() => {
    if (!folders) return {};
    return getFolderTree(folders);
  }, [folders]);

  

  const tree = useTree({
    rootItemId: "root",
    dataLoader: {
      getItem: (itemId) => folderTree[itemId],
      getChildren: (itemId) => folderTree[itemId]?.children || [],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: () => true,
    features: [syncDataLoaderFeature, hotkeysCoreFeature, dragAndDropFeature],
  });

 

  const virtualizer = useVirtualizer({
    count: tree.getItems().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, //
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    // Es crucial volver a medir el tamaño del virtualizer cuando la estructura del árbol cambia
    // (por ejemplo, al expandir o contraer una carpeta).
    virtualizer.measure();
    
  }, [tree.getItems(), virtualizer]);

  


  if (isError || !folders || folders.length === 0 || tree.getItems().length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No se pudieron cargar las carpetas.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 *:first:grow dark mt-1">
      <Tree indent={indent} tree={tree}>
        {tree.getItems().map((item) => {
          const folderId = item.getId();
          return (
            <Link
              key={folderId}
              to="/folder/$folderId"
              params={{ folderId }}
              className="w-full"
            >
              <TreeItem key={item.getId()} item={item} className="mr-2.5 ">
                <TreeItemLabel />
              </TreeItem>
            </Link>
          );
        })}
        <div style={tree.getDragLineStyle()} className="dragline" />
      </Tree>
    </div>
  );
}
