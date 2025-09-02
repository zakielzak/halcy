import { invoke } from "@tauri-apps/api/core";
import { useSetting } from "./useSettings";
import { open} from "@tauri-apps/plugin-dialog";
import { getLibraryName } from "@/lib/utils";
import { getDb, ImageRecord,  insertFolders,  insertImages, linkImagesToFolders } from "@/lib/db";
import { FolderImportData, LibraryImportResult } from "@/types";



export function useLibrary() {
  const [rootDir, setRootDir] = useSetting("rootDir", "");
  const [history, setHistory, updateHistory] = useSetting("libraryHistory", []);

  const selectLibrary = async (path: string) => {
    if (path === rootDir) return;

    await setRootDir(path);
    if (updateHistory) {
      await updateHistory((prev) => {
        const history = prev as string[];
        return [path, ...history.filter((p) => p !== path)];
      });
    }
  };

  const createNewLibrary = async () => {
    const name = prompt("Library name:");
    if (!name) return;

    const dir = await open({ directory: true, multiple: false });
    if (!dir) return;

    const path = `${dir}\\${name}.library`;

    try {
      const dbPath = await invoke<string>("create_library", {
        libraryPath: path,
      });

      await getDb(dbPath);
      await invoke("run_migrations", { dbPath });
      await selectLibrary(path);
    } catch (e) {
      console.error("Error creating library:", e);
    }
  };

  const removeLibrary = async (toRemove: string) => {
    if (updateHistory) {
      await updateHistory((prev: string[]) => {
        const next = prev.filter((p) => p !== toRemove);
        if (rootDir === toRemove) {
          setRootDir(next[0] ?? "");
        }
        return next;
      });
    }
  };

  const importImages = async () => {
    if (!rootDir) {
      console.warn("No active library selected.");
      return;
    }

    const selectedDirectory = await open({
      directory: true,
      multiple: false,
    });

    if (selectedDirectory) {
      try {
        const importResult: LibraryImportResult = await invoke(
          "import_images",
          {
            sourceDir: selectedDirectory as string,
            destDir: rootDir,
          }
        );

        const { folders, images, path_to_id } = importResult;

        /*  console.log(importedImagesData)
        if (importedImagesData.length > 0) {
          await insertImages(`${rootDir}/library.db`, importedImagesData);
          console.log(
            `Successfully imported and inserted ${importedImagesData.length} images.`
          );
        } else {
          console.log("No images were imported.");
        } */

        // 1. Insert folders first. We will rely on the Rust backend
        // to correctly set the parent_id, but we'll do a final check.
        await insertFolders(`${rootDir}/library.db`, folders);

        console.log("folders:", folders);

        // 2. Insert images
        await insertImages(`${rootDir}/library.db`, images);

        console.log("images:", images);

        /*   const links = images
           .map((img) => {
             const folderId = path_to_id[img.parent_dir_path];
             const imageId = path_to_id[img.source_path]; // Use source_path for lookup

         console.log(folderId)
         console.log(imageId)

           }); 
           console.log(links) */

        // 3. Create the links using the map
        const links = images
          .map((img) => {
            const folderId = path_to_id[img.parent_dir_path];
            const imageId = path_to_id[img.source_path]; // Use source_path for lookup

            if (folderId && imageId) {
              return {
                folder_id: folderId,
                image_id: imageId,
              };
            }
            return null;
          })
          .filter((link) => link !== null);

        console.log("links:", links);

        await linkImagesToFolders(`${rootDir}/library.db`, links);

        console.log("Library import complete.");
      } catch (e) {
        console.error("Failed to import images:", e);
      }
    }
  };

  const currentLibraryName = getLibraryName(rootDir);

  return {
    //UI Friendly
    rootDir,
    history,
    currentLibraryName,
    // Logic
    importImages,
    selectLibrary,
    createNewLibrary,
    removeLibrary,
  };
}

