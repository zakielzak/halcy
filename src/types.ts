export interface ImageImportData {
  id: string;
  path: string;
  filename: string;
  width: number;
  height: number;
  parent_dir_path: string;
  source_path: string; // Add the new field
  imported_date: string;
  modified_date: string;
  creation_date: string;
}

export interface FolderImportData {
  id: string;
  path: string;
  name: string;
  parent_id: string | null;
  order_by: string;
  is_ascending: number;
 /*  description: string | null; */
}

export interface ImportResult {
  folders: FolderImportData[];
  images: ImageImportData[];
  path_links: { [key: string]: string };
}
