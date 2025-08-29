import Database from "@tauri-apps/plugin-sql";

export interface ImageRecord {
  id: number;
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


export async function getDb(dbPath: string): Promise<Database> {
    try {
        const db = await Database.load(`sqlite:${dbPath}`);
        return db;
    } catch (e) {
        console.error("Failed to connect to the database:", e);
        throw new Error("Failed to establish a database connection.")
    }
}



export async function fetchAllImages(dbPath: string): Promise<ImageRecord[]> {
    const db = await getDb(dbPath)
    try {
        const images = await db.select<ImageRecord[]>("SELECT * FROM images");
        return images;
    } catch (e) {
        console.error("Error fetching images from the database:", e)
        return []
    }
}

export async function insertImages(dbPath: string, imagesData: Omit<ImageRecord, 'id'>[]): Promise<void> {

    if (imagesData.length === 0) {
        console.log("No images to insert.")
        return
    }

    const db = await getDb(dbPath);
    try {
      const placeholders = imagesData.map(() => "(?, ?, ?, ?)").join(",");

      const sql = `
            INSERT INTO images (filename, path, width, heigth)
            VALUES ${placeholders}
        `;

      // Flatten the array of image data into a single array of parameters
      const params = imagesData.flatMap((img) => [
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