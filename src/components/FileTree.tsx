import React from "react";
import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";

import { Tree, TreeItem, TreeItemLabel } from "@/components/ui/tree";

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

export default function FileTree() {
  const tree = useTree<Item>({
    initialState: {
      expandedItems: ["engineering", "frontend", "design-system"],
    },
    indent,
    rootItemId: "company",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId].children ?? [],
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow dark mt-1">
      <Tree indent={indent} tree={tree}>
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

/* import React, { useState } from "react";

// Define the shape of your file/folder data
export interface FileNode {
  id: string;
  name: string;
  isFolder: boolean;
  parentId: string | null;
  children?: FileNode[];
}

// Dummy data for a simple file tree
const initialData: FileNode[] = [
  {
    id: "1",
    name: "Images",
    isFolder: true,
    parentId: null,
    children: [
      { id: "4", name: "photo1.jpg", isFolder: false, parentId: "1" },
      {
        id: "5",
        name: "subfolder",
        isFolder: true,
        parentId: "1",
        children: [],
      },
    ],
  },
  { id: "2", name: "Documents", isFolder: true, parentId: null, children: [] },
  { id: "3", name: "project-notes.txt", isFolder: false, parentId: null },
];

interface FileTreeNodeProps {
  node: FileNode;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node }) => {
  return (
    <div
      className={`p-2 pl-4 border-l-2 my-1 cursor-pointer hover:bg-neutral-700
      ${node.isFolder ? "font-bold" : ""}
      `}
    >
      <span>
        {node.isFolder ? "📂 " : "📄 "} {node.name}
      </span>
      {node.isFolder && node.children && (
        <div className="pl-4">
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree = () => {
  const [nodes] = useState<FileNode[]>(initialData);

  return (
    <div className="file-tree bg-neutral-800 text-neutral-200 w-64 h-full p-4 overflow-y-auto">
      {nodes.map((node) => (
        <FileTreeNode key={node.id} node={node} />
      ))}
    </div>
  );
};
 */
