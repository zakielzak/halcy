use std::{fs, path::{Path, PathBuf}};

use walkdir::WalkDir;
use rayon::prelude::*;

#[tauri::command]
async fn import_images(source_dir: String, dest_dir: String) -> Result<u32, String> {
    let dest_path = Path::new(&dest_dir).join("images");

    if !dest_path.exists() {
        return Err("Destination directory does not exist".to_string());
    }

    let valid_extensions = vec!["jpg", "jpeg", "png", "gif", "jfif", "webp"];
    
 
    let paths: Vec<PathBuf> = WalkDir::new(&source_dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .map(|e| e.path().to_path_buf())
        .collect();


    let imported_count: u32 = paths
        .par_iter()
        .map(|path| {
            if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                if valid_extensions.contains(&ext.to_lowercase().as_str()) {
                    let file_name = path.file_name().unwrap();
                    let dest_file = dest_path.join(file_name);
                    
                    match fs::copy(&path, &dest_file) {
                        Ok(_) => 1,
                        Err(e) => {
                            eprintln!("Failed to copy file {:?}: {}", path, e);
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
fn create_library(library_path: String) -> Result<(), String> {

    let path = Path::new(&library_path);

    // Check if the dir already exists
    if path.exists() {
        return Err("A library with that name already exists in this location.".into());
    }

    fs::create_dir_all(path).map_err(|e| format!("Failed to create directory: {}", e))?;

    let images_path = path.join("images");

    fs::create_dir_all(&images_path)
         .map_err(|e| format!("Failed to create images directory: {}", e))?;


    //Todo:  Start database sqlite for library
    let db_path = path.join("metadata.sqlite");

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_library, import_images])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
