import { invoke } from "@tauri-apps/api/core";
import { useSetting } from "./useSettings";
import { open} from "@tauri-apps/plugin-dialog";
import { getLibraryName } from "@/lib/utils";
import { getDb, ImageRecord,  insertFolders,  insertImages, linkImagesToFolders } from "@/lib/db";
import { FolderImportData, LibraryImportResult } from "@/types";



export function useLibrary() {
  const [rootDir, setRootDir] = useSetting("rootDir", "");
  const [libraryHistory, setLibraryHistory, updateLibraryHistory] = useSetting(
    "libraryHistory",
    []
  );


  const handleLibrarySelect = async (path: string) => {
    // Check if the path is different to avoid unnecesary writes
    if (path !== rootDir) {
      await setRootDir(path);

      // Add selected path to the top of the history
      if (updateLibraryHistory) {
        await updateLibraryHistory((currentHistory) => {
          const filteredHistory = currentHistory.filter((p) => p !== path);
          return [path, ...filteredHistory];
        });
      }
    }
  };

  const createNewLibrary = async () => {
    // TODO: Use custom dialog from frontend
    const libraryName = prompt("Please enter a name for your new library:");

    if (!libraryName) return;

    const selectedDirectory = await open({
      directory: true,
      multiple: false,
    });

    // Check if the user selected a directory
    if (selectedDirectory) {
      const newLibraryPath = `${selectedDirectory}/${libraryName}.library`;

      try {
        const returnedDbPath = await invoke("create_library", { libraryPath: newLibraryPath });

        if (typeof returnedDbPath === "string") {
   
          await getDb(returnedDbPath)

          // Run and apply migrations to selected library database 
          await invoke("run_migrations", { dbPath: returnedDbPath });
          
          console.log(
            "New library created, migrations applied."
          );

          await handleLibrarySelect(newLibraryPath);
        } else {
          throw new Error("create_library did not return a valid path");
        }
      } catch (e) {
        console.error("Failed to create a new library", e);
      }
    }
  };

  const removeLibrary = async (pathToRemove: string) => {
    if (libraryHistory) {
      const newHistory = libraryHistory.filter((p) => p !== pathToRemove);
      await setLibraryHistory(newHistory);

      if (rootDir === pathToRemove) {
        await setRootDir(newHistory[0] || "");
      }
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

        const { folders, images, path_to_id} = importResult;

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
    libraryHistory,
    currentLibraryName,
    // Logic
    importImages,
    handleLibrarySelect,
    createNewLibrary,
    removeLibrary,
  };
}

