import React, { useEffect, useMemo, useRef, useState } from "react";
import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";

import { Tree, TreeItem, TreeItemLabel } from "@/components/ui/tree";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Item {
  name: string;
  children?: string[];
}

const items: Record<string, Item> = {
  company: {
    name: "Company",
    children: ["engineering", "marketing", "operations"],
  },
  engineering: {
    name: "Engineering",
    children: ["frontend", "backend", "platform-team"],
  },
  frontend: { name: "Frontendklkkadasaddadasddasd", children: ["design-system", "web-platform"] },
  "design-system": {
    name: "Design System asasd asdasd",
    children: ["components", "tokens", "guidelines"],
  },
  components: { name: "Components" },
  tokens: { name: "Tokens" },
  guidelines: { name: "Guidelines" },
  "web-platform": { name: "Web Platform" },
  backend: { name: "Backend", children: ["apis", "infrastructure"] },
  apis: { name: "APIs" },
  infrastructure: { name: "Infrastructure" },
  "platform-team": { name: "Platform Team" },
  marketing: { name: "Marketing", children: ["content", "seo"] },
  content: { name: "Content" },
  seo: { name: "SEO" },
  operations: { name: "Operations", children: ["hr", "finance"] },
  hr: { name: "HR" },
  finance: { name: "Finance" },
};

const indent = 15;

// This is a placeholder for your actual database query.
// It generates a large, nested dataset for demonstration.
const generateTreeData = (count: number): Record<string, any> => {
  const data: Record<string, any> = {};
  data["root"] = { name: "Root", children: [] };
  let currentLevelParents = ["root"];

  for (let i = 0; i < count; i++) {
    const newId = `folder-${i}`;

    // Choose a random parent from the current level of parents
    const newParentId =
      currentLevelParents[
        Math.floor(Math.random() * currentLevelParents.length)
      ];

    data[newId] = { name: `Folder ${i}`, children: [] };

    if (data[newParentId]) {
      data[newParentId].children.push(newId);
    } else {
      // Fallback to a valid parent if the random choice fails
      data["root"].children.push(newId);
    }

    // Occasionally add the new item to the list of parents for the next level
    if (Math.random() > 0.6) {
      currentLevelParents.push(newId);
    }

    // Reset parent list occasionally to keep the tree from getting too deep
    if (i % 20 === 0 && i !== 0) {
      currentLevelParents = Object.keys(data).filter(
        (id) => data[id].children.length < 5
      );
      if (currentLevelParents.length === 0) {
        currentLevelParents = ["root"];
      }
    }
  }

  return data;
};
export default function FileTree() {
  const [nodes] = useState(() => generateTreeData(600));
  const parentRef = useRef<HTMLDivElement>(null);

  const tree = useTree({
    rootItemId: "root",
    dataLoader: {
      getItem: (itemId) => nodes[itemId],
      getChildren: (itemId) => nodes[itemId]?.children || [],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: () => true,
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
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

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow dark mt-1">
      
        <Tree indent={indent} tree={tree} >
         
            {tree.getItems().map((item) => {
              return (
                <TreeItem key={item.getId()} item={item} className="mr-2.5 ">
                  <TreeItemLabel />
                </TreeItem>
              );
            })}
        </Tree>
      
    </div>
  );
}

