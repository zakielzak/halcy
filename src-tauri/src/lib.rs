use std::{fs, path::Path};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
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
        .invoke_handler(tauri::generate_handler![create_library])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
