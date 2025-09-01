use std::{
    collections::HashMap, fs, path::{Path, PathBuf}
};
use uuid::Uuid;

use tauri_plugin_sql::{Builder, Migration, MigrationKind};

use serde::{Serialize, Deserialize};
use sqlx::{
    migrate,
    sqlite::SqlitePool
};

use rayon::prelude::*;
use tauri::{image::Image, AppHandle};
use tauri_plugin_fs::FsExt;
use walkdir::{WalkDir, DirEntry as WalkDirEntry};
use image::ImageReader;

#[derive(Serialize, Deserialize, Debug)]
pub struct ImageImportData {
    pub id: String,
    pub path: String, // New destination path
    pub source_path: String, // Original source path
    pub filename: String, 
    pub width: u32,
    pub heigth: u32,
    pub parent_dir_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FolderImportData {
    pub id: String,
    pub path: String, 
    pub name: String,
    pub parent_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LibraryImportResult {
    pub folders: Vec<FolderImportData>,
    pub images: Vec<ImageImportData>,
   pub path_to_id: std::collections::HashMap<String, String>,

}

fn get_image_files(dir: &str) -> impl ParallelIterator<Item = WalkDirEntry> {
    let valid_extensions = vec!["jpg", "jpeg", "png", "gif", "jfif", "webp"];

    WalkDir::new(dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .par_bridge()
        .filter(move |entry| {
            if let Some(ext) = entry.path().extension().and_then(|s| s.to_str()) {
                valid_extensions.contains(&ext.to_lowercase().as_str())
            } else {
                false
            }
        })
}



#[tauri::command]
fn scan_library_images(library_path: String) -> Result<Vec<String>, String> {
    if !Path::new(&library_path).exists() {
        return Err("Library path does not exist.".to_string());
    }

    let image_paths: Vec<String> = get_image_files(&library_path)
        .map(|entry| entry.path().to_string_lossy().to_string())
        .collect();

    Ok(image_paths)
}

//---
#[tauri::command]
fn import_images(source_dir: String, dest_dir: String) -> Result<LibraryImportResult, String> {
     let mut folders: Vec<FolderImportData> = Vec::new();
    let mut images: Vec<ImageImportData> = Vec::new();
    let source_path = Path::new(&source_dir);
    let dest_path_for_images = Path::new(&dest_dir).join("images");

    fs::create_dir_all(&dest_path_for_images)
        .map_err(|e| format!("Failed to create images directory: {}", e))?;

    let mut path_to_id: HashMap<String, String> = HashMap::new();

    // 1. Explicitly process the root directory first to ensure it's in the map.
    let root_path_str = source_path.to_string_lossy().to_string();
    let root_id = Uuid::new_v4().to_string();
    folders.push(FolderImportData {
        id: root_id.clone(),
        path: root_path_str.clone(),
        name: source_path.file_name().unwrap_or_default().to_string_lossy().to_string(),
        parent_id: None,
    });
    path_to_id.insert(root_path_str.clone(), root_id);

    // 2. Walk the directory tree from the second level.
    for entry in WalkDir::new(source_path).min_depth(1).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        let path_str = path.to_string_lossy().to_string();

        if path.is_dir() {
            let id = Uuid::new_v4().to_string();
            let parent_path_str = path.parent()
                .ok_or_else(|| String::from("Parent directory not found for folder."))?
                .to_string_lossy()
                .to_string();
            
            let parent_id = path_to_id.get(&parent_path_str).cloned();

            folders.push(FolderImportData {
                id: id.clone(),
                path: path_str.clone(),
                name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                parent_id,
            });
            path_to_id.insert(path_str, id);

        } else if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            if ["png", "jpg", "jpeg", "gif", "bmp"].contains(&ext.to_lowercase().as_str()) {
                if let Ok(reader) = ImageReader::open(path) {
                    if let Ok(image_dims) = reader.into_dimensions() {
                        let (width, heigth) = image_dims;
                        let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                        
                        let dest_file_name = format!("{}.{}", Uuid::new_v4().to_string(), ext);
                        let dest_file_path = dest_path_for_images.join(&dest_file_name);
                        
                        fs::copy(path, &dest_file_path)
                            .map_err(|e| format!("Failed to copy file from {:?} to {:?}: {}", path, dest_file_path, e))?;

                        let parent_dir = path.parent()
                            .ok_or_else(|| String::from("Parent directory not found for image."))?;
                        let parent_dir_path = parent_dir.to_string_lossy().to_string();

                        let image_id = Uuid::new_v4().to_string();
                        
                        images.push(ImageImportData {
                            id: image_id.clone(),
                            path: dest_file_path.to_string_lossy().to_string(),
                            source_path: path_str.clone(),
                            filename: file_name.clone(),
                            width,
                            heigth,
                            parent_dir_path: parent_dir_path.clone(),
                        });
                        
                        path_to_id.insert(path_str, image_id);
                    }
                }
            }
        }
    }
    
    Ok(LibraryImportResult { folders, images, path_to_id })


  /*   let dest_path = Path::new(&dest_dir).join("images");

    if !dest_path.exists() {
        return Err("Destination directory does not exist.".to_string());
    }

    let imported_data: Vec<ImageImportData> = get_image_files(&source_dir)
        .filter_map(|entry| {
            let file_name = entry.path().file_name().unwrap();
            let dest_file = dest_path.join(file_name);

            // Intenta copiar el archivo y obtener sus dimensiones.
            match fs::copy(entry.path(), &dest_file) {
                Ok(_) => {
                    if let Ok(reader) = ImageReader::open(&dest_file) {
                        if let Ok(image) = reader.into_dimensions() {
                            let (width, heigth) = image;
                            return Some(ImageImportData {
                                path: dest_file.to_string_lossy().to_string(),
                                filename: file_name.to_string_lossy().to_string(),
                                width,
                                heigth,
                            });
                        }
                    }
                    // Si falla la lectura, devuelve un valor nulo.
                    None
                },
                Err(e) => {
                    eprintln!("Failed to copy file {:?}: {}", entry.path(), e);
                    None
                }
            }
        })
        .collect();

    Ok(imported_data) */
}

/* 

#[tauri::command]
fn import_images(source_dir: String, dest_dir: String) -> Result<u32, String> {
    let dest_path = Path::new(&dest_dir).join("images");

    if !dest_path.exists() {
        return Err("Destination directory does not exist.".to_string());
    }

    let valid_extensions = vec!["jpg", "jpeg", "png", "gif", "jfif", "webp"];

    let imported_count: u32 = WalkDir::new(&source_dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .par_bridge()
        .map(|entry| {
            if let Some(ext) = entry.path().extension().and_then(|s| s.to_str()) {
                if valid_extensions.contains(&ext.to_lowercase().as_str()) {
                    let file_name = entry.path().file_name().unwrap();
                    let dest_file = dest_path.join(file_name);

                    match fs::copy(&entry.path(), &dest_file) {
                        Ok(_) => 1,
                        Err(e) => {
                            eprintln!("Failed to copy file {:?}: {}", entry.path(), e);
                            0
                        }
                    }
                } else {
                    0
                }
            } else {
                0
            }
        })
        .sum();

    Ok(imported_count)
}

#[tauri::command]
fn scan_library_images(library_path: String) -> Result<Vec<String>, String> {
    let path = Path::new(&library_path);
    if !path.exists() {
        return Err("Library path does not exist.".to_string());
    }

    let valid_extensions = vec!["jpg", "jpeg", "png", "gif", "jfif", "webp"];

    let image_paths: Vec<String> = WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .par_bridge()
        .filter_map(|entry| {
            if let Some(ext) = entry.path().extension().and_then(|s| s.to_str()) {
                if valid_extensions.contains(&ext.to_lowercase().as_str()) {
                    return Some(entry.path().to_string_lossy().to_string());
                }
            }
            None
        })
        .collect();

    Ok(image_paths)
} */

#[tauri::command]
fn create_library(app: AppHandle, library_path: String) -> Result<String, String> {
    let path = Path::new(&library_path);

    // Check if the dir already exists
    if path.exists() {
        return Err("A library with that name already exists in this location.".into());
    }

    fs::create_dir_all(path).map_err(|e| format!("Failed to create directory: {}", e))?;

    let images_path = path.join("images");

    fs::create_dir_all(&images_path)
        .map_err(|e| format!("Failed to create images directory: {}", e))?;

    // Grant the webview access to the new library directory
    app.fs_scope()
        .allow_directory(&path, true) // `true` for recursive access
        .map_err(|e| format!("Failed to grant access to library: {}", e))?;

    //Todo:  Start database sqlite for library
    let db_path = path.join("library.db");

    Ok(db_path.to_string_lossy().to_string().replace("\\", "/"))
}

#[tauri::command]
async fn run_migrations(db_path: String) -> Result<(), String> {
    // 1. Create a connection pool for the dynamic database path.
    let db_url = format!("sqlite:{}", db_path);
    let pool = SqlitePool::connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to database pool: {}", e))?;

    // 2. This macro will discover and run all migration files
    // in the 'migrations' directory relative to the Cargo.toml file.
    migrate!()
        .run(&pool)
        .await
        .map_err(|e| format!("Failed to run migrations: {}", e))?;

    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let migrations = vec![
        Migration {
            version: 1,
            description: "create images table",
            sql: "
            CREATE TABLE IF NOT EXISTS images (
               id INTEGER PRIMARY KEY,
               filename TEXT NOT NULL,
               path TEXT NOT NULL,
               width TEXT NOT NULL,
               heigth TEXT NOT NULL
            );",
            kind: MigrationKind::Up,
        },
    ];

    


    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new()
                 .add_migrations("sqlite:library.db", migrations)
                .build()
        )
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_library,
            import_images,
            scan_library_images,
            run_migrations
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
