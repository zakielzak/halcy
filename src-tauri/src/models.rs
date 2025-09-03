use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Image {
    pub id: String,
    pub path: String,
    pub source_path: String, //??????
    pub filename: String,
    pub width: u32,
    pub height: u32,
    pub parent_dir_path: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Folder {
    pub id: String,
    pub path: String, //????
    pub name: String,
    pub parent_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    pub folders: Vec<Folder>,
    pub images: Vec<Image>,
    pub path_links: std::collections::HashMap<String, String>,
}
