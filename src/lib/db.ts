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
  imported_date: string;
  modified_date: string;
  creation_date: string;
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
  order_by: string;
  is_ascending: number
  /*   description: string | null; */
  /*  imported_date: string;
  modification_date: string;
 */

  
}


export interface Counts {
  allImages: number;
  uncategorized: number;
  /* trash: number; */
  folders: Record<string, number>;
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

export const fetchFolders = async (path: string) => {
  const db = await connect(path);


  return db.select<FolderRecord[]>("SELECT * FROM folders");
};


export const fetchImages = async (
  path: string,
  type: "all" | "uncategorized" | "byFolder" | "byId",
  id: string | undefined,
  orderBy: string = "imported_date",
  isAscending: boolean = false
): Promise<ImageRecord[]> => {
  const db = await connect(path);
  /*   let sql = "";
  let params: any[] = [];

  const sortDirection = isAscending ? "ASC" : "DESC";
  const orderClause = `ORDER BY ${orderBy} ${sortDirection}`;

  switch (type) {
    case "all":
      sql = `SELECT * FROM images ${orderClause};`;
      break;
    case "uncategorized":
      sql = `SELECT * FROM images WHERE id NOT IN (SELECT image_id FROM folder_images) ${orderClause};`;
      break;

    case "byId":
    case "byFolder":
      if (!id) throw new Error("Folder ID is required for 'byFolder' type");
      sql = `
        SELECT
      i.*
      FROM images i
      JOIN folder_images fi ON i.id = fi.image_id
      WHERE fi.folder_id = ? ${orderClause};
      `;
      params = [id];
      break;
    default:
      throw new Error(`Invalid image query type: ${type}`);
  }
 */
  const SQL_QUERIES = {
    all: "SELECT * FROM images",
    uncategorized:
      "SELECT * FROM images WHERE id NOT IN (SELECT image_id FROM folder_images)",
    byFolder:
      "SELECT i.* FROM images i JOIN folder_images fi ON i.id = fi.image_id WHERE fi.folder_id = ?",
    byId: "SELECT * FROM images WHERE id = ?",
  };
  // Gets the SQL template from the map or throws an error if not found.
  const sqlTemplate = SQL_QUERIES[type];
  if (!sqlTemplate) {
    throw new Error(`Invalid image query type: ${type}`);
  }

  // Determines the sort direction.
  const sortDirection = isAscending ? "ASC" : "DESC";
  const orderClause = `ORDER BY ${orderBy} ${sortDirection}`;

  let sql = `${sqlTemplate} ${orderClause};`;
  let params: any[] = [];

  // Handles parameters for specific query types.
  if (type === "byFolder" || type === "byId") {
    if (!id) throw new Error(`${type} query type requires an ID.`);
    params = [id];
  }

  return await db.select<ImageRecord[]>(sql, params);
};

export const updateFolder = async (
  dbPath: string,
  folderId: string,
  orderBy: string,
  isAscending: boolean
) => {
  const db = await connect(dbPath);
  const isAscendingInt = isAscending ? 1 : 0;
  await db.execute(
    `UPDATE folders SET order_by = $1, is_ascending = $2 WHERE id = $3`, 
    [orderBy, isAscendingInt, folderId]
  )
}

export const insertImages = async (
  path: string,
  rows: ImageRecord[]
): Promise<void> => {
  if (!rows.length) return;
  const db = await connect(path);
  const sql = `INSERT INTO images(id, filename, path, width, height, imported_date, modified_date, creation_date)
               VALUES ${Array(rows.length).fill("(?,?,?,?,?,?,?,?)").join(",")}`;
  const params: any[] = [];
  for (const r of rows)
    params.push(r.id, r.filename, r.path, r.width, r.height, r.imported_date, r.modified_date, r.creation_date);
   await db.execute(sql, params);
};

export const insertFolders = async (
  path: string,
  rows: FolderRecord[]
): Promise<void> => {
  if (!rows.length) return;
  console.log(rows)
  const db = await connect(path);
  const sql = `INSERT INTO folders(id, name, parent_id, order_by, is_ascending)
               VALUES ${Array(rows.length).fill("(?,?,?,?,?)").join(",")}`;
  const params: any[] = [];
  for (const r of rows) params.push(r.id, r.name, r.parent_id, r.order_by, r.is_ascending);
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

export const fetchImagesByFolder = async (path: string, folderId: string) => {
  const db = await connect(path);
  return db.select<ImageRecord[]>(
    `SELECT
      i.*
      FROM images i
      JOIN folder_images fi ON i.id = fi.image_id
      WHERE fi.folder_id = ?;
    `,
    [folderId]
  );
};

export const fetchCounts = async (dbPath: string): Promise<Counts> => {
  try {
    const db = await connect(dbPath);

    const results: {
      all_images_count: number;
      uncategorized_count: number;
    }[] = await db.select(`
      SELECT
        (SELECT COUNT(*) FROM images) as all_images_count,
        (SELECT COUNT(*) FROM images WHERE id NOT IN (SELECT image_id FROM folder_images)) as uncategorized_count;
    `);

    const foldersQuery: { folder_id: string; count: number }[] =
      await db.select(
        "SELECT folder_id, COUNT(*) as count FROM folder_images GROUP BY folder_id;"
      );

    const counts = results[0];
    const foldersCount = foldersQuery.reduce(
      (acc, folder) => {
        acc[folder.folder_id] = folder.count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      allImages: counts?.all_images_count ?? 0,
      uncategorized: counts?.uncategorized_count ?? 0,
      folders: foldersCount,
    };
  } catch (error) {
    console.error("Error in fetchCounts:", error);
    throw new Error("Failed to fetch image counts.");
  }
};