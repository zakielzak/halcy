import { useEffect, useRef,  } from "react";
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";

import { Tree, TreeItem, TreeItemLabel } from "@/components/ui/tree";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFolders } from "@/hooks/useFolders";
import { useLibrary } from "@/hooks/useLibrary";
import { Link } from "@tanstack/react-router";
import { useCounts } from "@/hooks/useCounts";



const indent = 15;

export default function FileTree() {
  /* const [nodes] = useState(() => generateTreeData(600)); */
  const { rootDir } = useLibrary();
  const {
    data: folderTree,
    isLoading,
    isError,
  } = useFolders(`${rootDir}/library.db`);
  const parentRef = useRef<HTMLDivElement>(null);
  const {
    counts,
    isLoading: isCountsLoading,
    isError: isCountsError,
  } = useCounts(`${rootDir}/library.db`);


  const tree = useTree({
    rootItemId: "root",
    dataLoader: {
      getItem: (itemId) => folderTree?.[itemId],
      getChildren: (itemId) => folderTree?.[itemId]?.children || [],
    },
    getItemName: (item) => item.getItemData()?.name ?? "",
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

  if (isLoading) return <div className="p-4 text-gray-500">Loading…</div>;
  if (isError || !folderTree)
    return <div className="p-4 text-red-500">Failed to load folders.</div>;
  
  return (
    <div className="flex h-full w-full flex-col gap-2 *:first:grow dark mt-1">
      <Tree indent={indent} tree={tree}>
        {tree.getItems().map((item) => {
          const folderId = item.getId();

          const count = counts?.folders?.[folderId] ?? 0;
          return (
            <Link
              key={folderId}
              to="/route/$filterId"
              params={{ filterId: folderId }}
              className="w-full"
            >
              <TreeItem key={item.getId()} item={item} className="mr-2.5 ">
                <TreeItemLabel count={count} />
              </TreeItem>
            </Link>
          );
        })}
        <div style={tree.getDragLineStyle()} className="dragline" />
      </Tree>
    </div>
  );
}
