use anyhow::{Context, Result};
use rayon::prelude::*;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};
use walkdir::WalkDir;
/* use rayon:: */

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

//Generate UUID
/* fn next_id() -> String {
    Uuid::new_v4().to_string()
}
 */

 
/* fn uuid_batch(n: usize) -> Vec<Uuid> {
    (0..n).map(|_| Uuid::new_v4()).collect()
}
 */
/* 
 tokio::task::spawn_blocking({
    let src = path.clone();
    let dst = dest_file_path.clone();
    move || std::fs::copy(src, dst)
})
.await?
.context("copy failed")?; */

// High-speed folder import.
/* pub async fn import_folder(
    source: &Path,
    dest:   &Path,
) -> Result<LibraryImportResult> {
    let images_dir = dest.join("images");
    fs::create_dir_all(&images_dir).await?;

    // -------- directory tree --------
    let mut folders = Vec::new();
    let mut path2id = HashMap::new();

    let root_id = UUID_CACHE.next().to_string();
    path2id.insert(source.to_string_lossy().into_owned(), root_id.clone());
    folders.push(FolderImportData {
        id:        root_id,
        path:      source.to_string_lossy().into_owned(),
        name:      source.file_name().unwrap_or_default().to_string_lossy().into_owned(),
        parent_id: None,
    });

    for entry in WalkDir::new(source).min_depth(1) {
        let entry = entry?;
        let k = entry.path().to_string_lossy().into_owned();
        if entry.file_type().is_dir() {
            let id = UUID_CACHE.next().to_string();
            let parent_id = entry
                .path()
                .parent()
                .and_then(|p| path2id.get(&p.to_string_lossy().into_owned()))
                .cloned();
            folders.push(FolderImportData {
                id:        id.clone(),
                path:      k.clone(),
                name:      entry.file_name().to_string_lossy().into_owned(),
                parent_id,
            });
            path2id.insert(k, id);
        }
    }

    // -------- image list --------
    let image_tasks: Vec<_> = collect_image_paths(source)
        .into_par_iter()
        .filter_map(|src_path| {
            let dim = fast_dim(&src_path).ok()?;
            let ext = src_path.extension()?.to_string_lossy().into_owned();
            let dest_name = format!("{}.{}", UUID_CACHE.next(), ext);
            let dest_path = images_dir.join(dest_name);
            Some((src_path, dest_path, dim))
        })
        .collect();

    // -------- copy files on blocking pool ----------
    let handles: Vec<_> = image_tasks
        .into_iter()
        .map(|(src, dst, (w, h))| {
            tokio::task::spawn_blocking(move || {
                std::fs::copy(&src, &dst)?;
                Ok::<_, anyhow::Error>((src, dst, w, h))
            })
        })
        .collect();

    let mut images = Vec::with_capacity(handles.len());
    for h in handles {
        let (src, dst, width, height) = h.await??;
        let src_str = src.to_string_lossy().into_owned();
        let parent = src.parent().unwrap().to_string_lossy().into_owned();
        let img_id = UUID_CACHE.next().to_string();
        path2id.insert(src_str.clone(), img_id.clone());
        images.push(ImageImportData {
            id: img_id,
            path: dst.to_string_lossy().into_owned(),
            source_path: src_str,
            filename: src.file_name().unwrap().to_string_lossy().into_owned(),
            width,
            height,
            parent_dir_path: parent,
        });
    }

    Ok(LibraryImportResult {
        folders,
        images,
        path_to_id: path2id,
    })
} */





// ---------- high-speed import ----------
/* pub async fn import_folder(
    source: &Path,
    dest:   &Path,
) -> Result<LibraryImportResult> {
    let images_dir = dest.join("images");
    fs::create_dir_all(&images_dir).await?;

    // ---------- Phase 1: walk directories ----------
    let mut folders = Vec::new();
    let mut path2id = HashMap::new();

    let root_id = UUID_CACHE.next().to_string();
    path2id.insert(source.to_string_lossy().into_owned(), root_id.clone());
    folders.push(FolderImportData {
        id:        root_id,
        path:      source.to_string_lossy().into_owned(),
        name:      source
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        parent_id: None,
    });

    for entry in WalkDir::new(source).min_depth(1) {
        let entry = entry?;
        let k = entry.path().to_string_lossy().into_owned();
        if entry.file_type().is_dir() {
            let id = UUID_CACHE.next().to_string();
            let parent_id = entry
                .path()
                .parent()
                .and_then(|p| path2id.get(&p.to_string_lossy().into_owned()))
                .cloned();
            folders.push(FolderImportData {
                id:        id.clone(),
                path:      k.clone(),
                name:      entry
                    .file_name()
                    .to_string_lossy()
                    .into_owned(),
                parent_id,
            });
            path2id.insert(k, id);
        }
    } */

    // ---------- Phase 2: parallel image copy + header ----------
  /*   let source_paths = collect_image_paths(source);
    let image_tasks: Vec<_> = source_paths
        .into_par_iter()
        .filter_map(|src_path| {
            if !has_img_ext(&src_path) {
                return None;
            }
            let dim = match fast_dim(&src_path) {
                Ok(d) => d,
                Err(_) => return None,
            };
            let ext = src_path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("bin");
            let dest_name = format!("{}.{}", UUID_CACHE.next(), ext);
            let dest_path = images_dir.join(&dest_name);
            Some((src_path, dest_path, dim))
        })
        .collect();

    // ---------- Phase 3: execute copies on blocking pool ----------
    let handles: Vec<_> = image_tasks
        .into_iter()
        .map(|(src, dst, (w, h))| {
            tokio::task::spawn_blocking(move || {
                std::fs::copy(&src, &dst)?;
                Ok::<_, anyhow::Error>((src, dst, w, h))
            })
        })
        .collect();

    let mut images = Vec::with_capacity(handles.len());
    for h in handles {
        let (src, dst, width, height) = h.await??;
        let src_str = src.to_string_lossy().into_owned();
        let parent = src
            .parent()
            .unwrap()
            .to_string_lossy()
            .into_owned();
        let img_id = UUID_CACHE.next().to_string();
        path2id.insert(src_str.clone(), img_id.clone());
        images.push(ImageImportData {
            id:            img_id,
            path:          dst.to_string_lossy().into_owned(),
            source_path:   src_str,
            filename:      src
                .file_name()
                .unwrap()
                .to_string_lossy()
                .into_owned(),
            width,
            height,
            parent_dir_path: parent,
        });
    }

    Ok(LibraryImportResult {
        folders,
        images,
        path_to_id: path2id,
    })
} */


// Core import routine.
/* pub async fn import_folder(
    source: &Path,
    dest:   &Path,
) -> Result<LibraryImportResult> {
    fs::create_dir_all(dest.join("images")).await?;

    let mut folders   = Vec::new();
    let mut images    = Vec::new();
    let mut path2id   = HashMap::new();

    let root_id = Uuid::new_v4().to_string();
    path2id.insert(
        source.to_string_lossy().into_owned(),
        root_id.clone(),
    );
    folders.push(FolderImportData {
        id:        root_id,
        path:      source.to_string_lossy().into_owned(),
        name:      source
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        parent_id: None,
    });

    for entry in WalkDir::new(source).min_depth(1) {
        let entry = entry?;
        let path  = entry.path();
        let k     = path.to_string_lossy().into_owned();

        if path.is_dir() {
            let id = Uuid::new_v4().to_string();
            let parent_id = path
                .parent()
                .and_then(|p| path2id.get(&p.to_string_lossy().into_owned()))
                .cloned();

            folders.push(FolderImportData {
                id:        id.clone(),
                path:      k.clone(),
                name:      path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .into_owned(),
                parent_id,
            });
            path2id.insert(k, id);
            continue;
        }

        if !has_image_ext(path) {
            continue;
        }

        let (width, height) = image::image_dimensions(path)
            .with_context(|| format!("cannot read header for {:?}", path))?;

        let stem = path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned();
        let ext = path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("bin");
        let dest_name = format!("{}.{}", Uuid::new_v4(), ext);
        let dest_path = dest.join("images").join(&dest_name);

        tokio::task::spawn_blocking({
            let src = path.to_path_buf();
            let dst = dest_path.clone();
            move || std::fs::copy(src, dst)
        })
        .await?
        .with_context(|| format!("copy {:?} -> {:?}", path, dest_path))?;

        let parent = path
            .parent()
            .ok_or_else(|| anyhow::anyhow!("no parent for {:?}", path))?
            .to_string_lossy()
            .into_owned();

        let img_id = Uuid::new_v4().to_string();
        images.push(ImageImportData {
            id:            img_id.clone(),
            path:          dest_path.to_string_lossy().into_owned(),
            source_path:   k.clone(),
            filename:      format!("{}.{}", stem, ext),
            width,
            height,
            parent_dir_path: parent,
        });
        path2id.insert(k, img_id);
    }

    Ok(LibraryImportResult {
        folders,
        images,
        path_to_id: path2id,
    })
} */

/* 
pub async fn import_folder(
    source: &Path,
    dest: &Path,
) -> Result<LibraryImportResult> {
    fs::create_dir_all(dest.join("images")).await?;

    let mut folders = Vec::new();
    let mut images = Vec::new();
    let mut path_to_id = HashMap::new();
    let root_id = Uuid::new_v4().to_string();

    // root folder
    path_to_id.insert(source.to_string_lossy().into_owned(), root_id.clone());
    folders.push(FolderImportData {
        id: root_id,
        path: source.to_string_lossy().into_owned(),
        name: source
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        parent_id: None,
    });

    // walk sub-folders & files
    for entry in WalkDir::new(source).min_depth(1) {
        let entry = entry?;
        let path = entry.path();
        let path_str = path.to_string_lossy().into_owned();

        if path.is_dir() {
            let id = Uuid::new_v4().to_string();
            let parent_id = path
                .parent()
                .and_then(|p| path_to_id.get(&p.to_string_lossy().into_owned()))
                .cloned();

            folders.push(FolderImportData {
                id: id.clone(),
                path: path_str.clone(),
                name: path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .into_owned(),
                parent_id,
            });
            path_to_id.insert(path_str, id);
            continue;
        }

        if !is_image(&entry) {
            continue;
        }

        let (width, height) = image::io::Reader::open(path)
            .with_context(|| format!("cannot open image {:?}", path))?
            .into_dimensions()
            .with_context(|| format!("cannot read dimensions of {:?}", path))?;

        let file_name = path
            .file_name()
            .ok_or_else(|| anyhow!("no filename for {:?}", path))?
            .to_string_lossy()
            .into_owned();
        let ext = path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("bin");
        let dest_file_name = format!("{}.{}", Uuid::new_v4(), ext);
        let dest_file_path = dest.join("images").join(&dest_file_name);

        tokio::task::spawn_blocking({
            let src = path.to_path_buf();
            let dst = dest_file_path.clone();
            move || std::fs::copy(src, dst)
        })
        .await?
        .with_context(|| format!("copying {:?} -> {:?}", path, dest_file_path))?;

        let parent_dir_path = path
            .parent()
            .ok_or_else(|| anyhow!("image has no parent dir {:?}", path))?
            .to_string_lossy()
            .into_owned();

        let image_id = Uuid::new_v4().to_string();
        images.push(ImageImportData {
            id: image_id.clone(),
            path: dest_file_path.to_string_lossy().into_owned(),
            source_path: path_str.clone(),
            filename: file_name,
            width,
            height,
            parent_dir_path,
        });
        path_to_id.insert(path_str, image_id);
    }

    Ok(LibraryImportResult {
        folders,
        images,
        path_to_id,
    })
} */