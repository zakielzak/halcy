import { invoke } from "@tauri-apps/api/core";
import { useSetting } from "./useSettings";
import { open} from "@tauri-apps/plugin-dialog";
import { getLibraryName } from "@/lib/utils";
import { getDb, ImageRecord, insertImage, insertImages } from "@/lib/db";



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
       /*  
          const testImage = {
            filename: "test_image.jpg",
            path: "C:\\images\\test_image.jpg",
            width: "1920",
            heigth: "1080",
          };

          await insertImage(returnedDbPath, testImage) */

          
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
        const importedPaths = await invoke<string[]>("import_images", {
          sourceDir: selectedDirectory as string,
          destDir: rootDir,
        });

        const imagesToInsert: Omit<ImageRecord, "id">[] = importedPaths.map(
          (path) => {
            return {
              filename: path.split("/").pop() || "",
              path: path,
              width: "1920",
              heigth: "1080",
            };
          }
        );

        if (imagesToInsert.length > 0) {
          await insertImages(`${rootDir}/library.db`, imagesToInsert);
          console.log(
            `Successfully imported and inserted ${imagesToInsert.length} images.`
          );
        } else {
          console.log("No images were imported.");
        }
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