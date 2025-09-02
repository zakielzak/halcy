import Database from "@tauri-apps/plugin-sql";

export interface ImageRecord {
  id: string;
  filename: string;
  path: string;
  //folder_id: number;
  //size: number;
  //btime: number;
  //mtime: number;
  width: number;
  heigth: number;
  //ext: string;
  //description: string;
  //url_origin: string;
  //is_deleted: boolean;
  //palettes_json: string;
}

export interface FolderRecord {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
 /*  imported_date: string;
  modification_date: string;
 */
}


export async function getDb(dbPath: string): Promise<Database> {
  try {
    console.log("Valor actual en getDB:", dbPath)
    const db = await Database.load(`sqlite:${dbPath}`);
    return db;
  } catch (e) {
    console.error("Failed to connect to the database:", e);
    throw new Error("Failed to establish a database connection.");
  }
}

export async function fetchFoldersFromDb(
  dbPath: string
): Promise<FolderRecord[]> {
  const db = await getDb(dbPath);
  try {
    const folders = await db.select<FolderRecord[]>("SELECT * FROM folders");
    return folders;
  } catch (e) {
    console.error("Error fetching folders from the database:", e);
    return [];
  }
}


export async function fetchAllImages(dbPath: string): Promise<ImageRecord[]> {
  const db = await getDb(dbPath);
  try {
    console.log("Esto siempre sucede de manera correcta")
    const images = await db.select<ImageRecord[]>("SELECT * FROM images");
    return images;
  } catch (e) {
    console.error("Error fetching images from the database:", e);
    return [];
  }
}

export async function insertImages(
  dbPath: string,
  imagesData: ImageRecord[]
): Promise<void> {
  if (imagesData.length === 0) {
    console.log("No images to insert.");
    return;
  }

  const db = await getDb(dbPath);
  try {
    const placeholders = imagesData.map(() => "(?, ?, ?, ?, ?)").join(",");

    const sql = `
            INSERT INTO images (id, filename, path, width, heigth)
            VALUES ${placeholders}
        `;

    // Flatten the array of image data into a single array of parameters
    const params = imagesData.flatMap((img) => [
      img.id,
      img.filename,
      img.path,
      img.width,
      img.heigth,
    ]);

    await db.execute(sql, params);

    console.log(`Successfully inserted ${imagesData.length} images.`);
  } catch (e) {
    console.error("Error inserting image into the database:", e);
    throw new Error("Failed to insert image.");
  }
}
export async function insertFolders(
  dbPath: string,
  foldersData: FolderRecord[]
): Promise<void> {
  if (foldersData.length === 0) return;

  const db = await getDb(dbPath);
  try {
    // 1. Sort folders to ensure parent nodes are processed first.
    const sortedFolders = foldersData.sort((a, b) => {
      const aIsRoot = a.parent_id === null;
      const bIsRoot = b.parent_id === null;
      if (aIsRoot && !bIsRoot) return -1;
      if (!aIsRoot && bIsRoot) return 1;
      return 0;
    });

    const placeholders = sortedFolders.map(() => "(?, ?, ?)");
    const sql = `
      INSERT INTO folders (id, name, parent_id)
      VALUES ${placeholders.join(", ")}
    `;

    const params = sortedFolders.flatMap((folder) => [
      folder.id,
      folder.name,
      folder.parent_id === null ? null : folder.parent_id,
    ]);

    await db.execute(sql, params);
  } catch (e) {
    console.error("Error inserting folders:", e);
    throw new Error("Failed to insert folders.");
  }
}
export async function linkImagesToFolders(
  dbPath: string,
  links: { folder_id: string; image_id: string }[]
): Promise<void> {
  if (links.length === 0) return;
  const db = await getDb(dbPath);
  try {
    const placeholders = links.map(() => "(?, ?)").join(",");
    const sql = `
            INSERT INTO folder_images (folder_id, image_id)
            VALUES ${placeholders}
        `;
    const params = links.flatMap((link) => [link.folder_id, link.image_id]);
    await db.execute(sql, params);
  } catch (e) {
    console.error("Error linking images to folders:", e);
    throw new Error("Failed to link images to folders.");
  }
}