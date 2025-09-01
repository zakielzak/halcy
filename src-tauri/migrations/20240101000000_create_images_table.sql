CREATE TABLE IF NOT EXISTS folders (
   id TEXT PRIMARY KEY NOT NULL UNIQUE,
   name TEXT NOT NULL,
   parent_id TEXT,
   description TEXT,

   FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS images (
   id TEXT PRIMARY KEY,
   filename TEXT NOT NULL,
   path TEXT NOT NULL,
   width TEXT NOT NULL,
   heigth TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS folder_images (
   folder_id TEXT NOT NULL,
   image_id TEXT NOT NULL,

   PRIMARY KEY (folder_id, image_id),
   FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
   FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);