import { invoke } from "@tauri-apps/api/core";
import { useSetting } from "./useSettings";
import { open} from "@tauri-apps/plugin-dialog";
import { getLibraryName } from "../lib/utils";
import Database from "@tauri-apps/plugin-sql";

export function useLibrary() {
  const [rootDir, setRootDir] = useSetting("rootDir", "");
  const [libraryHistory, setLibraryHistory, updateLibraryHistory] = useSetting(
    "libraryHistory",
    []
  );

  // A helper function to load and migrate the database
  const loadAndMigrateDb = async (dbPath: string) => {
    // The load() function will create the file and run migrations if it's new
    const db = await Database.load(`sqlite:${dbPath}`);
    
    console.log(`Successfully connected to and migrated database at ${dbPath}`);
    return db;
  };

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
    // TODO: Use a custom dialog from frontend
    const libraryName = prompt("Please enter a name for your new library:");

    if (!libraryName) return;

    // Open a native directory dialog
    const selectedDirectory = await open({
      directory: true,
      multiple: false,
    });

    // Check if the user selected a directory
    if (selectedDirectory) {
      const newLibraryPath = `${selectedDirectory}/${libraryName}.library`;

      try {
        const dbPath = await invoke("create_library", { libraryPath: newLibraryPath });

        // Ensure dbPath is a string before using it
        if (typeof dbPath === "string") {
          // Now, use the returned path to load the database and apply migrations
          await loadAndMigrateDb(dbPath);
          await handleLibrarySelect(newLibraryPath);
        } else {
          throw new Error("create_library did not return a string path");
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
        const importedCount = await invoke<number>("import_images", {
          sourceDir: selectedDirectory as string,
          destDir: rootDir,
        });
        console.log(`Successfully imported ${importedCount} images.`);
        // TODO: Show message on UI
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