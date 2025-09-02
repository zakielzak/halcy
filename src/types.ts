export interface ImageImportData {
  id: string;
  path: string;
  filename: string;
  width: number;
  height: number;
  parentDirPath: string;
  sourcePath: string; // Add the new field
}

export interface FolderImportData {
  id: string;
  path: string;
  name: string;
  parentId: string | null;
 /*  description: string | null; */
}

export interface ImportResult {
  folders: FolderImportData[];
  images: ImageImportData[];
  pathLinks: { [key: string]: string };
}
