export interface ImageImportData {
  id: string;
  path: string;
  filename: string;
  width: number;
  heigth: number;
  parent_dir_path: string;
  source_path: string; // Add the new field
}

export interface FolderImportData {
  id: string;
  path: string;
  name: string;
  parent_id: string | null;
  description: string | null;
}

export interface LibraryImportResult {
  folders: FolderImportData[];
  images: ImageImportData[];
  path_to_id: { [key: string]: string };
}
