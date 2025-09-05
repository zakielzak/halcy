use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Image {
    pub id: String,
    pub path: String,
    pub source_path: String, //??????
    pub filename: String,
    pub width: u32,
    pub height: u32,
    pub parent_dir_path: String,
    pub imported_date: String,
    pub modified_date: String,
    pub creation_date: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Folder {
    pub id: String,
    pub path: String, //????
    pub name: String,
    pub parent_id: Option<String>,
    pub order_by: String,
    pub is_ascending: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ImportResult {
    pub folders: Vec<Folder>,
    pub images: Vec<Image>,
    pub path_links: std::collections::HashMap<String, String>,
}
