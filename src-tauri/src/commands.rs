use std::path::Path;
use tauri::AppHandle;
use tauri_plugin_fs::FsExt;


use crate::{io, models::*};

#[tauri::command]
pub async fn create_library(app: AppHandle, library_path: String) -> Result<String, String> {
    let root = Path::new(&library_path);
    if root.exists() {
        return Err("Library path already exists".into());
    }
    tokio::fs::create_dir_all(root)
         .await
         .map_err(|e| format!("create dir failed: {e}"))?;
    tokio::fs::create_dir_all(root.join("images"))
         .await
         .map_err(|e| format!("create images dir failed: {e}"))?;

    // Grant the webview access to the new library directory
    app.fs_scope()
        .allow_directory(root, true)
        .map_err(|e| format!("scope error: {e}"))?;

    Ok(root.join("library.db").to_string_lossy().replace('\\', "/"))
}

#[tauri::command]
pub async fn run_migrations(db_path: String) -> Result<(), String> {
    
    let url = format!("sqlite:{}", db_path);
    let pool = sqlx::SqlitePool::connect(&url)
        .await
        .map_err(|e| format!("cannot open pool: {e}"))?;
    sqlx::migrate!()
        .run(&pool)
        .await
        .map_err(|e| format!("migration failed: {e}"))?;

    Ok(())
}

#[tauri::command]
pub async fn import_images(
    source_dir: String,
    dest_dir: String,
) -> Result<ImportResult, String> {
    io::import_folder(Path::new(&source_dir), Path::new(&dest_dir))
        .await
        .map_err(|e| e.to_string())
}
