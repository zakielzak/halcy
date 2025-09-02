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
  height: number;
  //ext: string;
  //description: string;
  //url_origin: string;
  //is_deleted: boolean;
  //palettes_json: string;
}

export interface FolderRecord {
  id: string;
  name: string;
  parentId: string | null;
  /*   description: string | null; */
  /*  imported_date: string;
  modification_date: string;
 */
}

const pools = new Map<string, Database>();

export async function connect(dbPath: string): Promise<Database> {
  try {
    let db = pools.get(dbPath);
    if (!db) {
      db = await Database.load(`sqlite:${dbPath}`);
      await db.execute("PRAGMA journal_mode=WAL");
      await db.execute("PRAGMA synchronous=NORMAL");
      pools.set(dbPath, db);
    }
    return db;
  } catch (e) {
    console.error("Failed to connect to the database:", e);
    throw new Error("Failed to establish a database connection.");
  }
}

export const fetchFoldersFromDb = (path: string) =>
  connect(path).then((db) =>
    db.select<FolderRecord[]>("SELECT * FROM folders")
  );

export const fetchAllImages = (path: string) =>
  connect(path).then((db) => db.select<ImageRecord[]>("SELECT * FROM images"));

export const insertImages = async (
  path: string,
  rows: ImageRecord[]
): Promise<void> => {
  if (!rows.length) return;
  const db = await connect(path);
  const sql = `INSERT INTO images(id, filename, path, width, height)
               VALUES ${Array(rows.length).fill("(?,?,?,?,?)").join(",")}`;
  const params: any[] = [];
  for (const r of rows)
    params.push(r.id, r.filename, r.path, r.width, r.height);
  await db.execute(sql, params);
};

export const insertFolders = async (
  path: string,
  rows: FolderRecord[]
): Promise<void> => {
  if (!rows.length) return;
  const db = await connect(path);
  const sql = `INSERT INTO folders(id, name, parent_id)
               VALUES ${Array(rows.length).fill("(?,?,?)").join(",")}`;
  const params: any[] = [];
  for (const r of rows) params.push(r.id, r.name, r.parentId);
  await db.execute(sql, params);
};

export const linkImagesToFolders = async (
  path: string,
  links: { folder_id: string; image_id: string }[]
): Promise<void> => {
  if (!links.length) return;
  const db = await connect(path);
  const sql = `INSERT INTO folder_images(folder_id, image_id)
               VALUES ${Array(links.length).fill("(?,?)").join(",")}`;
  const params: any[] = [];
  for (const l of links) params.push(l.folder_id, l.image_id);
  await db.execute(sql, params);
};
