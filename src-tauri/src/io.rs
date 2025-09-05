use crate::models::*;
use anyhow::{Context, Result};
use rayon::prelude::*;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};
use tokio::fs;
use std::fs as stdfs;
use uuid::Uuid;
use walkdir::WalkDir;
use chrono::{DateTime, Utc};

// ---------- static fast extension check ------
const IMAGE_EXTS: &[&str] = &["bmp", "gif", "jfif", "jpeg", "jpg", "png", "webp"];

#[inline]
fn has_img_ext(p: &Path) -> bool {
    p.extension()
        .and_then(|s| s.to_str())
        .map(|e| {
            IMAGE_EXTS
                .binary_search(&e.to_ascii_lowercase().as_str())
                .is_ok()
        })
        .unwrap_or(false)
}

// Returns image paths **without** allocating intermediate strings.
pub fn collect_image_paths(root: &Path) -> Vec<PathBuf> {
    WalkDir::new(root)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file() && has_img_ext(e.path()))
        .par_bridge()
        .map(|e| e.into_path())
        .collect()
}

// Read dimensions
fn read_dim(path: &Path) -> Result<(u32, u32)> {
    image::image_dimensions(path).with_context(|| format!("header {:?}", path))
}

fn read_file_dates(path: &Path) -> Result<(String, String)> {
    let metadata = stdfs::metadata(path)?;
    let creation_date: DateTime<Utc> = metadata.created()?.into();
    let modification_date: DateTime<Utc> = metadata.modified()?.into();
    Ok((creation_date.to_string(), modification_date.to_string()))
}

pub async fn import_folder(source: &Path, dest: &Path) -> Result<ImportResult> {
    let images_dir = dest.join("images");
    fs::create_dir_all(&images_dir).await?;

    let mut folders = Vec::new();
    let mut path_links = HashMap::new();

    // 1: Walk directories
    let root_id = Uuid::new_v4().to_string();
    path_links.insert(source.to_string_lossy().into_owned(), root_id.clone());
    folders.push(Folder {
        id: root_id,
        path: source.to_string_lossy().into_owned(),
        name: source
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        parent_id: None,
        order_by: "imported_date".to_string(),
        is_ascending: 1.to_string(),
    });

    for entry in WalkDir::new(source).min_depth(1) {
        let entry = entry?;
        let k = entry.path().to_string_lossy().into_owned();
        if entry.file_type().is_dir() {
            let id = Uuid::new_v4().to_string();
            let parent_id = entry
                .path()
                .parent()
                .and_then(|p| path_links.get(&p.to_string_lossy().into_owned()).cloned());
            folders.push(Folder {
                id: id.clone(),
                path: k.clone(),
                name: entry.file_name().to_string_lossy().into_owned(),
                parent_id,
                  order_by: "imported_date".to_string(),
        is_ascending: 1.to_string(),
            });
            path_links.insert(k, id);
        }
    }

    // 2: Parallel image copy
    let source_paths = collect_image_paths(source);
    let image_tasks: Vec<_> = source_paths
        .into_par_iter()
        .filter_map(|src_path| {
            if !has_img_ext(&src_path) {
                return None;
            }

            let (creation_date, modified_date) = match read_file_dates(&src_path) {
                Ok(d) => d,
                Err(_) => return None,
            };

            let dim = match read_dim(&src_path) {
                Ok(d) => d,
                Err(_) => return None,
            };
            let ext = src_path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("bin");
            let dest_name = format!("{}.{}", Uuid::new_v4(), ext);
            let dest_path = images_dir.join(&dest_name);
            Some((src_path, dest_path, dim, creation_date, modified_date))
        })
        .collect();

    // 3: Execute copies
    let handles: Vec<_> = image_tasks
        .into_iter()
        .map(|(src, dst, (w, h), created, modified)| {
            tokio::task::spawn_blocking(move || {
                std::fs::copy(&src, &dst)?;
                Ok::<_, anyhow::Error>((src, dst, w, h, modified, created))
            })
        })
        .collect();

    let mut images = Vec::with_capacity(handles.len());
    for h in handles {
        let (src, dst, width, height , modified_date, creation_date) = h.await??;
        let src_str = src.to_string_lossy().into_owned();
        let parent = src.parent().unwrap().to_string_lossy().into_owned();
        let img_id = Uuid::new_v4().to_string();
        path_links.insert(src_str.clone(), img_id.clone());
        images.push(Image {
            id: img_id,
            path: dst.to_string_lossy().into_owned(),
            source_path: src_str,
            filename: src.file_name().unwrap().to_string_lossy().into_owned(),
            width,
            height,
            parent_dir_path: parent,
            imported_date: Utc::now().to_string(),
            modified_date,
            creation_date
        });
    }

    Ok(ImportResult {
        folders,
        images,
        path_links,
    })
}

/* fn uuid_batch(n: usize) -> Vec<Uuid> {
    (0..n).map(|_| Uuid::new_v4()).collect()
}
 */
